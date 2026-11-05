(() => {
  const board = document.querySelector('[data-reviews]');
  if (!board) return;
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ko';
  const PAGE = 6;
  const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  const T = {
    ko: { all: '전체', round: n => `제${n}회 로보콘`, more: '후기 더 보기', collapse: '접기', empty: '등록된 후기가 없습니다.' },
    en: { all: 'All', round: n => `${ordinal(n)} Robocon`, more: 'Show more reviews', collapse: 'Show less', empty: 'No reviews yet.' }
  }[lang];
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };

  fetch(board.dataset.reviews, { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const reviews = (data.reviews || []).slice().sort((a, b) => b.year - a.year);
      const years = [...new Set(reviews.map(r => r.year))];
      let year = null, shown = PAGE;

      const filters = el('div', 'review-filters');
      filters.setAttribute('role', 'group');
      const list = el('div', 'review-list');
      const moreBtn = el('button', 'review-more', T.more);
      moreBtn.type = 'button';
      [[null, T.all], ...years.map(y => [y, `${y} · ${T.round(reviews.find(x => x.year === y).robocon)}`])].forEach(([y, label]) => {
        const b = el('button', 'review-filter', label);
        b.type = 'button';
        b.dataset.year = y === null ? '' : y;
        b.addEventListener('click', () => { year = y; shown = PAGE; render(); });
        filters.append(b);
      });
      moreBtn.addEventListener('click', () => { shown += PAGE; render(); });

      // The quote comes first; who said it appears only when the review is opened
      const card = r => {
        const a = el('article', 'review-item');
        a.id = 'review-' + r.id;
        const quote = el('button', 'review-quote');
        quote.type = 'button';
        quote.setAttribute('aria-expanded', 'false');
        quote.append(el('span', 'review-text', r.text[lang]), el('span', 'review-ellipsis', '…'));
        const detail = el('div', 'review-detail');
        detail.hidden = true;
        detail.append(el('p', 'review-source', `${r.year} · ${T.round(r.robocon)} · ${r.team[lang]} · ${r.result[lang]}`));
        const close = el('button', 'review-close', T.collapse);
        close.type = 'button';
        detail.append(close);
        const set = open => {
          a.classList.toggle('is-open', open);
          quote.setAttribute('aria-expanded', String(open));
          detail.hidden = !open;
        };
        quote.addEventListener('click', () => set(!a.classList.contains('is-open')));
        close.addEventListener('click', () => { set(false); quote.focus(); });
        a.append(quote, detail);
        return a;
      };

      const render = () => {
        const items = reviews.filter(r => year === null || r.year === year);
        list.replaceChildren(...items.slice(0, shown).map(card));
        if (!items.length) list.append(el('p', 'member-empty', T.empty));
        moreBtn.hidden = items.length <= shown;
        filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.year === (year === null ? '' : String(year)))));
        filters.hidden = years.length < 2;
      };

      board.replaceChildren(filters, list, moreBtn);
      render();
    })
    .catch(() => {});
})();
