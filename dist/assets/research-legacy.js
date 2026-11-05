(() => {
  // Preserve previously shared group links while Research gains its own landing page.
  const id = location.hash.slice(1);
  if (/^(tc[1-4]|pg[1-3]|technical-cores|project-groups|participating-labs)$/.test(id)) {
    const prefix = document.documentElement.lang === 'en' ? '/en' : '';
    location.replace(prefix + '/research/nrl/' + location.search + location.hash);
  }
})();
