import { renderHome } from './pages/home';
import { renderQrGen } from './pages/qr-gen';
import { renderMqttConfig } from './pages/mqtt-config';
import { renderForm } from './pages/form';

function renderNavBar(currentPath: string) {
  // 只保留 3 个页面，移除 /form
  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/qr-gen', label: '二维码生成', icon: '🖼️' },
    { path: '/mqtt-config', label: 'MQTT配置', icon: '⚙️' }
  ];

  return `
    <nav style="
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-around;
      padding: 8px 0;
      z-index: 900;
    ">
      ${navItems.map(item => `
        <button 
          class="btn ${currentPath === item.path ? 'btn-primary' : ''}" 
          style="height: 40px; font-size: 14px; padding: 0 8px;"
          onclick="navigateTo('${item.path}')"
        >
          ${item.icon}<br>${item.label}
        </button>
      `).join('')}
    </nav>
  `;
}

export function initRouter() {
  const routes: Record<string, () => void> = {
    '/': renderHome,
    '/qr-gen': renderQrGen,
    '/mqtt-config': renderMqttConfig,
    '/form': renderForm
  };

  const app = document.getElementById('app')!;
  const render = () => {
    const path = window.location.pathname;
    const route = routes[path] || routes['/'];
    
    app.innerHTML = '';
    route();

    const existingNav = document.getElementById('global-nav');
    if (existingNav) existingNav.remove();

    const navBar = document.createElement('div');
    navBar.id = 'global-nav';
    navBar.innerHTML = renderNavBar(path);
    document.body.appendChild(navBar);

    app.style.paddingBottom = '70px';
  };

  window.addEventListener('popstate', render);
  render();

  (window as any).navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    render();
  };
}