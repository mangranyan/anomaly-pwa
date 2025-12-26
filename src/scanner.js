let codeReader = null;

export const startScan = async (onResult) => {
  const container = document.getElementById('scanner-container');
  const video = document.getElementById('qr-video');
  const closeBtn = document.getElementById('close-scanner');

  container.classList.remove('hidden');
  
  codeReader = new ZXing.BrowserQRCodeReader();
  
  closeBtn.onclick = () => {
    codeReader.reset();
    container.classList.add('hidden');
  };

  try {
    await codeReader.decodeFromVideoDevice(undefined, video, (result, err) => {
      if (result) {
        codeReader.reset();
        container.classList.add('hidden');
        onResult(result.getText());
      }
    });
  } catch (err) {
    alert('请允许摄像头权限以扫描二维码\n\n【重试】');
    container.classList.add('hidden');
  }
};

// Load ZXing
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@zxing/library@0.18.3/umd/index.min.js';
script.onload = () => {
  window.ZXing = ZXing;
};
document.head.appendChild(script);