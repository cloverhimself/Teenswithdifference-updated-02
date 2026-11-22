// Register the lightweight CGMK PWA offline shell without interrupting normal browsing.
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope:'/' }).catch(() => {
      // The website remains fully usable even when installation is unavailable.
    });
  });
}
