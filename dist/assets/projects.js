(() => {
  const board = document.querySelector('[data-projects]');
  if (!board) return;
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ko';
  const T = {
    ko: { count: n => `연구과제 ${n}건`, all: '전체', pi: '연구책임자', program: '사업', agency: '지원', period: '기간', more: '자세히 보기' },
    en: { count: n => `${n} research projects`, all: 'All', pi: 'PI', program: 'Program', agency: 'Funding', period: 'Period', more: 'Learn more' }
  }[lang];
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  const pick = v => (v && typeof v === 'object' ? v[lang] || v.ko || '' : v || '');

  fetch(board.dataset.projects, { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const projects = data.projects || [];
      if (!projects.length) return; // keep the "coming soon" notice
      const pis = [...new Set(projects.map(p => pick(p.pi)).filter(Boolean))];
      let pi = null;

      const head = el('div', 'project-head');
      const count = el('p', 'project-count');
      const filters = el('div', 'review-filters');
      filters.setAttribute('role', 'group');
      [[null, T.all], ...pis.map(n => [n, n])].forEach(([n, label]) => {
        const b = el('button', 'review-filter', label);
        b.type = 'button';
        b.dataset.pi = n || '';
        b.addEventListener('click', () => { pi = n; render(); });
        filters.append(b);
      });
      head.append(count, filters);
      const list = el('ol', 'project-list');

      const row = p => {
        const li = el('li', 'project-item');
        li.id = 'project-' + p.id;
        const title = el('h3', 'project-title');
        const url = pick(p.url);
        if (url) {
          const a = el('a', '', pick(p.title));
          a.href = url;
          title.append(a);
        } else title.textContent = pick(p.title);
        const meta = el('dl', 'project-meta');
        [[T.program, pick(p.program)], [T.agency, pick(p.agency)], [T.period, p.period], [T.pi, pick(p.pi)]].forEach(([k, v]) => {
          if (!v) return;
          const d = el('div');
          d.append(el('dt', '', k), el('dd', '', v));
          meta.append(d);
        });
        li.append(title, meta);
        return li;
      };

      const render = () => {
        const rows = projects.filter(p => pi === null || pick(p.pi) === pi);
        count.textContent = T.count(rows.length);
        list.replaceChildren(...rows.map(row));
        filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pi === (pi || ''))));
        filters.hidden = pis.length < 2;
      };

      board.replaceChildren(head, list);
      render();
    })
    .catch(() => {});
})();
