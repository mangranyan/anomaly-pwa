// src/pages/form.ts
import { saveDraft, getLatestDraft, clearDraft } from '../utils/db';
import { publishMessage } from '../utils/mqtt-client';

export async function renderForm() {
  const app = document.getElementById('app')!;
  const formDataStr = sessionStorage.getItem('form-data');
  if (!formDataStr) {
    alert('非法访问');
    (window as any).navigateTo('/');
    return;
  }

  let qrData;
  try {
    qrData = JSON.parse(formDataStr);
  } catch (e) {
    alert('二维码数据格式错误，请重新生成并扫码');
    (window as any).navigateTo('/');
    return;
  }

  const isDevice = qrData.type === '设备类异常';

  // 检查草稿
  const draft = await getLatestDraft();
  if (draft) {
    if (!confirm('检测到未提交草稿，是否恢复？')) {
      await clearDraft();
    } else {
      Object.assign(qrData, draft.formData);
    }
  }

  const now = new Date().toLocaleString('sv').replace('T', ' ').slice(0, 19);
  app.innerHTML = `
    <div class="card" style="max-width: 90%; margin: 20px auto;">
      <h1>异常提报表</h1>
      <label>提报时间 <input value="${now}" readonly></label>
      <label>提报人 <input id="reporter" value="${qrData.reporter || ''}"></label>
      <label>产品 <input value="${qrData.product}" readonly></label>
      <label>线别 <input value="${qrData.line}" readonly></label>
      <label>工站 <input value="${qrData.station}" readonly></label>
      ${isDevice ? `
        <label>设备名称 <input value="${qrData.deviceName || ''}" readonly></label>
        <label>资产编码 <input value="${qrData.assetCode || ''}" readonly></label>
      ` : `
        <label>设备名称 <input value="N/A" readonly></label>
        <label>资产编码 <input value="N/A" readonly></label>
      `}
      <label>异常类型 <input value="${qrData.type}" readonly></label>
      <label>异常描述 <textarea id="desc">${qrData.exception_description || ''}</textarea></label>
      ${!isDevice ? `
        <label>良率 <input id="yieldRate" value="${qrData.yieldRate || ''}" placeholder="%"></label>
        <label>临时处置措施 <textarea id="measure">${qrData.temporaryMeasure || ''}</textarea></label>
      ` : ''}
      <button id="submitBtn" class="btn btn-primary" style="width:100%; margin-top:24px;">提交</button>
      <div id="status" class="text-sm" style="margin-top:12px; text-align:center;"></div>
    </div>
  `;

  document.getElementById('submitBtn')!.onclick = async () => {
    const reporter = (document.getElementById('reporter') as HTMLInputElement).value;
    const desc = (document.getElementById('desc') as HTMLTextAreaElement).value;
    if (!reporter || !desc) {
      alert('请填写提报人和异常描述');
      return;
    }

    const formData = {
      ...qrData,
      reporter,
      exception_description: desc,
      yieldRate: !isDevice ? (document.getElementById('yieldRate') as HTMLInputElement)?.value || '' : '',
      temporaryMeasure: !isDevice ? (document.getElementById('measure') as HTMLTextAreaElement)?.value || '' : ''
    };

    const submitBtn = document.getElementById('submitBtn')!;
    const statusEl = document.getElementById('status')!;
    submitBtn.disabled = true;
    statusEl.innerHTML = '<div class="spinner" style="margin:auto;"></div> 提交中…';

    try {
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
                deviceName: isDevice ? (formData.deviceName || '') : '',
                assetCode: isDevice ? (formData.assetCode || '') : '',
                exception_type: formData.type,
                exception_description: formData.exception_description,
                yieldRate: !isDevice ? formData.yieldRate : '',
                temporaryMeasure: !isDevice ? formData.temporaryMeasure : ''
              }
            }]
          }]
        }
      };

      await publishMessage(payload);
      statusEl.innerHTML = '<span style="color:#10B981;">✅ 提交成功</span>';
      setTimeout(() => {
        (window as any).navigateTo('/');
      }, 3000);
    } catch (err) {
      await saveDraft(formData);
      statusEl.innerHTML = '<span style="color:#EF4444;">❌ 提交失败，请检查网络或 MQTT 配置</span>';
      submitBtn.disabled = false;
    }
  };
}