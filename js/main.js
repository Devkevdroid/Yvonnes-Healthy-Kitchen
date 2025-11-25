document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.recipe-grid');
  const filterButtons = Array.from(
    document.querySelectorAll('.recipe-filter .chip')
  );

  if (!grid || !filterButtons.length) {
    console.warn('Recipe grid oder Filterbuttons nicht gefunden.');
    return;
  }

  // ARIA-Status für Screenreader
  const statusEl = document.createElement('p');
  statusEl.className = 'visually-hidden recipe-filter__status';
  statusEl.setAttribute('aria-live', 'polite');
  grid.insertAdjacentElement('afterend', statusEl);

  let allRecipes = [];
  let activeCategory = 'alle';

  const categoryLabels = {
    alle: 'alle Kategorien',
    fruehstueck: 'Frühstück',
    herzhaft: 'Herzhaft',
    suess: 'Süß',
    snack: 'Snacks',
    dessert: 'Desserts'
  };

  const getCategoryLabel = (category) =>
    categoryLabels[category] || category;

  const setActiveButton = (button) => {
    filterButtons.forEach((chip) =>
      chip.classList.toggle('chip--active', chip === button)
    );
  };

  const updateStatus = (visibleCount, category) => {
    const label = getCategoryLabel(category);
    if (visibleCount === 0) {
      statusEl.textContent = `Keine Rezepte in ${label} gefunden.`;
    } else if (visibleCount === 1) {
      statusEl.textContent = `1 Rezept in ${label} angezeigt.`;
    } else {
      statusEl.textContent = `${visibleCount} Rezepte in ${label} angezeigt.`;
    }
  };

  const createRecipeCard = (recipe) => {
    const article = document.createElement('article');
    article.className = 'recipe-card recipe-card--linked';
    article.dataset.id = recipe.id || '';
    article.dataset.detail = recipe.detail || '';
    article.dataset.category = (recipe.categories || []).join(' ');
    article.setAttribute('tabindex', '0');

    article.innerHTML = `
      <img
        src="${recipe.image}"
        alt="${recipe.title}"
        loading="lazy"
        class="recipe-card__image"
      />
      <div class="recipe-card__content">
        <p class="recipe-card__category">${recipe.badge || ''}</p>
        <h3 class="recipe-card__title">${recipe.title}</h3>
        <p class="recipe-card__meta">${recipe.meta || ''}</p>
        <a
          class="recipe-card__link"
          href="${recipe.pdf}"
          target="_blank"
          rel="noopener"
        >
          PDF herunterladen
        </a>
      </div>
    `;

    const goToDetail = () => {
      if (recipe.detail) {
        window.location.href = recipe.detail;
      }
    };

    article.addEventListener('click', (event) => {
      const target = event.target;
      // Wenn direkt auf den PDF-Link geklickt wird, nicht zur Detailseite springen
      if (target instanceof HTMLElement && target.closest('a')) return;
      goToDetail();
    });

    article.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        goToDetail();
      }
    });

    return article;
  };

  const renderRecipes = () => {
    grid.innerHTML = '';

    const filtered = allRecipes.filter((recipe) => {
      if (activeCategory === 'alle') return true;
      const categories = recipe.categories || [];
      return categories.includes(activeCategory);
    });

    filtered.forEach((recipe) => {
      const card = createRecipeCard(recipe);
      grid.appendChild(card);
    });

    updateStatus(filtered.length, activeCategory);
  };

  // Filter-Buttons verdrahten
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category || 'alle';
      setActiveButton(button);
      renderRecipes();
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
      }
    });
  });

  // Daten laden
  fetch('data/rezepte.json')
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP-Fehler: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error('Ungültiges Datenformat für Rezepte.');
      }
      allRecipes = data;
      renderRecipes();
    })
    .catch((error) => {
      console.error('Fehler beim Laden der Rezepte:', error);
      grid.innerHTML =
        '<p>Rezepte konnten gerade nicht geladen werden. Bitte später noch einmal versuchen.</p>';
      statusEl.textContent = 'Rezepte konnten nicht geladen werden.';
    });
});
// -------------------------
// Kompakte Header-Bar: einblenden nach Scroll
// -------------------------
(function () {
  const header = document.querySelector('.site-header');
  const bar = document.querySelector('.site-header-bar');
  if (!header || !bar) return;

  const VISIBLE_CLASS = 'site-header-bar--visible';

  function updateBar() {
    const scrollY = window.scrollY || window.pageYOffset;

    // Schwelle: Unterkante des großen Headers
    const headerBottom = header.offsetTop + header.offsetHeight;

    const shouldShow = scrollY > headerBottom + 16;
    bar.classList.toggle(VISIBLE_CLASS, shouldShow);
  }

  updateBar();
  window.addEventListener('scroll', updateBar, { passive: true });
})();