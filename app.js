// 全局状态
let mqttClient = null;
let currentDraft = null;
let qrCodeInstance = null;

// 路由控制
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`.nav-item[href="#${pageId}"]`)?.classList.add('active');
}

// 初始化路由
function initRouting() {
  const hash = window.location.hash || '#home';
  if (hash === '#form') {
    // 非法访问表单页 → 重定向
    window.location.hash = '#home';
    return;
  }
  showPage(hash.replace('#', ''));
}

// 草稿管理
function saveDraft(data) {
  localStorage.setItem('draftForm', JSON.stringify({ ...data, timestamp: Date.now() }));
}
function loadDraft() {
  const draft = localStorage.getItem('draftForm');
  return draft ? JSON.parse(draft) : null;
}
function clearDraft() {
  localStorage.removeItem('draftForm');
}

// MQTT 连接
function getMqttConfig() {
  return JSON.parse(localStorage.getItem('mqttConfig') || '{}');
}
function saveMqttConfig(config) {
  localStorage.setItem('mqttConfig', JSON.stringify(config));
}

function connectMqtt(onSuccess, onError) {
  const config = getMqttConfig();
  if (!config.host || !config.port || !config.topic) {
    onError?.('MQTT 配置不完整');
    return;
  }

  const clientId = config.clientId || `line-reporter-${Date.now()}`;
  const url = `ws://${config.host}:${config.port}/mqtt`;
  mqttClient = new Paho.MQTT.Client(url, clientId);

  mqttClient.onConnectionLost = (responseObject) => {
    console.error('MQTT 连接断开:', responseObject.errorMessage);
    onError?.('连接断开：' + (responseObject.errorMessage || '未知错误'));
  };

  mqttClient.onMessageDelivered = () => {
    console.log('消息已送达');
  };

  const connectOptions = {
    onSuccess: () => {
      console.log('MQTT 连接成功');
      onSuccess?.();
    },
    onFailure: (err) => {
      console.error('MQTT 连接失败:', err);
      onError?.('连接失败：' + (err.errorMessage || '未知错误'));
    },
    useSSL: false,
  };

  if (config.username && config.password) {
    connectOptions.userName = config.username;
    connectOptions.password = config.password;
  }

  try {
    mqttClient.connect(connectOptions);
  } catch (e) {
    onError?.('连接异常：' + e.message);
  }
}

// 提交异常
async function submitException(data) {
  return new Promise((resolve, reject) => {
    if (!mqttClient || mqttClient.isConnected() === false) {
      reject('MQTT 未连接');
      return;
    }

    const message = {
      header: {},
      body: {
        things: [{
          id: "",
          items: [{
            quality: {},
            properties: {
              product: data.product || "",
              line: data.line || "",
              workstation: data.station || "",
              exception_type: data.category || "其他",
              exception_description: data.description || ""
            }
          }]
        }]
      }
    };

    const payload = JSON.stringify(message);
    const topic = getMqttConfig().topic;
    const mqttMessage = new Paho.MQTT.Message(payload);
    mqttMessage.destinationName = topic;
    mqttMessage.qos = 1;

    mqttClient.send(mqttMessage);
    resolve();
  });
}

