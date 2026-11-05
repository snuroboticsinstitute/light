(() => {
 const frame = document.querySelector('.newsletter-document');
 if (!frame) return;
 let observer;
 function fit() {
  const doc = frame.contentDocument;
  if (!doc?.body) return;
  const update = () => {frame.style.height = Math.ceil(Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight)) + 'px';};
  observer?.disconnect();
  observer = new ResizeObserver(update);
  observer.observe(doc.body);
  doc.querySelectorAll('img').forEach(img => img.addEventListener('load', update, {once:true}));
  update();
 }
 frame.addEventListener('load', fit);
 if (frame.contentDocument?.readyState === 'complete') fit();
})();
