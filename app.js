// app.js

let currentParams = null;

const routes = {
  '/': { render: renderHome, bindEvents: bindHomeEvents },
  '/qr-gen': { render: renderQRGen, bindEvents: bindQRGenEvents },
  '/mqtt-config': { render: renderMQTTConfig, bindEvents: bindMQTTConfigEvents },
  '/form': { render: renderForm, bindEvents: bindFormEvents }
};

window.addEventListener('hashchange', navigate);
navigate();

function navigate() {
  const path = location.hash.slice(1) || '/';
  
  if (path === '/form' && !currentParams) {
    location.hash = '/';
    return;
  }

  const route = routes[path] || routes['/'];
  
  // 1. 渲染 HTML
  document.getElementById('app').innerHTML = route.render();
  
  // 2. 绑定事件（关键！）
  if (typeof route.bindEvents === 'function') {
    route.bindEvents();
  }

  // 3. 隐藏底部导航（如果是表单页）
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.classList.toggle('hidden', path === '/form');
  }
}

// ======================
// 页面渲染函数（只返回 HTML 字符串）
// ======================

function renderHome() {
  return `
    <div class="p-6 pt-12 max-w-md mx-auto">
      <h1 class="text-2xl font-bold text-primary mb-10 text-center">异常提报</h1>
      <button id="scan-btn" class="w-full h-16 bg-primary text-white rounded-xl text-lg font-bold shadow-md active:bg-[#1D4ED8] transform active:scale-95 transition flex items-center justify-center gap-3">
        扫码提报异常
      </button>
    </div>
  `;
}

function renderQRGen() {
  return `
    <div class="p-4 pt-6 max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-4 text-center">生成异常二维码</h2>
      <div class="flex mb-6 rounded-lg overflow-hidden border">
        <button id="tab-device" class="flex-1 py-3 bg-blue-100 text-primary font-medium">设备异常</button>
        <button id="tab-process" class="flex-1 py-3 bg-gray-100 text-gray-600 font-medium">制程异常</button>
      </div>
      <div id="form-fields" class="space-y-4 mb-8"></div>
      <button id="gen-btn" class="w-full h-14 bg-primary text-white rounded-xl font-bold mb-6">生成二维码</button>
      <div id="qr-output" class="hidden flex flex-col items-center">
        <div id="qr-canvas-container" class="w-64 h-64 mb-4 flex items-center justify-center"></div>
        <button id="download-btn" class="border border-primary text-primary px-6 py-2 rounded-lg font-medium">下载 PNG</button>
      </div>
    </div>
  `;
}

function renderMQTTConfig() {
  return `
    <div class="p-4 pt-6 max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-6 text-center">MQTT 配置</h2>
      <div id="password-prompt" class="mb-6">
        <label class="block text-gray-700 mb-2">请输入密码</label>
        <input type="password" id="config-pwd" class="w-full h-14 px-4 border border-gray-300 rounded-lg mb-4" placeholder="请输入密码">
        <button id="unlock-btn" class="w-full h-12 bg-secondary text-white rounded-lg font-medium">确认</button>
      </div>
      <div id="config-form" class="hidden space-y-4">
        <div><label class="block text-gray-700 mb-1">目标地址（WebSocket URL）</label>
        <input type="text" id="host-url" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="wss://mqtt-broker.shokz.com.cn:8084/mqtt"></div>
        <div><label class="block text-gray-700 mb-1">用户名</label>
        <input type="text" id="username" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="Ml3rqYX5cPN"></div>
        <div><label class="block text-gray-700 mb-1">密码</label>
        <input type="password" id="password" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="6jKFfGiqxjj"></div>
        <div><label class="block text-gray-700 mb-1">Client ID</label>
        <input type="text" id="clientId" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="Ml3rqYX5cPN"></div>
        <div><label class="block text-gray-700 mb-1">上报 Topic</label>
        <input type="text" id="topic" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="v4/p/post/thing/live/json/1.1"></div>
        <button id="test-btn" class="w-full h-12 bg-primary text-white rounded-lg font-medium mt-2">联通测试</button>
        <button id="save-btn" class="w-full h-12 bg-gray-700 text-white rounded-lg font-medium mt-2">保存配置</button>
      </div>
      <div class="text-xs text-gray-500 mt-8 pt-4 border-t">本应用仅用于内部异常提报，不收集个人身份信息。</div>
    </div>
  `;
}

