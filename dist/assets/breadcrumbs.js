(() => {
 const current = document.querySelector('[data-breadcrumb-current]');
 if (!current) return;
 const sync = () => {
  const active = document.querySelector('.research-tabs a[aria-current="page"], .nrl-tabs a[aria-current="page"], [data-update-filter][aria-current="page"]');
  if (active) current.textContent = (active.dataset.breadcrumbLabel || active.textContent).trim();
 };
 const observer = new MutationObserver(sync);
 document.querySelectorAll('.research-tabs a, .nrl-tabs a, [data-update-filter]').forEach(link => observer.observe(link, {attributes:true, attributeFilter:['aria-current']}));
 sync();
})();
