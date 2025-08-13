let deferredPrompt;
const bar = document.getElementById("install-bar");
const btn = document.getElementById("installBtn");
const iosTip = document.getElementById("ios-tip");

// Detecta iOS (não tem beforeinstallprompt)
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

if (isIOS && !isInStandalone) {
  iosTip.style.display = "";
}

// Chrome/Android: mostra barra quando o evento dispara
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (bar) bar.style.display = "flex";
});

if (btn) {
  btn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (bar) bar.style.display = "none";
    console.log("PWA install:", outcome);
  });
}
