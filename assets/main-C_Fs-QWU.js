(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function e(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(t){if(t.ep)return;t.ep=!0;const n=e(t);fetch(t.href,n)}})();const h="modulepreload",w=function(a){return"/"+a},b={},u=function(o,e,s){let t=Promise.resolve();if(e&&e.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),l=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));t=Promise.allSettled(e.map(c=>{if(c=w(c),c in b)return;b[c]=!0;const p=c.endsWith(".css"),m=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${m}`))return;const i=document.createElement("link");if(i.rel=p?"stylesheet":h,p||(i.as="script"),i.crossOrigin="",i.href=c,l&&i.setAttribute("nonce",l),document.head.appendChild(i),p)return new Promise((f,x)=>{i.addEventListener("load",f),i.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${c}`)))})}))}function n(r){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=r,window.dispatchEvent(l),!l.defaultPrevented)throw r}return t.then(r=>{for(const l of r||[])l.status==="rejected"&&n(l.reason);return o().catch(n)})};let d=null;const y={"/":{render:E,bindEvents:k},"/qr-gen":{render:I,bindEvents:L},"/mqtt-config":{render:_,bindEvents:C},"/form":{render:B,bindEvents:T}};function g(){const a=location.hash.slice(1)||"/";if(a==="/form"&&!d){location.hash="/";return}const o=y[a]||y["/"],e=document.getElementById("app");if(!e){console.error("❌ #app 元素未找到，请确保 script 在 DOM 加载后执行");return}e.innerHTML=o.render(),typeof o.bindEvents=="function"&&o.bindEvents();const s=document.getElementById("bottom-nav");s&&s.classList.toggle("hidden",a==="/form")}function v(){window.addEventListener("hashchange",g),g()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",v):v();function E(){return`
    <div class="p-6 pt-12 max-w-md mx-auto">
      <h1 class="text-2xl font-bold text-primary mb-10 text-center">异常提报</h1>
      <button id="scan-btn" class="w-full h-16 bg-primary text-white rounded-xl text-lg font-bold shadow-md active:bg-[#1D4ED8] transform active:scale-95 transition flex items-center justify-center gap-3">
        扫码提报异常
      </button>
    </div>
  `}function I(){return`
    <div class="p-4 pt-6 max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-4 text-center">生成异常二维码</h2>
      <div class="flex mb-6 rounded-lg overflow-hidden border">
        <button id="tab-device" class="flex-1 py-3 bg-blue-100 text-primary font-medium">设备异常</button>
        <button id="tab-process" class="flex-1 py-3 bg-gray-100 text-gray-600 font-medium">制程异常</button>
      </div>
      <div id="form-fields" class="space-y-4 mb-8"></div>
      <button id="gen-btn" class="w-full h-14 bg-primary text-white rounded-xl font-bold mb-6">生成二维码</button>
      <div id="qr-output" class="hidden flex flex-col items-center">
        <div id="qr-canvas-container" class="w-64 h-64 mb-4 flex items-center justify-center"></div>
        <button id="download-btn" class="border border-primary text-primary px-6 py-2 rounded-lg font-medium">下载 PNG</button>
      </div>
    </div>
  `}function _(){return`
    <div class="p-4 pt-6 max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-6 text-center">MQTT 配置</h2>
      <div id="password-prompt" class="mb-6">
        <label class="block text-gray-700 mb-2">请输入密码</label>
        <input type="password" id="config-pwd" class="w-full h-14 px-4 border border-gray-300 rounded-lg mb-4" placeholder="请输入密码">
        <button id="unlock-btn" class="w-full h-12 bg-secondary text-white rounded-lg font-medium">确认</button>
      </div>
      <div id="config-form" class="hidden space-y-4">
        <div><label class="block text-gray-700 mb-1">目标地址（WebSocket URL）</label>
        <input type="text" id="host-url" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="wss://mqtt-broker.shokz.com.cn:8084/mqtt"></div>
        <div><label class="block text-gray-700 mb-1">用户名</label>
        <input type="text" id="username" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="Ml3rqYX5cPN"></div>
        <div><label class="block text-gray-700 mb-1">密码</label>
        <input type="password" id="password" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="6jKFfGiqxjj"></div>
        <div><label class="block text-gray-700 mb-1">Client ID</label>
        <input type="text" id="clientId" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="Ml3rqYX5cPN"></div>
        <div><label class="block text-gray-700 mb-1">上报 Topic</label>
        <input type="text" id="topic" class="w-full h-14 px-4 border border-gray-300 rounded-lg" value="v4/p/post/thing/live/json/1.1"></div>
        <button id="test-btn" class="w-full h-12 bg-primary text-white rounded-lg font-medium mt-2">联通测试</button>
        <button id="save-btn" class="w-full h-12 bg-gray-700 text-white rounded-lg font-medium mt-2">保存配置</button>
      </div>
      <div class="text-xs text-gray-500 mt-8 pt-4 border-t">本应用仅用于内部异常提报，不收集个人身份信息。</div>
    </div>
  `}async function B(){const{getDraft:a,deleteDraft:o}=await u(async()=>{const{getDraft:n,deleteDraft:r}=await import("./db-C3AG-Uqc.js");return{getDraft:n,deleteDraft:r}},[]);let e=await a();e!=null&&e.formData&&(confirm("检测到未提交草稿，是否恢复？")?d={...d,...e.formData}:await o());const s=d.type==="设备类异常",{escapeHtml:t}=await u(async()=>{const{escapeHtml:n}=await import("./utils-VTbPu1Wo.js");return{escapeHtml:n}},[]);return`
    <div class="p-4 pt-6 max-w-md mx-auto">
      <h2 class="text-xl font-bold mb-4 text-center">异常提报</h2>
      <div class="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
        <div><span class="text-gray-500 text-sm">产品</span><div class="font-medium">${t(d.product)}</div></div>
        <div><span class="text-gray-500 text-sm">产线</span><div class="font-medium">${t(d.line)}</div></div>
        <div><span class="text-gray-500 text-sm">工站</span><div class="font-medium">${t(d.station)}</div></div>
        <div><span class="text-gray-500 text-sm">异常类型</span><div class="font-medium">${t(d.type)}</div></div>
        ${s?`
          <div><span class="text-gray-500 text-sm">设备名称</span><div class="font-medium">${t(d.deviceName||"N/A")}</div></div>
          <div><span class="text-gray-500 text-sm">资产编码</span><div class="font-medium">${t(d.assetCode||"N/A")}</div></div>
        `:""}
      </div>
      <div class="space-y-4">
        <div><label class="block text-gray-700 mb-1">提报人 <span class="text-red-500">*</span></label>
        <input type="text" id="reporter" class="w-full h-14 px-4 border border-gray-300 rounded-lg text-base" placeholder="请输入姓名" required></div>
        <div><label class="block text-gray-700 mb-1">异常描述 <span class="text-red-500">*</span></label>
        <textarea id="desc" class="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg text-base" placeholder="请详细描述异常现象" required></textarea></div>
        ${s?"":`
          <div><label class="block text-gray-700 mb-1">良率（如：95%）</label>
          <input type="text" id="yield" class="w-full h-14 px-4 border border-gray-300 rounded-lg text-base" placeholder="例：95%"></div>
          <div><label class="block text-gray-700 mb-1">临时处置措施</label>
          <textarea id="measure" class="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg text-base" placeholder="例：暂停该工位作业"></textarea></div>
        `}
        <button id="submit-btn" class="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg mt-2">提交</button>
      </div>
    </div>
  `}async function k(){document.getElementById("scan-btn").onclick=async()=>{const{startScan:a}=await u(async()=>{const{startScan:o}=await import("./scanner-BnezLr2x.js");return{startScan:o}},[]);a(async o=>{const{parseQrText:e}=await u(async()=>{const{parseQrText:t}=await import("./utils-VTbPu1Wo.js");return{parseQrText:t}},[]),s=e(o);if(!s||!s.product||!s.line||!s.station||!s.type){alert("二维码格式错误：缺少必要参数");return}window.currentParams=s,location.hash="/form"})}}function L(){let a="device";function o(){const e=document.getElementById("form-fields");e.innerHTML=`
      <div><label class="block text-gray-700 mb-1">产品</label>
      <input type="text" id="product" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：TWS耳机"></div>
      <div><label class="block text-gray-700 mb-1">线别</label>
      <input type="text" id="line" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：SMT-01"></div>
      <div><label class="block text-gray-700 mb-1">工站</label>
      <input type="text" id="station" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：AOI检测"></div>
      ${a==="device"?`
        <div><label class="block text-gray-700 mb-1">设备名称</label>
        <input type="text" id="deviceName" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：回流焊机"></div>
        <div><label class="block text-gray-700 mb-1">设备资产编码</label>
        <input type="text" id="assetCode" class="w-full h-14 px-4 border border-gray-300 rounded-lg" placeholder="例：RFH-2025"></div>
      `:""}
    `}document.getElementById("tab-device").onclick=()=>{a="device",document.getElementById("tab-device").className="flex-1 py-3 bg-blue-100 text-primary font-medium",document.getElementById("tab-process").className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium",o()},document.getElementById("tab-process").onclick=()=>{a="process",document.getElementById("tab-process").className="flex-1 py-3 bg-blue-100 text-primary font-medium",document.getElementById("tab-device").className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium",o()},o(),document.getElementById("gen-btn").onclick=async()=>{const e=document.getElementById("product").value.trim(),s=document.getElementById("line").value.trim(),t=document.getElementById("station").value.trim();if(!e||!s||!t){alert("请填写产品、线别、工站");return}let n=`?product=${encodeURIComponent(e)}&line=${encodeURIComponent(s)}&station=${encodeURIComponent(t)}`,r="#E8F5E9";if(a==="device"){const m=document.getElementById("deviceName").value.trim(),i=document.getElementById("assetCode").value.trim();if(!m||!i){alert("设备异常需填写设备名称和资产编码");return}n+=`&deviceName=${encodeURIComponent(m)}&assetCode=${encodeURIComponent(i)}&type=设备类异常`,r="#FFF9C4"}else n+="&type=制程类异常";const{generateQRCanvas:l}=await u(async()=>{const{generateQRCanvas:m}=await import("./qrgen-BFbIV9cV.js");return{generateQRCanvas:m}},[]),c=l(n,r),p=document.getElementById("qr-canvas-container");p.innerHTML="",p.appendChild(c),document.getElementById("qr-output").classList.remove("hidden"),document.getElementById("download-btn").onclick=()=>{c.toBlob(m=>{const i=document.createElement("a");i.href=URL.createObjectURL(m),i.download="异常二维码.png",i.click()},"image/png")}}}async function C(){document.getElementById("unlock-btn").onclick=async()=>{if(document.getElementById("config-pwd").value==="shokz@2025"){document.getElementById("password-prompt").classList.add("hidden"),document.getElementById("config-form").classList.remove("hidden");const{getConfig:o}=await u(async()=>{const{getConfig:s}=await import("./db-C3AG-Uqc.js");return{getConfig:s}},[]),e=await o();e&&(document.getElementById("host-url").value=e.hostUrl||"wss://mqtt-broker.shokz.com.cn:8084/mqtt",document.getElementById("username").value=e.username||"",document.getElementById("password").value=e.password||"",document.getElementById("clientId").value=e.clientId||"",document.getElementById("topic").value=e.topic||"")}else alert("密码错误")},document.getElementById("test-btn").onclick=async()=>{var t;const a=document.getElementById("host-url").value,o=document.getElementById("username").value,e=document.getElementById("password").value,s=document.getElementById("clientId").value;if(!a||!o||!e||!s){alert("请填写完整配置");return}try{const n=new Paho.MQTT.Client(a.replace("wss://","").split(":")[0],parseInt(a.split(":")[2]),a.split("/")[3]||"mqtt",s);await new Promise((r,l)=>{n.connect({useSSL:!0,userName:o,password:e,onSuccess:()=>{n.disconnect(),r()},onFailure:c=>l(c),timeout:5})}),alert("✅ 连接成功")}catch(n){let r="❌ 连接失败";n.errorCode===4?r="❌ 认证失败":(t=n.errorMessage)!=null&&t.includes("timeout")?r="⏱️ 连接超时":r="🌐 网络不可达",alert(r)}},document.getElementById("save-btn").onclick=async()=>{const a={hostUrl:document.getElementById("host-url").value,username:document.getElementById("username").value,password:document.getElementById("password").value,clientId:document.getElementById("clientId").value,topic:document.getElementById("topic").value},{saveConfig:o}=await u(async()=>{const{saveConfig:e}=await import("./db-C3AG-Uqc.js");return{saveConfig:e}},[]);await o(a),alert("✅ 配置已保存")}}async function T(){document.getElementById("submit-btn").onclick=async()=>{var t,n;const a=document.getElementById("reporter").value.trim(),o=document.getElementById("desc").value.trim();if(!a||!o){alert("请填写提报人和异常描述");return}const e=d.type==="设备类异常",s={product:d.product,line:d.line,workstation:d.station,deviceName:e&&d.deviceName||"",assetCode:e&&d.assetCode||"",exception_type:d.type,exception_description:o,yieldRate:e?"":((t=document.getElementById("yield"))==null?void 0:t.value.trim())||"",temporaryMeasure:e?"":((n=document.getElementById("measure"))==null?void 0:n.value.trim())||""};try{await u(()=>import("./mqtt-CZyA_xVM.js"),[]).then(r=>r.publishMessage({header:{},body:{things:[{id:"",items:[{quality:{},properties:s}]}]}})),alert("✅ 提交成功"),window.currentParams=null,setTimeout(()=>location.hash="/",3e3)}catch{try{await u(()=>import("./db-C3AG-Uqc.js"),[]).then(l=>l.saveDraft({formData:{...s,reporter:a}})),alert(`⚠️ 提交失败，请检查网络或 MQTT 配置
（已保存草稿）`)}catch{alert("提交失败且草稿保存异常")}}}}export{u as _};
//# sourceMappingURL=main-C_Fs-QWU.js.map
