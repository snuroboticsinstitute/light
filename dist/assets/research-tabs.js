(() => {
  const panels = [...document.querySelectorAll('.research-tab-panel')];
  const tabs = [...document.querySelectorAll('.research-tabs a, .nrl-tabs a')];
  if (!panels.length) return;
  function select() {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    const panel = target?.closest('.research-tab-panel') || panels[0];
    panels.forEach(item => { item.hidden = item !== panel; });
    tabs.forEach(link => {
      if (link.hash === '#' + panel.id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('.language-switch a').forEach(link => {
      const url = new URL(link.href, location.href);
      url.hash = location.hash;
      link.href = url.href;
    });
    if (target && panel.contains(target)) requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  }
  addEventListener('hashchange', select);
  select();
})();
