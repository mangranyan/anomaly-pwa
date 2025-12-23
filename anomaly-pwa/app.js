// 路由切换
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// 解析 URL 参数
function getUrlParams(url) {
  try {
    const params = new URLSearchParams(url.startsWith('?') ? url.slice(1) : url);
    return {
      product: params.get('product') || '',
      line: params.get('line') || '',
      station: params.get('station') || ''
    };
  } catch (e) {
    return { product: '', line: '', station: '' };
  }
}

// 本地存储 key
const MQTT_CONFIG_KEY = 'mqttConfig';
const DRAFT_FORM_KEY = 'draftForm';

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  // 绑定导航
  document.getElementById('scanBtn').onclick = startScan;
  document.getElementById('gotoQrGen').onclick = () => showPage('qrcode-gen');
  document.getElementById('gotoMqttConfig').onclick = () => {
    loadMqttConfig();
    showPage('mqtt-config');
  };
  document.getElementById('backFromForm').onclick = () => showPage('home');
  document.getElementById('backFromQr').onclick = () => showPage('home');
  document.getElementById('backFromConfig').onclick = () => showPage('home');

  // 表单页初始化
  initFormPage();

  // 二维码生成
  document.getElementById('generateQrBtn').onclick = generateQrCode;

  // MQTT 测试
  document.getElementById('testMqttBtn').onclick = testMqttConnection;

  // 检查是否从扫码进入
  const urlParams = getUrlParams(window.location.search);
  if (urlParams.product || urlParams.line || urlParams.station) {
    sessionStorage.setItem('formData', JSON.stringify(urlParams));
    showPage('form');
    fillForm(urlParams);
  }
});

// 扫码功能
let html5QrCode = null;
function startScan() {
  const scannerContainer = document.createElement('div');
  scannerContainer.id = 'qr-scanner';
  scannerContainer.style.position = 'fixed';
  scannerContainer.style.top = '0';
  scannerContainer.style.left = '0';
  scannerContainer.style.width = '100%';
  scannerContainer.style.height = '100%';
  scannerContainer.style.backgroundColor = 'black';
  scannerContainer.style.zIndex = '2000';
  document.body.appendChild(scannerContainer);

  html5QrCode = new Html5Qrcode("qr-scanner");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (decodedText) => {
      html5QrCode.stop().then(() => {
        document.body.removeChild(scannerContainer);
        try {
          const params = getUrlParams(decodedText);
          if (params.product || params.line || params.station) {
            sessionStorage.setItem('formData', JSON.stringify(params));
            fillForm(params);
            showPage('form');
          } else {
            alert('二维码格式无效，请使用 ?product=...&line=...&station=...');
          }
        } catch (e) {
          alert('解析失败');
        }
      });
    },
    (errorMessage) => {
      // 扫码错误（通常可忽略）
    }
  ).catch((err) => {
    alert('无法启动摄像头，请允许权限并重试');
    document.body.removeChild(scannerContainer);
  });
}

// 填充表单
function fillForm(data) {
  document.getElementById('product').textContent = data.product;
  document.getElementById('line').textContent = data.line;
  document.getElementById('station').textContent = data.station;
}

// 初始化表单页
function initFormPage() {
  const categories = ['设备类异常', '制程类异常', '安全类异常', '其他'];
  const group = document.getElementById('categoryGroup');
  let selectedCategory = categories[0];
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick = () => {
      selectedCategory = cat;
      document.querySelectorAll('#categoryGroup button').forEach(b => b.style.background = '#007bff');
      btn.style.background = '#0056b3';
    };
    if (cat === selectedCategory) btn.style.background = '#0056b3';
    group.appendChild(btn);
  });

  // 检查草稿
  const draft = localStorage.getItem(DRAFT_FORM_KEY);
  if (draft) {
    if (confirm('检测到未提交草稿，是否恢复？')) {
      const d = JSON.parse(draft);
      const formData = JSON.parse(sessionStorage.getItem('formData') || '{}');
      fillForm(formData);
      document.getElementById('description').value = d.description || '';
      // 这里简化：类别恢复需额外逻辑，略
    } else {
      localStorage.removeItem(DRAFT_FORM_KEY);
    }
  }

  // 提交
  document.getElementById('submitBtn').onclick = () => submitForm(selectedCategory);
}

