// src/utils/mqtt-client.ts
import * as Paho from 'paho-mqtt';
import { loadMqttConfig } from './db';

let client: Paho.Client | null = null;
let disconnectTimer: NodeJS.Timeout | null = null;

export async function getMqttClient(): Promise<Paho.Client> {
  if (client && client.isConnected()) {
    resetDisconnectTimer();
    return client;
  }

  const config = await loadMqttConfig();
  if (!config) throw new Error('MQTT 配置未设置');

  client = new Paho.Client(config.host, '', config.clientId);

  return new Promise((resolve, reject) => {
    client!.onConnectionLost = (responseObject) => {
      console.warn('MQTT 连接断开:', responseObject.errorMessage);
      client = null;
    };

    client!.onMessageDelivered = () => {
      // QoS=1 已送达
    };

    const connectOptions = {
      onSuccess: () => {
        resetDisconnectTimer();
        resolve(client!);
      },
      onFailure: (err: any) => {
        client = null;
        reject(new Error(err.errorMessage || '连接失败'));
      },
      userName: config.username,
      password: config.password,
      keepAliveInterval: 10,
      timeout: 5,
      cleanSession: true
    };

    client.connect(connectOptions);
  });
}

function resetDisconnectTimer() {
  if (disconnectTimer) clearTimeout(disconnectTimer);
  disconnectTimer = setTimeout(() => {
    if (client && client.isConnected()) {
      client.disconnect();
      client = null;
    }
  }, 10000);
}

export async function publishMessage(payload: any): Promise<void> {
  const client = await getMqttClient();
  const config = await loadMqttConfig();
  if (!config) throw new Error('配置缺失');

  return new Promise((resolve, reject) => {
    const message = new Paho.Message(JSON.stringify(payload));
    message.destinationName = config.topic;
    message.qos = 1;
    message.onSuccess = resolve;
    message.onFailure = () => reject(new Error('发布失败'));
    client.send(message);
  });
}

// 👇 新增：用于独立测试连接（不复用全局 client）
export async function testMqttConnection(config: {
  host: string;
  username: string;
  password: string;
  clientId: string;
}): Promise<void> {
  const tempClientId = `${config.clientId}_test_${Date.now()}`;
  const client = new Paho.Client(config.host, '', tempClientId);

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (client.isConnected()) {
        client.disconnect();
      }
      reject(new Error('连接超时'));
    }, 5000); // 5秒超时

    client.onConnectionLost = (responseObject) => {
      clearTimeout(timeoutId);
      const err = responseObject.errorMessage || '连接意外断开';
      reject(new Error(err));
    };

    client.connect({
      onSuccess: () => {
        clearTimeout(timeoutId);
        client.disconnect(); // 测试完立即断开，不污染生产连接
        resolve();
      },
      onFailure: (err) => {
        clearTimeout(timeoutId);
        reject(new Error(err.errorMessage || '连接失败'));
      },
      userName: config.username,
      password: config.password,
      keepAliveInterval: 10,
      timeout: 5,
      cleanSession: true
    });
  });
}

// 页面隐藏时断开
window.addEventListener('pagehide', () => {
  if (client && client.isConnected()) {
    client.disconnect();
    client = null;
  }
  if (disconnectTimer) clearTimeout(disconnectTimer);
});