(() => {
  const heading = document.querySelector('#search-heading');
  const status = document.querySelector('#search-status');
  const list = document.querySelector('#search-results');
  if (!heading || !status || !list) return;
  const english = document.documentElement.lang === 'en';
  const query = (new URL(location.href).searchParams.get('q') || '').trim().slice(0, 120);
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[\s·.,()\-–—]/g, '');
  const words = query.split(/\s+/).map(normalize).filter(Boolean);
  const compact = normalize(query);
  if (!compact) return;
  heading.textContent = english ? 'Results for “' + query + '”' : '“' + query + '” 검색 결과';
  status.textContent = english ? 'Searching…' : '검색 중…';
  fetch('/light/assets/search-index-' + (english ? 'en' : 'ko') + '.json')
    .then(response => {
      if (!response.ok) throw new Error('index');
      return response.json();
    })
    .then(entries => {
      const results = entries.map(entry => {
        const title = normalize(entry.title);
        const text = normalize(entry.title + ' ' + entry.text);
        const matches = text.includes(compact) || words.every(word => text.includes(word));
        const score = (title === compact ? 100 : 0) + (title.includes(compact) ? 50 : 0)
          + words.filter(word => title.includes(word)).length * 10;
        return {entry, matches, score};
      }).filter(result => result.matches).sort((a, b) => b.score - a.score);
      status.textContent = results.length
        ? (english ? results.length + ' results' : '검색 결과 ' + results.length + '건')
        : (english ? 'No results. Try a name, field or research group.' : '검색 결과가 없습니다. 이름·전공·연구그룹 등 다른 검색어를 입력해 주세요.');
      results.forEach(({entry}) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        const url = new URL(entry.url, location.href);
        if (url.origin === location.origin) url.searchParams.set('theme', document.documentElement.dataset.theme || 'light');
        else { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        link.href = url.href;
        const kind = document.createElement('span');
        kind.className = 'search-result-kind'; kind.textContent = entry.kind;
        const title = document.createElement('h3'); title.textContent = entry.title;
        const description = document.createElement('p'); description.textContent = entry.description;
        link.append(kind, title, description); item.append(link); list.append(item);
      });
    })
    .catch(() => { status.textContent = english ? 'Search could not load. Please refresh and try again.' : '검색 정보를 불러오지 못했습니다. 새로고침 후 다시 검색해 주세요.'; });
})();