// 提交表单
async function submitForm(category) {
  const formDataStr = sessionStorage.getItem('formData');
  if (!formDataStr) {
    alert('缺少工站信息，请重新扫码');
    return;
  }
  const formData = JSON.parse(formDataStr);
  const description = document.getElementById('description').value.trim();

  const config = localStorage.getItem(MQTT_CONFIG_KEY);
  if (!config) {
    alert('请先配置 MQTT！');
    showPage('mqtt-config');
    return;
  }
  const mqttConf = JSON.parse(config);

  const payload = {
    header: {},
    body: {
      things: [{
        id: "",
        items: [{
          quality: {},
          properties: {
            product: formData.product,
            line: formData.line,
            workstation: formData.station,
            exception_type: category,
            exception_description: description
          }
        }]
      }]
    }
  };

  showLoading(true);
  try {
    await publishMqtt(mqttConf, JSON.stringify(payload, null, 2));
    showLoading(false);
    alert('提交成功！');
    localStorage.removeItem(DRAFT_FORM_KEY);
    setTimeout(() => {
      showPage('home');
    }, 3000);
  } catch (err) {
    showLoading(false);
    // 保存草稿
    localStorage.setItem(DRAFT_FORM_KEY, JSON.stringify({
      category,
      description,
      timestamp: new Date().toISOString()
    }));
    alert(`提交失败，请检查网络\n${err.message}`);
  }
}

// MQTT 发布
function publishMqtt(config, message) {
  return new Promise((resolve, reject) => {
    const client = new Paho.MQTT.Client(config.domain, parseInt(config.port), "/mqtt", config.clientId);
    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        reject(new Error(responseObject.errorMessage || '连接丢失'));
      }
    };
    client.onMessageDelivered = () => {
      client.disconnect();
      resolve();
    };
    const connectOptions = {
      onSuccess: () => {
        const topic = config.topic;
        const messageObj = new Paho.MQTT.Message(message);
        messageObj.destinationName = topic;
        client.send(messageObj);
      },
      onFailure: (error) => {
        reject(new Error(error.errorMessage || '连接失败'));
      },
      userName: config.username,
      password: config.password,
      keepAliveInterval: 60,
      timeout: 5
    };
    client.connect(connectOptions);
  });
}

// 生成二维码
function generateQrCode() {
  const product = document.getElementById('qrProduct').value.trim();
  const line = document.getElementById('qrLine').value.trim();
  const station = document.getElementById('qrStation').value.trim();
  if (!product || !line || !station) {
    alert('请填写完整信息');
    return;
  }
  const url = `?product=${encodeURIComponent(product)}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}`;
  const container = document.getElementById('qrcodeContainer');
  container.innerHTML = '';
  const qr = new QRCode(container, {
    text: url,
    width: 200,
    height: 200
  });

  // 生成下载链接
  const canvas = container.querySelector('canvas');
  if (canvas) {
    const link = document.getElementById('downloadQrLink');
    link.href = canvas.toDataURL('image/png');
    link.download = 'workstation_qr.png';
    link.style.display = 'block';
    link.textContent = '⬇ 下载二维码';
  }
}

// MQTT 配置
function loadMqttConfig() {
  const config = localStorage.getItem(MQTT_CONFIG_KEY);
  if (config) {
    const c = JSON.parse(config);
    document.getElementById('domain').value = c.domain || '';
    document.getElementById('port').value = c.port || '8083';
    document.getElementById('username').value = c.username || '';
    document.getElementById('password').value = c.password || '';
    document.getElementById('clientId').value = c.clientId || 'anomaly_client_1';
    document.getElementById('topic').value = c.topic || '';
  }
}

function testMqttConnection() {
  const config = {
    domain: document.getElementById('domain').value.trim(),
    port: document.getElementById('port').value.trim(),
    username: document.getElementById('username').value.trim(),
    password: document.getElementById('password').value.trim(),
    clientId: document.getElementById('clientId').value.trim(),
    topic: document.getElementById('topic').value.trim()
  };

  if (!config.domain || !config.port || !config.clientId || !config.topic) {
    alert('请填写完整配置');
    return;
  }

  localStorage.setItem(MQTT_CONFIG_KEY, JSON.stringify(config));

  const resultDiv = document.getElementById('mqttResult');
  resultDiv.textContent = '连接中...';
  resultDiv.style.color = 'orange';

  const client = new Paho.MQTT.Client(config.domain, parseInt(config.port), "/mqtt", config.clientId);
  client.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      resultDiv.textContent = `失败: ${responseObject.errorMessage || '未知错误'}`;
      resultDiv.style.color = 'red';
    }
  };
  client.onMessageDelivered = () => {
    client.disconnect();
  };
  const connectOptions = {
    onSuccess: () => {
      resultDiv.textContent = '✅ 连接成功！';
      resultDiv.style.color = 'green';
      client.disconnect();
    },
    onFailure: (error) => {
      resultDiv.textContent = `失败: ${error.errorMessage || '连接被拒绝'}`;
      resultDiv.style.color = 'red';
    },
    userName: config.username,
    password: config.password,
    timeout: 5
  };
  client.connect(connectOptions);
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW failed:', err));
  });
}