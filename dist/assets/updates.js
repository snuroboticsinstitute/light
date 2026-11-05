(() => {
  const tabs = [...document.querySelectorAll('[data-update-filter]')];
  const cards = [...document.querySelectorAll('[data-update-type]')];
  const status = document.querySelector('.updates-status');
  const empty = document.querySelector('.updates-empty');
  const grid = document.querySelector('.updates-grid');
  const form = document.querySelector('.updates-search-form');
  const input = document.querySelector('#updates-search-input');
  if (!tabs.length || !status || !empty || !grid) return;
  const english = document.documentElement.lang === 'en';
  const valid = new Set(tabs.map(tab => tab.dataset.updateFilter));
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[\s·.,()\-–—]/g, '');
  const texts = cards.map(card => normalize(card.dataset.updateSearch || card.textContent));
  function render() {
    const params = new URL(location.href).searchParams;
    const fallback = /\/news\/?$/.test(location.pathname) ? 'news' : 'all';
    const requested = params.get('type') || fallback;
    const filter = valid.has(requested) ? requested : 'all';
    grid.dataset.layout = filter === 'all' ? 'list' : 'cards';
    const query = (params.get('q') || '').trim().slice(0, 120);
    const compact = normalize(query);
    const words = query.split(/\s+/).map(normalize).filter(Boolean);
    if (input && input.value !== (params.get('q') || '').slice(0, 120)) input.value = (params.get('q') || '').slice(0, 120);
    if (form) {
      form.querySelector('[name="type"]').value = filter;
      form.querySelector('[name="theme"]').value = document.documentElement.dataset.theme || 'light';
    }
    let count = 0;
    cards.forEach((card, i) => {
      const matchesText = !compact || texts[i].includes(compact) || words.every(word => texts[i].includes(word));
      card.hidden = !((filter === 'all' || card.dataset.updateType === filter) && matchesText);
      if (!card.hidden) count++;
    });
    tabs.forEach(tab => {
      const url = new URL(location.href);
      url.searchParams.set('type', tab.dataset.updateFilter);
      url.hash = '';
      tab.href = url.href;
      if (tab.dataset.updateFilter === filter) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    document.querySelectorAll('.language-switch a').forEach(link => {
      const target = new URL(link.href, location.href);
      target.searchParams.set('type', filter);
      if (query) target.searchParams.set('q', query);
      else target.searchParams.delete('q');
      target.searchParams.set('theme', document.documentElement.dataset.theme || 'light');
      link.href = target.href;
    });
    status.textContent = query
      ? (english ? count + ' search results' : '검색 결과 ' + count + '건')
      : (english ? count + ' updates' : '소식 ' + count + '건');
    empty.hidden = count !== 0;
    grid.hidden = count === 0;
    empty.textContent = query
      ? (english ? 'No matching updates. Try another keyword or select All.' : '검색 결과가 없습니다. 다른 검색어를 입력하거나 전체 탭을 선택해 주세요.')
      : filter === 'notices'
        ? (english ? 'No notices have been posted yet.' : '등록된 공지사항이 없습니다.')
        : (english ? 'No updates in this category yet.' : '등록된 소식이 없습니다.');
  }
  tabs.forEach(tab => tab.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const url = new URL(location.href);
    url.searchParams.set('type', tab.dataset.updateFilter);
    url.hash = '';
    history.pushState(null, '', url);
    render();
  }));
  function search(replace) {
    const url = new URL(location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.slice(0, 120));
    else url.searchParams.delete('q');
    if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null, '', url);
    render();
  }
  if (input) input.addEventListener('input', () => search(true));
  if (form) form.addEventListener('submit', event => { event.preventDefault(); search(false); });
  window.addEventListener('popstate', render);
  render();
})();