// 页面逻辑
document.addEventListener('DOMContentLoaded', async () => {
  // 注册 SW
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }

  // 路由监听
  window.addEventListener('hashchange', initRouting);
  initRouting();

  // 扫码按钮
  document.getElementById('scanBtn').addEventListener('click', async () => {
    const reader = document.getElementById('reader');
    reader.innerHTML = '';
    reader.style.display = 'block';

    const html5QrCode = new Html5Qrcode("reader");
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5QrCode.stop().then(() => {
            reader.style.display = 'none';
            try {
              const urlParams = new URLSearchParams(decodedText.startsWith('?') ? decodedText : '');
              const product = urlParams.get('product');
              const line = urlParams.get('line');
              const station = urlParams.get('station');
              if (product && line && station) {
                // 跳转并填充
                window.location.hash = '#form';
                setTimeout(() => {
                  document.getElementById('product').value = product;
                  document.getElementById('line').value = line;
                  document.getElementById('station').value = station;
                }, 100);
              } else {
                alert('二维码格式无效');
              }
            } catch (e) {
              alert('二维码解析失败');
            }
          }).catch(console.error);
        },
        (errorMessage) => {
          console.log('扫码错误:', errorMessage);
        }
      );
    } catch (err) {
      alert('无法启动摄像头，请检查权限');
    }
  });

  // 表单页草稿检测
  if (window.location.hash === '#form') {
    const draft = loadDraft();
    if (draft) {
      if (confirm('检测到未提交草稿，是否恢复？')) {
        document.getElementById('product').value = draft.product;
        document.getElementById('line').value = draft.line;
        document.getElementById('station').value = draft.station;
        document.querySelector(`input[name="category"][value="${draft.category}"]`)?.click();
        document.getElementById('description').value = draft.description;
      } else {
        clearDraft();
      }
    }
  }

  // 提交按钮
  document.getElementById('submitBtn').addEventListener('click', async () => {
    const btn = document.getElementById('submitBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '提交中…';

    const data = {
      product: document.getElementById('product').value,
      line: document.getElementById('line').value,
      station: document.getElementById('station').value,
      category: document.querySelector('input[name="category"]:checked')?.value || '其他',
      description: document.getElementById('description').value.trim()
    };

    try {
      await connectMqtt(
        async () => {
          await submitException(data);
          alert('提交成功');
          clearDraft();
          setTimeout(() => {
            window.location.hash = '#home';
          }, 3000);
        },
        (err) => {
          saveDraft(data);
          alert('提交失败，请检查网络设置\n错误：' + err);
          btn.disabled = false;
          btn.textContent = originalText;
        }
      );
    } catch (e) {
      saveDraft(data);
      alert('提交失败，请检查网络设置');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // 生成二维码
  document.getElementById('genQrBtn').addEventListener('click', () => {
    const product = document.getElementById('genProduct').value.trim();
    const line = document.getElementById('genLine').value.trim();
    const station = document.getElementById('genStation').value.trim();
    if (!product || !line || !station) {
      alert('请填写完整信息');
      return;
    }
    const query = `?product=${encodeURIComponent(product)}&line=${encodeURIComponent(line)}&station=${encodeURIComponent(station)}`;
    const container = document.getElementById('qrcodeContainer');
    container.innerHTML = '';
    qrCodeInstance = new QRCode(container, {
      text: query,
      width: 200,
      height: 200
    });
    document.getElementById('downloadBtn').style.display = 'block';
  });

  // 下载二维码
  document.getElementById('downloadBtn').addEventListener('click', () => {
    const canvas = document.querySelector('#qrcodeContainer canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'workstation-qrcode.png';

    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    } else {
      // Fallback for older Android WebView
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  });

  // 加载 MQTT 配置
  const config = getMqttConfig();
  document.getElementById('mqttHost').value = config.host || '';
  document.getElementById('mqttPort').value = config.port || '8083';
  document.getElementById('mqttUsername').value = config.username || '';
  document.getElementById('mqttPassword').value = config.password || '';
  document.getElementById('mqttClientId').value = config.clientId || `line-reporter-${Date.now()}`;
  document.getElementById('mqttTopic').value = config.topic || '';

  // 测试 MQTT
  document.getElementById('testMqttBtn').addEventListener('click', () => {
    const newConfig = {
      host: document.getElementById('mqttHost').value.trim(),
      port: document.getElementById('mqttPort').value.trim(),
      username: document.getElementById('mqttUsername').value.trim(),
      password: document.getElementById('mqttPassword').value,
      clientId: document.getElementById('mqttClientId').value.trim(),
      topic: document.getElementById('mqttTopic').value.trim()
    };
    if (!newConfig.host || !newConfig.port || !newConfig.topic) {
      alert('请填写完整配置');
      return;
    }
    saveMqttConfig(newConfig);
    connectMqtt(
      () => alert('连接成功'),
      (err) => alert('连接失败：' + err)
    );
  });
});