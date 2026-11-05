(() => {
  const board = document.querySelector('[data-gallery]');
  if (!board) return;
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ko';
  const PAGE = 12;
  const T = {
    ko: { all: '전체', more: '사진 더 보기', close: '닫기', prev: '이전 사진', next: '다음 사진', open: '크게 보기' },
    en: { all: 'All', more: 'Show more photos', close: 'Close', prev: 'Previous photo', next: 'Next photo', open: 'View larger' }
  }[lang];
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  const pick = v => (v && typeof v === 'object' ? v[lang] || v.ko || '' : v || '');

  fetch(board.dataset.gallery, { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const photos = (data.photos || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
      if (!photos.length) return; // keep the "coming soon" notice
      const years = [...new Set(photos.map(p => p.year).filter(Boolean))];
      let year = null, shown = PAGE, items = [], index = 0;

      const filters = el('div', 'review-filters');
      filters.setAttribute('role', 'group');
      [[null, T.all], ...years.map(y => [y, String(y)])].forEach(([y, label]) => {
        const b = el('button', 'review-filter', label);
        b.type = 'button';
        b.dataset.year = y === null ? '' : y;
        b.addEventListener('click', () => { year = y; shown = PAGE; render(); });
        filters.append(b);
      });
      const grid = el('div', 'gallery-grid');
      const moreBtn = el('button', 'review-more', T.more);
      moreBtn.type = 'button';
      moreBtn.addEventListener('click', () => { shown += PAGE; render(); });

      // Lightbox
      const box = el('dialog', 'gallery-lightbox');
      const img = el('img');
      const cap = el('p', 'gallery-caption');
      const prev = el('button', 'gallery-nav gallery-prev', '‹');
      const next = el('button', 'gallery-nav gallery-next', '›');
      const close = el('button', 'gallery-close', '×');
      [[prev, T.prev], [next, T.next], [close, T.close]].forEach(([b, label]) => { b.type = 'button'; b.setAttribute('aria-label', label); });
      const figure = el('figure');
      figure.append(img, cap);
      box.append(close, prev, figure, next);
      document.body.append(box);
      const show = i => {
        index = (i + items.length) % items.length;
        const p = items[index];
        img.src = p.src;
        img.alt = pick(p.alt) || pick(p.caption);
        cap.textContent = [p.year, pick(p.caption)].filter(Boolean).join(' · ');
        prev.hidden = next.hidden = items.length < 2;
      };
      prev.addEventListener('click', () => show(index - 1));
      next.addEventListener('click', () => show(index + 1));
      close.addEventListener('click', () => box.close());
      box.addEventListener('click', e => { if (e.target === box) box.close(); });
      box.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
      });

      const render = () => {
        items = photos.filter(p => year === null || p.year === year);
        grid.replaceChildren(...items.slice(0, shown).map((p, i) => {
          const b = el('button', 'gallery-thumb');
          b.type = 'button';
          b.setAttribute('aria-label', `${T.open}: ${pick(p.caption) || pick(p.alt)}`);
          const t = el('img');
          t.src = p.thumb || p.src;
          t.alt = '';
          t.loading = 'lazy';
          t.decoding = 'async';
          b.append(t);
          b.addEventListener('click', () => { show(i); box.showModal(); });
          return b;
        }));
        moreBtn.hidden = items.length <= shown;
        filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.year === (year === null ? '' : String(year)))));
        filters.hidden = years.length < 2;
      };

      board.replaceChildren(filters, grid, moreBtn);
      render();
    })
    .catch(() => {});
})();
