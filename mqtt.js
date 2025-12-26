let client = null;
let disconnectTimer = null;

export const publishMessage = async (message) => {
  const config = await import('./db.js').then(m => m.getConfig());
  if (!config) throw new Error('MQTT配置未设置');

  const { host, path, username, password, clientId, topic } = config;

  if (!client || client.disconnected) {
    client = new Paho.MQTT.Client(host, parseInt(path.split(':')[1]), path.split('/')[1], clientId);
    
    return new Promise((resolve, reject) => {
      client.connect({
        useSSL: true,
        userName: username,
        password: password,
        onSuccess: () => {
          const payload = new Paho.MQTT.Message(JSON.stringify(message));
          payload.destinationName = topic;
          payload.qos = 1;
          client.send(payload);
          resolve();
          // Auto disconnect after 10s
          clearTimeout(disconnectTimer);
          disconnectTimer = setTimeout(() => client.disconnect(), 10000);
        },
        onFailure: (err) => reject(new Error('MQTT连接失败')),
        timeout: 5
      });
    });
  } else {
    const payload = new Paho.MQTT.Message(JSON.stringify(message));
    payload.destinationName = topic;
    payload.qos = 1;
    client.send(payload);
    clearTimeout(disconnectTimer);
    disconnectTimer = setTimeout(() => client.disconnect(), 10000);
  }
};

// Load Paho MQTT
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.1.0/paho-mqtt.min.js';
document.head.appendChild(script);