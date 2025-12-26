 Load qrcode-generator
const script = document.createElement('script');
script.src = 'httpsunpkg.comqrcode-generator@1.4.4qrcode.js';
document.head.appendChild(script);

export const generateQRCanvas = (text, bgColor = '#ffffff') = {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();

  const canvas = document.createElement('canvas');
  const size = 300;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  qr.renderTo2dContext(ctx, 4);

  return canvas;
};