/**
 * 安全地将字符串转义为 HTML 实体，防止 XSS
 * @param {string} str - 待转义的字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 从任意字符串生成合法的 URL 查询参数对象
 * @param {string} text - 可能是 "?a=1&b=2" 或 "a=1&b=2"
 * @returns {Object|null} 解析后的对象，失败返回 null
 */
export function parseQrText(text) {
  try {
    const search = text.startsWith('?') ? text : '?' + text;
    const params = new URLSearchParams(new URL(search, 'https://fake').search);
    return Object.fromEntries(params.entries());
  } catch (e) {
    console.error('解析二维码内容失败:', e);
    return null;
  }
}

/**
 * 深度合并两个对象（仅处理简单层级）
 * @param {Object} target 
 * @param {Object} source 
 * @returns {Object}
 */
export function mergeDraft(target, source) {
  return { ...target, ...source };
}

/**
 * 判断是否运行在 PWA 环境中
 */
export function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}