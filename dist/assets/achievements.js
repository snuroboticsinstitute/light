(() => {
  const board = document.querySelector('[data-achievements]');
  if (!board) return;
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ko';
  const PAGE = 6;
  const T = {
    ko: { all: '전체', more: '성과 더 보기', play: '영상 보기', types: { video: '영상', project: '프로젝트', article: '기사', paper: '논문', award: '수상', patent: '특허·기술이전' } },
    en: { all: 'All', more: 'Show more', play: 'Watch video', types: { video: 'Video', project: 'Project', article: 'Article', paper: 'Paper', award: 'Award', patent: 'Patent & Tech Transfer' } }
  }[lang];
  const ORDER = ['video', 'project', 'article', 'paper', 'award', 'patent'];
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  const pick = v => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] || v.ko || '' : v || '');
  const youtubeId = url => (String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) || [])[1];
  const external = (a, url) => { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };

  fetch(board.dataset.achievements, { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const items = (data.achievements || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
      if (!items.length) return; // keep the "coming soon" notice
      // Filter by research field once the data has a `field` on each achievement
      const fieldOf = i => pick(i.field);
      const fields = (data.fields || []).map(pick).filter(f => items.some(i => fieldOf(i) === f)); // order from `fields`, only those in use
      let field = null, shown = PAGE;

      const filters = el('div', 'review-filters');
      filters.setAttribute('role', 'group');
      [[null, T.all], ...fields.map(n => [n, n])].forEach(([n, label]) => {
        const b = el('button', 'review-filter', label);
        b.type = 'button';
        b.dataset.field = n || '';
        b.addEventListener('click', () => { field = n; shown = PAGE; render(); });
        filters.append(b);
      });
      const list = el('div', 'achievement-list');
      const moreBtn = el('button', 'review-more', T.more);
      moreBtn.type = 'button';
      moreBtn.addEventListener('click', () => { shown += PAGE; render(); });

      // One card per achievement: its video, articles, papers and awards stay together
      const card = i => {
        const art = el('article', 'achievement');
        art.id = 'achievement-' + i.id;
        const links = (i.links || []).slice().sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
        const video = links.find(l => l.type === 'video' && youtubeId(l.url));
        const thumb = i.image || (video && `https://i.ytimg.com/vi/${youtubeId(video.url)}/hqdefault.jpg`);
        if (thumb) {
          const media = external(el('a', 'achievement-media'), video ? video.url : (i.image_url || links[0]?.url || '#'));
          const img = el('img');
          img.src = thumb;
          img.alt = '';
          img.loading = 'lazy';
          img.decoding = 'async';
          media.append(img);
          if (video) { media.classList.add('is-video'); media.setAttribute('aria-label', `${T.play}: ${pick(i.title)}`); }
          else media.setAttribute('aria-hidden', 'true'), media.tabIndex = -1;
          art.append(media);
        } else {
          // No picture: a quiet tile with the venue keeps the cards aligned
          const tile = el('div', 'achievement-media achievement-tile');
          tile.setAttribute('aria-hidden', 'true');
          tile.append(el('span', '', i.venue || ''));
          art.append(tile);
        }
        const body = el('div', 'achievement-body');
        body.append(el('p', 'achievement-date', String(i.date).replace('-', '.')), el('h3', 'achievement-title', pick(i.title)));
        if (pick(i.summary)) body.append(el('p', 'achievement-summary', pick(i.summary)));
        if (pick(i.people)) body.append(el('p', 'achievement-people', pick(i.people)));
        if (links.length) {
          const ul = el('ul', 'achievement-links');
          links.forEach(l => {
            const li = el('li');
            li.append(el('span', 'achievement-link-type', T.types[l.type] || ''));
            const label = [pick(l.title), pick(l.source)].filter(Boolean).join(' · ');
            if (l.url) li.append(external(el('a', '', label + ' ↗'), l.url));
            else li.append(el('span', '', label));
            ul.append(li);
          });
          body.append(ul);
        }
        art.append(body);
        return art;
      };

      const render = () => {
        const rows = items.filter(i => field === null || fieldOf(i) === field);
        list.replaceChildren(...rows.slice(0, shown).map(card));
        moreBtn.hidden = rows.length <= shown;
        filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.field === (field || ''))));
        filters.hidden = fields.length < 2;
      };

      board.replaceChildren(filters, list, moreBtn);
      render();
    })
    .catch(() => {});
})();
