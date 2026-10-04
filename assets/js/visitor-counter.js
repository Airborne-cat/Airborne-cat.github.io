(() => {
  const widget = document.querySelector('.visitor-counter');
  if (!widget) return;
  const fields = ['busuanzi_today_uv', 'busuanzi_site_uv'].map(id => document.getElementById(id));
  const status = document.getElementById('visitor-counter-status');
  const loaded = () => fields.every(field => /^\d[\d,]*$/.test(field.textContent.trim()));
  let timer;
  const observer = new MutationObserver(() => {
    if (!loaded()) return;
    clearTimeout(timer);
    status.textContent = '위젯 설치 이후 집계 · Busuanzi';
    widget.dataset.state = 'ready';
    observer.disconnect();
  });
  observer.observe(widget, { childList: true, subtree: true, characterData: true });
  timer = setTimeout(() => {
    if (loaded()) return;
    widget.dataset.state = 'unavailable';
    status.textContent = '방문자 통계를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.';
  }, 12000);
})();
