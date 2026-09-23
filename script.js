document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    menuBtn.textContent = isOpen ? '✕' : '☰';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.textContent = '☰';
    });
  });
});

// ===================== Lightbox: click any image marked data-lightbox to view it full-size =====================
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = '<button class="lightbox-close" aria-label="Close">✕</button><img src="" alt="">';
  document.body.appendChild(overlay);
  const overlayImg = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('.lightbox-close');

  function openLightbox(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.classList.add('open');
  }
  function closeLightbox() {
    overlay.classList.remove('open');
    overlayImg.src = '';
  }

  document.querySelectorAll('img[data-lightbox]').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.getAttribute('src'), img.getAttribute('alt')));
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // Re-scan for lightbox images after dynamic content renders
  window.attachLightbox = function() {
    document.querySelectorAll('img[data-lightbox]').forEach(img => {
      if (img.dataset.lightboxBound) return;
      img.dataset.lightboxBound = '1';
      img.addEventListener('click', () => openLightbox(img.getAttribute('src'), img.getAttribute('alt')));
    });
  };
});

// ===================== Dynamic content: News, Leadership, Economy, Projects =====================
// These read from /content/*.json so the admin panel (Decap CMS at /admin) can edit them
// without needing code changes. Falls back gracefully if a file is missing.

async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('Could not load', path, e);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {

  // ---- News page ----
  const newsCardsEl = document.getElementById('news-cards');
  const newsArticlesEl = document.getElementById('news-articles');
  if (newsCardsEl) {
    const newsData = await loadJSON('content/news.json');
    const news = newsData && newsData.articles;
    if (news && news.length) {
      newsCardsEl.innerHTML = news.map(item => `
        <div class="news-card">
          <img src="${item.image}" alt="${item.title}">
          <div class="news-meta">${item.category} · ${item.date}</div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <a href="#${item.id}" class="read-more">Read the full story →</a>
        </div>
      `).join('');

      if (newsArticlesEl) {
        newsArticlesEl.innerHTML = news.map((item, i) => `
          <section class="${i % 2 === 0 ? 'bg-cream' : 'bg-white'}" id="${item.id}">
            <div class="wrap" style="max-width:760px;">
              <div class="eyebrow">${item.category} · ${item.date}</div>
              <h2 class="section-title">${item.title}</h2>
              <div class="rule"></div>
              ${item.body.split('\n\n').map(p => `<p class="body-text">${p}</p>`).join('')}
              <a href="news.html" class="btn">← Back to News</a>
            </div>
          </section>
        `).join('');
      }
      window.attachLightbox && window.attachLightbox();
    }
  }

  // ---- About page: Leadership ----
  const leadershipEl = document.getElementById('leadership-cards');
  if (leadershipEl) {
    const teamData = await loadJSON('content/leadership.json');
    const team = teamData && teamData.members;
    if (team && team.length) {
      leadershipEl.innerHTML = team.map(p => `
        <div class="person-card">
          <img class="person-photo" src="${p.photo}" alt="${p.name}">
          <h4>${p.name}</h4>
          <div class="role">${p.role}</div>
        </div>
      `).join('');
    }
  }

  // ---- Economy page: Programs ----
  const economyEl = document.getElementById('economy-cards');
  if (economyEl) {
    const programsData = await loadJSON('content/economy-programs.json');
    const programs = programsData && programsData.programs;
    if (programs && programs.length) {
      economyEl.innerHTML = programs.map(p => `
        <div class="info-card">
          <img src="${p.image}" alt="${p.title}" data-lightbox>
          <h3>${p.title}</h3>
          <p>${p.description}</p>
        </div>
      `).join('');
      window.attachLightbox && window.attachLightbox();
    }
  }

  // ---- Projects page ----
  const projectsEl = document.getElementById('projects-cards');
  if (projectsEl) {
    const projectsData = await loadJSON('content/projects.json');
    const projects = projectsData && projectsData.items;
    if (projects && projects.length) {
      projectsEl.innerHTML = projects.map(p => `
        <div class="info-card">
          <span class="status-tag status-${p.status}">${p.statusLabel}</span>
          ${p.image ? `<img src="${p.image}" alt="${p.title}" data-lightbox style="width:100%;height:170px;object-fit:cover;margin-bottom:1rem;">` : '<div class="image-placeholder">Photo coming soon</div>'}
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="progress-track"><div class="progress-fill" style="width:${p.progress}%;"></div></div>
          <div class="progress-label">${p.progressLabel}</div>
        </div>
      `).join('');
      window.attachLightbox && window.attachLightbox();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Netlify Identity sends people back to the homepage with a token in the URL
  // after clicking an invite/confirmation email link — this reopens the login
  // widget so they can finish setting their password.
  if (window.netlifyIdentity) {
    if (window.location.hash && window.location.hash.includes('confirmation_token')) {
      window.netlifyIdentity.open();
    }
  }
});

// ===================== Locations page: search + category filter =====================
document.addEventListener('DOMContentLoaded', async () => {
  const cardsEl = document.getElementById('location-cards');
  const tabsEl = document.getElementById('location-tabs');
  const searchEl = document.getElementById('location-search');
  if (!cardsEl || !tabsEl) return;

  const data = await loadJSON('content/locations.json');
  const locations = (data && data.locations) || [];

  const categories = ['All', ...Array.from(new Set(locations.map(l => l.category)))];
  let activeCategory = 'All';
  let searchTerm = '';

  function countFor(cat) {
    if (cat === 'All') return locations.length;
    return locations.filter(l => l.category === cat).length;
  }

  function renderTabs() {
    tabsEl.innerHTML = categories.map(cat => `
      <button class="filter-tab ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">
        ${cat} (${countFor(cat)})
      </button>
    `).join('');
    tabsEl.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        renderTabs();
        renderCards();
      });
    });
  }

  function renderCards() {
    const filtered = locations.filter(l => {
      const matchesCat = activeCategory === 'All' || l.category === activeCategory;
      const matchesSearch = !searchTerm || l.name.toLowerCase().includes(searchTerm) || l.description.toLowerCase().includes(searchTerm);
      return matchesCat && matchesSearch;
    });

    cardsEl.innerHTML = filtered.map(l => `
      <div class="location-card">
        <span class="location-tag">${l.category}</span>
        <img src="${l.image}" alt="${l.name}" data-lightbox>
        <div class="location-body">
          <h3>${l.name}</h3>
          <p>${l.description}</p>
          <span class="location-status ${l.status}">${l.status === 'open' ? 'Open to Visitors' : 'Limited Access'}</span>
        </div>
      </div>
    `).join('');
    window.attachLightbox && window.attachLightbox();
  }

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      searchTerm = searchEl.value.toLowerCase().trim();
      renderCards();
    });
  }

  renderTabs();
  renderCards();
});
