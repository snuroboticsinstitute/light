(() => {
  const theme = document.documentElement.dataset.theme || 'light';
  const url = new URL(location.href);
  document.querySelectorAll('.site-search-form').forEach(form => {
    form.querySelector('[name="theme"]').value = theme;
    if (/\/search\/?$/.test(url.pathname)) form.querySelector('[name="q"]').value = url.searchParams.get('q') || '';
  });
  if (/\/search\/?$/.test(url.pathname)) {
    document.querySelectorAll('.language-switch a').forEach(link => {
      const target = new URL(link.href, location.href);
      if (url.searchParams.has('q')) target.searchParams.set('q', url.searchParams.get('q'));
      link.href = target.href;
    });
  }
})();