async function renderForm() {
  const { getDraft, deleteDraft } = await import('./db.js');
  let draft = await getDraft();
  if (draft?.formData) {
    if (confirm('检测到未提交草稿，是否恢复？')) {
      currentParams = { ...currentParams, ...draft.formData };
    } else {
      await deleteDraft();
    }
  }

  const isDevice = currentParams.type === '设备类异常';
  const { escapeHtml } = await import('./utils.js');

  return `
    <div class="p-4 pt-6 max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-4 text-center">异常提报</h2>
      <div class="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
        <div><span class="text-gray-500 text-sm">产品</span><div class="font-medium">${escapeHtml(currentParams.product)}</div></div>
        <div><span class="text-gray-500 text-sm">产线</span><div class="font-medium">${escapeHtml(currentParams.line)}</div></div>
        <div><span class="text-gray-500 text-sm">工站</span><div class="font-medium">${escapeHtml(currentParams.station)}</div></div>
        <div><span class="text-gray-500 text-sm">异常类型</span><div class="font-medium">${escapeHtml(currentParams.type)}</div></div>
        ${isDevice ? `
          <div><span class="text-gray-500 text-sm">设备名称</span><div class="font-medium">${escapeHtml(currentParams.deviceName || 'N/A')}</div></div>
          <div><span class="text-gray-500 text-sm">资产编码</span><div class="font-medium">${escapeHtml(currentParams.assetCode || 'N/A')}</div></div>
        ` : ''}
      </div>
      <div class="space-y-4">
        <div><label class="block text-gray-700 mb-1">提报人 <span class="text-red-500">*</span></label>
        <input type="text" id="reporter" class="w-full h-14 px-4 border border-gray-300 rounded-lg text-base" placeholder="请输入姓名" required></div>
        <div><label class="block text-gray-700 mb-1">异常描述 <span class="text-red-500">*</span></label>
        <textarea id="desc" class="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg text-base" placeholder="请详细描述异常现象" required></textarea></div>
        ${!isDevice ? `
          <div><label class="block text-gray-700 mb-1">良率（如：95%）</label>
          <input type="text" id="yield" class="w-full h-14 px-4 border border-gray-300 rounded-lg text-base" placeholder="例：95%"></div>
          <div><label class="block text-gray-700 mb-1">临时处置措施</label>
          <textarea id="measure" class="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg text-base" placeholder="例：暂停该工位作业"></textarea></div>
        ` : ''}
        <button id="submit-btn" class="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg mt-2">提交</button>
      </div>
    </div>
  `;
}

// ======================
// 事件绑定函数（关键！）
// ======================

async function bindHomeEvents() {
  document.getElementById('scan-btn').onclick = async () => {
    const { startScan } = await import('./scanner.js');
    startScan(async (text) => {
      const { parseQrText } = await import('./utils.js');
      const params = parseQrText(text);
      if (!params || !params.product || !params.line || !params.station || !params.type) {
        alert('二维码格式错误：缺少必要参数');
        return;
      }
      window.currentParams = params;
      location.hash = '/form';
    });
  };
}

function bindQRGenEvents() {
  let currentType = 'device';

  function renderFields() {
    const container = document.getElementById('form-fields');
    container.innerHTML = `
      <div><label class="block text-gray-700 mb-1">产品</label>
      <input type="text" id="product" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：TWS耳机"></div>
      <div><label class="block text-gray-700 mb-1">线别</label>
      <input type="text" id="line" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：SMT-01"></div>
      <div><label class="block text-gray-700 mb-1">工站</label>
      <input type="text" id="station" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：AOI检测"></div>
      ${currentType === 'device' ? `
        <div><label class="block text-gray-700 mb-1">设备名称</label>
        <input type="text" id="deviceName" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：回流焊机"></div>
        <div><label class="block text-gray-700 mb-1">设备资产编码</label>
        <input type="text" id="assetCode" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：RFH-2025"></div>
      ` : ''}
    `;
  }

  document.getElementById('tab-device').onclick = () => {
    currentType = 'device';
    document.getElementById('tab-device').className = 'flex-1 py-3 bg-blue-100 text-primary font-medium';
    document.getElementById('tab-process').className = 'flex-1 py-3 bg-gray-100 text-gray-600 font-medium';
    renderFields();
  };

  document.getElementById('tab-process').onclick = () => {
    currentType = 'process';
    document.getElementById('tab-process').className = 'flex-1 py-3 bg-blue-100 text-primary font-medium';
    document.getElementById('tab-device').className = 'flex-1 py-3 bg-gray-100 text-gray-600 font-medium';
    renderFields();
  };

  renderFields();

  document.getElementById('gen-btn').onclick = async () => {
    const product = document.getElementById('product').value.trim();
    const line = document.getElementById('line').value.trim();
    const station = document.getElementById('station').value.trim();
    if (!product || !line || !station) {
      alert('请填写产品、线别、工站');
      return;
    }

    let query = `?product=${encodeURIComponent(product)}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}`;
    let bgColor = '#E8F5E9';

    if (currentType === 'device') {
      const deviceName = document.getElementById('deviceName').value.trim();
      const assetCode = document.getElementById('assetCode').value.trim();
      if (!deviceName || !assetCode) {
        alert('设备异常需填写设备名称和资产编码');
        return;
      }
      query += `&deviceName=${encodeURIComponent(deviceName)}&assetCode=${encodeURIComponent(assetCode)}&type=设备类异常`;
      bgColor = '#FFF9C4';
    } else {
      query += `&type=制程类异常`;
    }

    const { generateQRCanvas } = await import('./qrgen.js');
    const canvas = generateQRCanvas(query, bgColor);
    const container = document.getElementById('qr-canvas-container');
    container.innerHTML = '';
    container.appendChild(canvas);
    document.getElementById('qr-output').classList.remove('hidden');

    document.getElementById('download-btn').onclick = () => {
      canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '异常二维码.png';
        a.click();
      }, 'image/png');
    };
  };
}

