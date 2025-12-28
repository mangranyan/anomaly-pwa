// src/utils/qrcode.ts
import qrcode from 'qrcode-generator';

export function generateQRWithLabelCanvas(
  text: string,
  label: string,
  labelColor: string
): HTMLCanvasElement {
  // 创建二维码对象
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount(); // 二维码实际模块数（如 21, 25, 29...）

  // 设置每个模块的像素大小（越大越清晰，建议 6~10）
  const moduleSize = 8;
  const qrPixelSize = moduleCount * moduleSize; // 二维码实际像素宽高

  // 计算标题尺寸
  const fontSize = 20;
  const fontFamily = 'Arial, sans-serif';
  const canvasForText = document.createElement('canvas');
  const ctxForText = canvasForText.getContext('2d')!;
  ctxForText.font = `bold ${fontSize}px ${fontFamily}`;
  const labelTextWidth = ctxForText.measureText(label).width;
  const labelHeight = fontSize + 8; // 文字高度 + 小间距

  // 画布宽度 = max(二维码宽, 标题宽) + 水平边距
  const horizontalPadding = 20;
  const canvasWidth = Math.max(qrPixelSize, labelTextWidth) + horizontalPadding * 2;
  const verticalPadding = 16;
  const canvasHeight = labelHeight + verticalPadding + qrPixelSize + verticalPadding;

  // 创建最终画布
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr); // 高清支持

  // 白底
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // --- 绘制标题 ---
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const titleX = canvasWidth / 2;
  const titleY = verticalPadding;
  ctx.fillText(label, titleX, titleY);

  // --- 绘制二维码（居中）---
  const qrX = (canvasWidth - qrPixelSize) / 2;
  const qrY = titleY + labelHeight + verticalPadding;
  ctx.fillStyle = '#000000';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          qrX + col * moduleSize,
          qrY + row * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }

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