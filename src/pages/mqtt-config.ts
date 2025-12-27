import { saveMqttConfig, loadMqttConfig } from '../utils/db';
import { getMqttClient } from '../utils/mqtt-client';

// 硬编码的门禁密码（仅用于运行时比对）
const ADMIN_PASSWORD = 'shokz@2025';

export async function renderMqttConfig() {
  const app = document.getElementById('app')!;

  // 每次进入都要求输入门禁密码（无缓存、无状态）
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
      // 验证通过，直接渲染配置表单（不调用自身递归）
      await renderMqttConfigForm();
    } else {
      document.getElementById('msg')!.innerText = '密码错误';
    }
  };
}

async function renderMqttConfigForm() {
  const app = document.getElementById('app')!;

  // 加载已保存的配置，若无则使用默认值（含正确 MQTT 密码）
  const saved = await loadMqttConfig();
  const config = saved || {
    host: 'wss://mqtt-broker.shokz.com.cn:8084/mqtt',
    username: 'Ml3rqYX5cPN',
    password: '6jKFfGiqxjj', // ← 关键：MQTT 连接密码
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
    const host = (document.getElementById('host') as HTMLInputElement).value;
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const clientId = (document.getElementById('clientId') as HTMLInputElement).value;
    const topic = (document.getElementById('topic') as HTMLInputElement).value;

    // 保存完整配置（含密码），供后续连接使用
    await saveMqttConfig({ host, username, password, clientId, topic });

    const resultEl = document.getElementById('result')!;
    resultEl.innerHTML = '<div class="spinner" style="margin:auto;"></div>';
    try {
      await getMqttClient();
      resultEl.innerHTML = '<span style="color:#10B981;">✅ 连接成功</span>';
    } catch (err: any) {
      let msg = '❌ 连接失败';
      if (err.message.includes('认证')) msg = '❌ 认证失败';
      else if (err.message.includes('timeout')) msg = '❌ 连接超时';
      else msg = '❌ 网络不可达';
      resultEl.innerHTML = msg;
    }
  };
}