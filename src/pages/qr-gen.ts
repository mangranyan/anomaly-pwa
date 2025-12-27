import { generateQRWithLabelCanvas, downloadQR } from '../utils/qrcode';

export function renderQrGen() {
  const app = document.getElementById('app')!;
  let type = '设备异常';

  const render = () => {
    app.innerHTML = `
      <div class="card" style="max-width: 90%; margin: 20px auto;">
        <h1>生成异常二维码</h1>
        <div style="display:flex; gap:12px; margin-bottom:20px;">
          <button class="btn ${type === '设备异常' ? 'btn-primary' : ''}" onclick="window.setType('设备异常')">设备异常</button>
          <button class="btn ${type === '制程异常' ? 'btn-primary' : ''}" onclick="window.setType('制程异常')">制程异常</button>
        </div>
        <label>产品 <input id="product" required></label>
        <label>线别 <input id="line" required></label>
        <label>工站 <input id="station" required></label>
        ${type === '设备异常' ? `
          <label>设备名称 <input id="deviceName"></label>
          <label>资产编码 <input id="assetCode"></label>
        ` : ''}
        <button id="genBtn" class="btn btn-success" style="width:100%; margin-top:24px;">生成二维码</button>
        <div id="qrContainer" style="margin-top:20px; text-align:center;"></div>
        <button id="downloadBtn" class="btn btn-warning" style="width:100%; margin-top:12px; display:none;">下载 PNG</button>
      </div>
    `;

    (window as any).setType = (t: string) => { type = t; render(); };

    document.getElementById('genBtn')!.onclick = () => {
      const product = (document.getElementById('product') as HTMLInputElement).value;
      const line = (document.getElementById('line') as HTMLInputElement).value;
      const station = (document.getElementById('station') as HTMLInputElement).value;
      if (!product || !line || !station) {
        alert('请填写必填项');
        return;
      }

      const params = new URLSearchParams({
        product, line, station,
        type: type === '设备异常' ? '设备类异常' : '制程类异常'
      });

      if (type === '设备异常') {
        const deviceName = (document.getElementById('deviceName') as HTMLInputElement).value;
        const assetCode = (document.getElementById('assetCode') as HTMLInputElement).value;
        if (deviceName) params.set('deviceName', deviceName);
        if (assetCode) params.set('assetCode', assetCode);
      }

      const text = '?' + params.toString();
      const label = type === '设备异常' ? '设备异常二维码' : '制程异常二维码';
      const labelColor = type === '设备异常' ? '#2E7D32' : '#1565C0'; // 深绿 / 深蓝

      const canvas = generateQRWithLabelCanvas(text, label, labelColor);

      const container = document.getElementById('qrContainer')!;
      container.innerHTML = '';
      container.appendChild(canvas);

      const downloadBtn = document.getElementById('downloadBtn')!;
      downloadBtn.style.display = 'block';
      downloadBtn.onclick = () => downloadQR(canvas, `${label}.png`);
    };
  };

  render();
}