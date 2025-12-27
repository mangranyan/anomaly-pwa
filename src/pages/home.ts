// src/pages/home.ts
import { BrowserMultiFormatReader } from '@zxing/browser';

let currentCodeReader: BrowserMultiFormatReader | null = null;

export function renderHome() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="card" style="max-width: 90%; margin: 40px auto;">
      <h1>欢迎使用异常提报App</h1>
      <button id="scanBtn" class="btn btn-primary" style="width:100%;">扫码提报异常</button>
      <div id="error" style="margin-top:16px; color:#EF4444; text-align:center;"></div>
    </div>
  `;

  document.getElementById('scanBtn')!.onclick = async () => {
    const codeReader = new BrowserMultiFormatReader();
    currentCodeReader = codeReader;

    try {
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) throw new Error('无摄像头');

      // 创建视频预览
      const preview = document.createElement('video');
      preview.id = 'zxing-preview';
      preview.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1000;
      `;
      document.body.appendChild(preview);

      // 创建取消按钮
      const cancelBtn = document.createElement('button');
      cancelBtn.innerText = '❌ 取消扫码';
      cancelBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1001;
        height: 50px;
        width: 80%;
        font-size: 18px;
        background: #EF4444;
        color: white;
        border: none;
        border-radius: 12px;
      `;
      cancelBtn.onclick = () => {
        cleanupScan(preview, cancelBtn);
        currentCodeReader = null;
      };
      document.body.appendChild(cancelBtn);

      const result = await codeReader.decodeOnceFromVideoDevice(undefined, preview);
      cleanupScan(preview, cancelBtn);

      const urlParams = new URLSearchParams(
        result.getText().startsWith('?') ? result.getText().substring(1) : result.getText()
      );
      const params: Record<string, string> = {};
      for (const [k, v] of urlParams.entries()) params[k] = v;

      sessionStorage.setItem('form-data', JSON.stringify(params));
      (window as any).navigateTo('/form');
    } catch (err: any) {
      console.error(err);
      cleanupScan(document.getElementById('zxing-preview'), document.querySelector('button[innerText="❌ 取消扫码"]'));
      currentCodeReader = null;
      document.getElementById('error')!.innerText = err.message.includes('NotAllowedError')
        ? '请允许摄像头权限'
        : '扫码失败，请重试';
    }
  };
}

// 清理扫码界面
function cleanupScan(video: Element | null, button: Element | null) {
  if (video) video.remove();
  if (button) button.remove();
  currentCodeReader?.reset();
}