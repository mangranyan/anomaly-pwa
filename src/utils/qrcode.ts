import qrcode from 'qrcode-generator';

export function generateQRWithLabelCanvas(text: string, label: string, labelColor: string): HTMLCanvasElement {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();

  const qrSize = 300;
  const fontSize = 20;
  const labelHeight = 40;
  const totalHeight = qrSize + labelHeight + 20;

  const canvas = document.createElement('canvas');
  canvas.width = qrSize;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d')!;

  // 白底
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, qrSize, totalHeight);

  // 标题文字：居中对齐，加间距
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'center'; // 居中
  ctx.fillText(label, qrSize / 2, labelHeight - 8); // y 坐标调整

  // 绘制二维码（从 labelHeight 下方开始）
  qr.renderTo2dContext(ctx, 0, labelHeight + 10); // +10 是上下间距

  return canvas;
}

export function downloadQR(canvas: HTMLCanvasElement, filename: string) {
  if (navigator.canShare && navigator.canShare({ files: [] })) {
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], filename, { type: 'image/png' });
        await navigator.share({ files: [file] });
      }
    }, 'image/png');
  } else {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}