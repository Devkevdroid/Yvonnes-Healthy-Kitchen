document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = Array.from(document.querySelectorAll('.recipe-filter .chip'));
  const recipeCards = Array.from(document.querySelectorAll('.recipe-grid .recipe-card'));
  const grid = document.querySelector('.recipe-grid');

  if (!filterButtons.length || !recipeCards.length || !grid) {
    return;
  }

  const statusEl = document.createElement('p');
  statusEl.className = 'visually-hidden recipe-filter__status';
  statusEl.setAttribute('aria-live', 'polite');
  grid.insertAdjacentElement('afterend', statusEl);

  const setActiveButton = (button) => {
    filterButtons.forEach((chip) => chip.classList.toggle('chip--active', chip === button));
  };

  const applyFilter = (category) => {
    let visible = 0;

    recipeCards.forEach((card) => {
      const raw = (card.dataset.category || '').trim();
      const categories = raw.length ? raw.split(/\s+/) : [];
      const matches = category === 'alle' || categories.includes(category);

      card.hidden = !matches;
      if (matches) visible += 1;
    });

    const label = category === 'alle' ? 'alle Kategorien' : category;
    statusEl.textContent = visible === 1
      ? `1 Rezept in ${label} angezeigt.`
      : `${visible} Rezepte in ${label} angezeigt.`;
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveButton(button);
      applyFilter(button.dataset.category || 'alle');
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
      }
    });
  });

  recipeCards.forEach((card) => {
    const detailPath = card.dataset.detail;
    if (!detailPath) return;

    card.classList.add('recipe-card--linked');
    card.setAttribute('tabindex', '0');

    const goToDetail = () => {
      window.location.href = detailPath;
    };

    card.addEventListener('click', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('a')) {
        return;
      }
      goToDetail();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        goToDetail();
      }
    });
  });

  applyFilter('alle');
});
