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

// 页面隐藏时断开
window.addEventListener('pagehide', () => {
  if (client && client.isConnected()) {
    client.disconnect();
    client = null;
  }
  if (disconnectTimer) clearTimeout(disconnectTimer);
});