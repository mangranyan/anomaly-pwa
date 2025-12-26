let n=null;const r=async c=>{const e=document.getElementById("scanner-container"),s=document.getElementById("qr-video"),i=document.getElementById("close-scanner");e.classList.remove("hidden"),n=new ZXing.BrowserQRCodeReader,i.onclick=()=>{n.reset(),e.classList.add("hidden")};try{await n.decodeFromVideoDevice(void 0,s,(d,o)=>{d&&(n.reset(),e.classList.add("hidden"),c(d.getText()))})}catch{alert(`请允许摄像头权限以扫描二维码

【重试】`),e.classList.add("hidden")}},t=document.createElement("script");t.src="https://cdn.jsdelivr.net/npm/@zxing/library@0.18.3/umd/index.min.js";t.onload=()=>{window.ZXing=ZXing};document.head.appendChild(t);export{r as startScan};
//# sourceMappingURL=scanner-BnezLr2x.js.map
