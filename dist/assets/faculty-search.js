(() => {
  const input = document.querySelector('#faculty-search');
  const group = document.querySelector('#faculty-group');
  if (!input || !group) return;
  const randomGrid = document.querySelector('.faculty-grid[data-faculty-order="random"]');
  if (randomGrid) {
    const shuffled = [...randomGrid.querySelectorAll('.faculty-card')];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    randomGrid.append(...shuffled);
  }
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[\s·.,()\-–—]/g, '');
  const cards = [...document.querySelectorAll('.faculty-card[data-search]')].map(card => ({
    card, text: normalize(card.dataset.search), groups: card.dataset.groups.split(/\s+/)
  }));
  document.querySelectorAll('[data-faculty-total]').forEach(node => { node.textContent = String(cards.length); });
  const english = document.documentElement.lang === 'en';
  const filter = () => {
    const query = normalize(input.value);
    const words = input.value.trim().split(/\s+/).map(normalize).filter(Boolean);
    let count = 0;
    cards.forEach(({card, text, groups}) => {
      const matchesText = text.includes(query) || words.every(word => text.includes(word));
      card.hidden = !(matchesText && (!group.value || groups.includes(group.value)));
      if (!card.hidden) count++;
    });
    const result = document.querySelector('#faculty-result');
    if (result) result.textContent = english ? count + ' faculty members' : count + '명의 교수';
    document.querySelector('.faculty-empty').hidden = count !== 0;
  };
  input.addEventListener('input', filter);
  group.addEventListener('change', filter);
  filter();
})();
