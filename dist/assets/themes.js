(() => {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'light') {
    document.querySelectorAll('img.side-logo,img.mobile-logo').forEach(img => {
      img.src = img.src.replace('snu-official-crest-white.png', 'snu-official-crest.png');
    });
  }
  const language = document.documentElement.lang === 'en' ? 'en' : 'kr';
  document.querySelectorAll('img.nrl-header-mark,img.nrl-mark').forEach(img => {
    const logoVariant = theme === 'light' && !img.closest('.hero') ? 'color' : 'reversed';
    img.src = '/light/assets/nrl2-official-' + language + '-' + logoVariant + '.png';
    img.classList.toggle('nrl-en', language === 'en');
  });
})();