async function bindMQTTConfigEvents() {
  document.getElementById('unlock-btn').onclick = async () => {
    const pwd = document.getElementById('config-pwd').value;
    if (pwd === 'shokz@2025') {
      document.getElementById('password-prompt').classList.add('hidden');
      document.getElementById('config-form').classList.remove('hidden');

      const { getConfig } = await import('./db.js');
      const config = await getConfig();
      if (config) {
        document.getElementById('host-url').value = config.hostUrl || 'wss://mqtt-broker.shokz.com.cn:8084/mqtt';
        document.getElementById('username').value = config.username || '';
        document.getElementById('password').value = config.password || '';
        document.getElementById('clientId').value = config.clientId || '';
        document.getElementById('topic').value = config.topic || '';
      }
    } else {
      alert('密码错误');
    }
  };

  document.getElementById('test-btn').onclick = async () => {
    const hostUrl = document.getElementById('host-url').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const clientId = document.getElementById('clientId').value;
    if (!hostUrl || !username || !password || !clientId) {
      alert('请填写完整配置');
      return;
    }

    try {
      const client = new Paho.MQTT.Client(
        hostUrl.replace('wss://', '').split(':')[0],
        parseInt(hostUrl.split(':')[2]),
        hostUrl.split('/')[3] || 'mqtt',
        clientId
      );
      await new Promise((resolve, reject) => {
        client.connect({
          useSSL: true,
          userName: username,
          password: password,
          onSuccess: () => {
            client.disconnect();
            resolve();
          },
          onFailure: (e) => reject(e),
          timeout: 5
        });
      });
      alert('✅ 连接成功');
    } catch (err) {
      let msg = '❌ 连接失败';
      if (err.errorCode === 4) msg = '❌ 认证失败';
      else if (err.errorMessage?.includes('timeout')) msg = '⏱️ 连接超时';
      else msg = '🌐 网络不可达';
      alert(msg);
    }
  };

  document.getElementById('save-btn').onclick = async () => {
    const config = {
      hostUrl: document.getElementById('host-url').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
      clientId: document.getElementById('clientId').value,
      topic: document.getElementById('topic').value
    };
    const { saveConfig } = await import('./db.js');
    await saveConfig(config);
    alert('✅ 配置已保存');
  };
}

async function bindFormEvents() {
  document.getElementById('submit-btn').onclick = async () => {
    const reporter = document.getElementById('reporter').value.trim();
    const desc = document.getElementById('desc').value.trim();
    if (!reporter || !desc) {
      alert('请填写提报人和异常描述');
      return;
    }

    const isDevice = currentParams.type === '设备类异常';
    const data = {
      product: currentParams.product,
      line: currentParams.line,
      workstation: currentParams.station,
      deviceName: isDevice ? (currentParams.deviceName || '') : '',
      assetCode: isDevice ? (currentParams.assetCode || '') : '',
      exception_type: currentParams.type,
      exception_description: desc,
      yieldRate: !isDevice ? (document.getElementById("yield")?.value.trim() || "") : "",
      temporaryMeasure: !isDevice ? (document.getElementById("measure")?.value.trim() || "") : ""
    };

    try {
      await import('./mqtt.js').then(m => m.publishMessage({
        header: {},
        body: {
          things: [{
            id: "",
            items: [{
              quality: {},
              properties: data
            }]
          }]
        }
      }));
      alert('✅ 提交成功');
      window.currentParams = null;
      setTimeout(() => location.hash = '/', 3000);
    } catch (err) {
      try {
        await import('./db.js').then(m => m.saveDraft({ formData: { ...data, reporter } }));
        alert('⚠️ 提交失败，请检查网络或 MQTT 配置\n（已保存草稿）');
      } catch (e) {
        alert('提交失败且草稿保存异常');
      }
    }
  };
}