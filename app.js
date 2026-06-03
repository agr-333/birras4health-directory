(() => {
  const people = window.BIRRAS4HEALTH_DATA.people;

  const $ = id => document.getElementById(id);
  const els = {
    searchInput: $('searchInput'),
    searchBar: $('searchBar'),
    searchBtn: $('searchBtn'),
    sort: $('sort'),
    count: $('count'),
    cards: $('cards'),
  };

  const GROUPS = ['Todos', 'Startups', 'Clínica', 'Industria', 'Capital & Ecosistema', 'Institucional', 'Universidad'];

  const GROUP_BADGE = {
    'Startups':           'badge-startups',
    'Clínica':            'badge-clinica',
    'Industria':          'badge-industria',
    'Capital & Ecosistema': 'badge-capital',
    'Institucional':      'badge-institucional',
    'Universidad':        'badge-universidad',
  };

  const GROUP_ICONS = {
    'Todos': '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'Startups': '<svg viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>',
    'Clínica': '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>',
    'Industria': '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    'Capital & Ecosistema': '<svg viewBox="0 0 24 24"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>',
    'Institucional': '<svg viewBox="0 0 24 24"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12,2 20,7 4,7"/></svg>',
    'Universidad': '<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  };

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  function initials(name) {
    return String(name).trim().split(/\s+/).slice(0,2).map(p => p[0] || '').join('').toUpperCase();
  }

  function avatarBg(name) {
    const palettes = [
      '#f0f0f5','#f5f0ff','#fff0f5','#f0fff5','#f0f5ff','#fffaf0'
    ];
    const n = [...name].reduce((a,c) => a + c.charCodeAt(0), 0);
    return palettes[n % palettes.length];
  }

  function linkedinPhotoUrl(linkedin) {
    if (!linkedin) return null;
    const m = linkedin.match(/linkedin\.com\/in\/([^/?#]+)/);
    return m ? `https://unavatar.io/linkedin/${m[1]}` : null;
  }

  function activeGroup() {
    const btn = document.querySelector('.filter-btn.active');
    return btn ? btn.dataset.filter : 'Todos';
  }

  function filtered() {
    const q = els.searchInput.value.trim().toLowerCase();
    const group = activeGroup();
    let out = people.filter(p => {
      if (group !== 'Todos' && p.group !== group) return false;
      if (q) {
        const blob = [p.name, p.organization, p.role, p.area, p.location, p.note, p.group]
          .join(' ').toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
    const sort = els.sort.value;
    if (sort === 'name') out.sort((a,b) => a.name.localeCompare(b.name, 'es'));
    if (sort === 'group') out.sort((a,b) => a.group.localeCompare(b.group, 'es') || a.name.localeCompare(b.name, 'es'));
    if (sort === 'organization') out.sort((a,b) => a.organization.localeCompare(b.organization, 'es') || a.name.localeCompare(b.name, 'es'));
    return out;
  }

  function badgeClass(group) {
    return GROUP_BADGE[group] || 'badge-default';
  }

  let expandedSlug = null;

  function renderCards(list) {
    if (!list.length) {
      els.cards.innerHTML = '<div class="empty">No hay resultados con esos filtros.</div>';
      return;
    }

    els.cards.innerHTML = list.map(p => {
      const photoUrl = linkedinPhotoUrl(p.linkedin);
      const ini = esc(initials(p.name));
      const bg = avatarBg(p.name);
      const imgHtml = photoUrl
        ? `<img src="${esc(photoUrl)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">`
        : '';
      const isExpanded = p.slug === expandedSlug;

      return `
        <article class="card${isExpanded ? ' expanded' : ''}" data-slug="${esc(p.slug)}" tabindex="0" role="button" aria-expanded="${isExpanded}">
          <div class="card-main">
            <div class="avatar-wrap" style="background:${bg}">
              <span class="avatar-initials">${ini}</span>
              ${imgHtml}
            </div>
            <div class="card-info">
              <div class="card-name">${esc(p.name)}</div>
              <div class="card-role">${esc(p.role)}</div>
              <div class="card-org">${esc(p.organization)}</div>
            </div>
          </div>
          <div class="card-foot">
            <span class="badge ${badgeClass(p.group)}">${esc(p.group)}</span>
            <button class="arrow-btn" aria-label="Ver ficha">
              <svg viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>
            </button>
          </div>
          <div class="card-detail">
            <div class="card-detail-inner">
              <div class="detail-row"><span class="dl">Área</span><span class="dv">${esc(p.area)}</span></div>
              <div class="detail-row"><span class="dl">Ubicación</span><span class="dv">${esc(p.location)}</span></div>
              ${p.note ? `<div class="detail-note">${esc(p.note)}</div>` : ''}
              <div class="detail-actions">
                ${p.linkedin ? `<a class="action-btn primary" href="${esc(p.linkedin)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>LinkedIn</a>` : ''}
                <button class="action-btn copy-btn" data-slug="${esc(p.slug)}"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copiar ficha</button>
              </div>
            </div>
          </div>
        </article>`;
    }).join('');

    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        const slug = card.dataset.slug;
        if (expandedSlug === slug) {
          expandedSlug = null;
          card.classList.remove('expanded');
          card.setAttribute('aria-expanded', 'false');
        } else {
          if (expandedSlug) {
            const prev = document.querySelector(`.card[data-slug="${expandedSlug}"]`);
            if (prev) { prev.classList.remove('expanded'); prev.setAttribute('aria-expanded','false'); }
          }
          expandedSlug = slug;
          card.classList.add('expanded');
          card.setAttribute('aria-expanded', 'true');
        }
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const slug = btn.dataset.slug;
        const p = people.find(x => x.slug === slug);
        if (!p) return;
        const txt = `${p.name} · ${p.organization} · ${p.role} · ${p.group} · ${p.area} · ${p.location}`;
        navigator.clipboard.writeText(txt).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>Copiado';
          setTimeout(() => { btn.innerHTML = orig; }, 1800);
        });
      });
    });
  }

  function render() {
    const list = filtered();
    const total = people.length;
    els.count.innerHTML = `<strong>${list.length}</strong> de ${total} miembros`;
    renderCards(list);
  }

  // Build filter buttons
  const filterHost = document.getElementById('filterButtons');
  filterHost.innerHTML = GROUPS.map((g, i) => `
    <button class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${esc(g)}">
      ${GROUP_ICONS[g] || ''}${esc(g)}
    </button>`).join('');

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      expandedSlug = null;
      render();
    });
  });

  // Search toggle
  els.searchBtn.addEventListener('click', () => {
    const isOpen = els.searchBar.classList.toggle('open');
    if (isOpen) { setTimeout(() => els.searchInput.focus(), 50); }
  });

  els.searchInput.addEventListener('input', () => { expandedSlug = null; render(); });
  els.sort.addEventListener('change', () => { expandedSlug = null; render(); });

  render();
})();
