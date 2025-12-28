// src/pages/mqtt-config.ts
import { saveMqttConfig, loadMqttConfig } from '../utils/db';
import { testMqttConnection } from '../utils/mqtt-client'; // 👈 改为导入 test 函数

// 硬编码的门禁密码（仅用于运行时比对）
const ADMIN_PASSWORD = 'shokz@2025';

export async function renderMqttConfig() {
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <div class="card" style="max-width: 90%; margin: 40px auto;">
      <h1>管理员验证</h1>
      <input id="pwd" type="password" placeholder="请输入管理员密码" style="width:100%;">
      <button id="submit" class="btn btn-primary" style="width:100%; margin-top:16px;">确认</button>
      <div id="msg" class="text-sm" style="margin-top:8px; text-align:center;"></div>
    </div>
  `;

  document.getElementById('submit')!.onclick = async () => {
    const pwd = (document.getElementById('pwd') as HTMLInputElement).value;
    if (pwd === ADMIN_PASSWORD) {
      await renderMqttConfigForm();
    } else {
      document.getElementById('msg')!.innerText = '密码错误';
    }
  };
}

async function renderMqttConfigForm() {
  const app = document.getElementById('app')!;

  const saved = await loadMqttConfig();
  const config = saved || {
    host: 'wss://mqtt-broker.shokz.com.cn:8084/mqtt',
    username: 'Ml3rqYX5cPN',
    password: '6jKFfGiqxjj',
    clientId: 'Ml3rqYX5cPN',
    topic: 'v4/p/post/thing/live/json/1.1'
  };

  app.innerHTML = `
    <div class="card" style="max-width: 90%; margin: 20px auto;">
      <h1>MQTT 配置</h1>
      <label>地址 <input id="host" value="${config.host}"></label>
      <label>用户名 <input id="username" value="${config.username}"></label>
      <label>密码 <input id="password" type="password" value="${config.password}"></label>
      <label>Client ID <input id="clientId" value="${config.clientId}"></label>
      <label>Topic <input id="topic" value="${config.topic}"></label>
      <button id="testBtn" class="btn btn-primary" style="width:100%; margin-top:24px;">联通测试</button>
      <div id="result" class="text-sm" style="margin-top:12px; text-align:center;"></div>
    </div>
  `;

  document.getElementById('testBtn')!.onclick = async () => {
    const host = (document.getElementById('host') as HTMLInputElement).value.trim();
    const username = (document.getElementById('username') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const clientId = (document.getElementById('clientId') as HTMLInputElement).value.trim();
    const topic = (document.getElementById('topic') as HTMLInputElement).value.trim();

    if (!host || !username || !password || !clientId || !topic) {
      document.getElementById('result')!.innerHTML = '<span style="color:#EF4444;">❌ 请填写所有字段</span>';
      return;
    }

    // 先保存配置（供后续表单提交使用）
    await saveMqttConfig({ host, username, password, clientId, topic });

    const resultEl = document.getElementById('result')!;
    resultEl.innerHTML = '<div class="spinner" style="margin:auto;"></div>';

    try {
      // ✅ 使用当前输入值进行独立测试
      await testMqttConnection({ host, username, password, clientId });
      resultEl.innerHTML = '<span style="color:#10B981;">✅ 连接成功</span>';
    } catch (err: any) {
      let msg = '❌ 连接失败';
      if (err.message.includes('认证') || err.message.includes('Not authorized')) {
        msg = '❌ 认证失败（用户名或密码错误）';
      } else if (err.message.includes('timeout') || err.message.includes('超时')) {
        msg = '❌ 连接超时（检查地址或网络）';
      } else if (err.message.includes('network') || err.message.includes('Network')) {
        msg = '❌ 网络不可达';
      } else {
        msg = `❌ ${err.message}`;
      }
      resultEl.innerHTML = msg;
    }
  };
}