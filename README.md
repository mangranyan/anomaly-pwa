# 产线异常提报 PWA

## 📦 部署说明

1. 将整个文件夹上传至 Web 服务器（如 Nginx、Apache）
2. **必须通过 HTTPS 访问**（PWA 要求），本地开发可用 `http://localhost`
3. 确保服务器正确返回 `Content-Type`（如 `.js` 为 `application/javascript`）

## 🔧 MQTT 配置

- 在“设置”页填写 MQTT Broker 地址（WebSocket 端口，如 8083）
- 支持用户名/密码认证
- 消息通过 WebSocket (`ws://`) 发送

> ⚠️ 安全提醒：MQTT 凭据以明文存储于浏览器 `localStorage`，**仅限内网可信环境使用**。

## 📱 使用 PWA Builder 打包 APK

1. 访问 [https://www.pwabuilder.com](https://www.pwabuilder.com)
2. 输入你的 HTTPS 网址（如 `https://yourdomain.com/line-exception-pwa/`）
3. 点击 “Build My PWA” → 选择 “Android”
4. 下载生成的 `.apk` 文件并安装到安卓设备

## 🖼️ 图标生成

若缺少图标，可使用：
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- 上传一张 512x512 的 PNG 图标，自动生成全套尺寸

## 🛠️ 开发调试

- 扫码功能需在真机 Chrome 中测试（模拟器可能无摄像头）
- 使用 Chrome DevTools → Application → Service Workers 查看缓存