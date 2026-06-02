
(function(){
  const DATA = window.BIRRAS4HEALTH_DATA;
  const people = DATA.people;
  const categories = Object.entries(DATA.categories).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],'es'));
  const locations = Object.entries(DATA.locations).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],'es'));

  const $ = (sel) => document.querySelector(sel);

  const els = {
    search: $('#search'),
    category: $('#category'),
    location: $('#location'),
    linkedin: $('#linkedin'),
    sort: $('#sort'),
    cards: $('#cards'),
    empty: $('#empty'),
    visibleCount: $('#visibleCount'),
    chips: $('#chips'),
    summaryCats: $('#summaryCats'),
    summaryCities: $('#summaryCities'),
    modal: $('#modal'),
    modalBody: $('#modalBody'),
    modalClose: $('#modalClose'),
    routeHint: $('#routeHint')
  };

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  function fillSelect(select, items){
    for (const [value] of items) {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      select.appendChild(opt);
    }
  }

  fillSelect(els.category, categories);
  fillSelect(els.location, locations);

  function getFiltered(){
    const q = els.search.value.trim().toLowerCase();
    const cat = els.category.value;
    const loc = els.location.value;
    const li = els.linkedin.value;
    let out = people.filter(p => {
      const blob = p.search_blob;
      if (q && !blob.includes(q)) return false;
      if (cat && p.category !== cat) return false;
      if (loc && p.location !== loc) return false;
      if (li === 'yes' && !p.has_linkedin) return false;
      if (li === 'no' && p.has_linkedin) return false;
      return true;
    });

    const sort = els.sort.value;
    if (sort === 'name') out.sort((a,b) => a.name.localeCompare(b.name,'es'));
    if (sort === 'category') out.sort((a,b) => a.category.localeCompare(b.category,'es') || a.name.localeCompare(b.name,'es'));
    if (sort === 'location') out.sort((a,b) => a.location.localeCompare(b.location,'es') || a.name.localeCompare(b.name,'es'));
    return out;
  }

  function renderChips(filtered){
    const cats = [...new Set(filtered.map(p => p.category))];
    els.chips.innerHTML = cats.slice(0, 10).map(c => {
      const count = filtered.filter(p => p.category === c).length;
      return `<span class="chip">${escapeHtml(c)} <strong>· ${count}</strong></span>`;
    }).join('') || '<span class="muted">Sin filtros activos</span>';
  }

  function renderSidePanels(filtered){
    const topCats = [...new Set(filtered.map(p=>p.category))].map(c => [c, filtered.filter(p=>p.category===c).length])
      .sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],'es')).slice(0, 8);
    const topCities = [...new Set(filtered.map(p=>p.location))].map(c => [c, filtered.filter(p=>p.location===c).length])
      .sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],'es')).slice(0, 8);

    els.summaryCats.innerHTML = topCats.map(([c,n]) => `
      <div class="cat-item">
        <div class="row"><div>${escapeHtml(c)}</div><div class="count">${n}</div></div>
        <div class="bar"><span style="width:${Math.max(8, (n / Math.max(...topCats.map(x=>x[1]), 1)) * 100)}%"></span></div>
      </div>
    `).join('') || '<div class="muted">No hay categorías para mostrar.</div>';

    els.summaryCities.innerHTML = topCities.map(([c,n]) => `
      <div class="city-item">
        <div class="row"><div>${escapeHtml(c)}</div><div class="count">${n}</div></div>
      </div>
    `).join('') || '<div class="muted">No hay ubicaciones para mostrar.</div>';
  }

  function personCard(p){
    const linkedin = p.linkedin ? `<a class="small-link" href="${escapeHtml(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : '';
    const route = `<a class="small-link" href="#persona/${p.slug}">Ficha</a>`;
    return `
      <article class="card" role="button" tabindex="0" data-slug="${escapeHtml(p.slug)}">
        <div class="card-top">
          <div>
            <div class="person">${escapeHtml(p.name)}</div>
            <div class="meta">${escapeHtml(p.organization)}</div>
          </div>
          <span class="pill">${escapeHtml(p.category)}</span>
        </div>
        <div class="meta" style="margin-top:10px">${escapeHtml(p.role)}</div>
        <div class="meta">${escapeHtml(p.area)}</div>
        <div class="card-foot">
          <div>${escapeHtml(p.location)}</div>
          <div class="link-row">${linkedin}${route}</div>
        </div>
      </article>
    `;
  }

  function openModal(person){
    els.modalBody.innerHTML = `
      <div class="modal-head">
        <div>
          <h2 class="modal-title">${escapeHtml(person.name)}</h2>
          <div class="muted" style="margin-top:6px">${escapeHtml(person.organization)} · ${escapeHtml(person.role)}</div>
        </div>
        <button class="close" id="modalClose2" aria-label="Cerrar">✕</button>
      </div>
      <div class="grid2">
        <div class="info"><div class="label">Categoría</div><div class="value">${escapeHtml(person.category)}</div></div>
        <div class="info"><div class="label">Ubicación</div><div class="value">${escapeHtml(person.location)}</div></div>
        <div class="info"><div class="label">Área principal</div><div class="value">${escapeHtml(person.area)}</div></div>
        <div class="info"><div class="label">Valor para la red</div><div class="value">${escapeHtml(person.note || '—')}</div></div>
      </div>
      <div class="profile-cta">
        ${person.linkedin ? `<a class="btn primary" href="${escapeHtml(person.linkedin)}" target="_blank" rel="noopener">Abrir LinkedIn</a>` : ''}
        <button class="btn" id="copyName">Copiar nombre</button>
        <button class="btn" id="copyMini">Copiar ficha breve</button>
      </div>
      <div class="route-note">
        URL directa de la ficha: <code>#persona/${escapeHtml(person.slug)}</code>
      </div>
    `;
    els.modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const close2 = document.getElementById('modalClose2');
    close2.onclick = closeModal;
    document.getElementById('copyName').onclick = async () => {
      await navigator.clipboard.writeText(person.name);
      close2.textContent = '✓';
      setTimeout(() => close2.textContent = '✕', 700);
    };
    document.getElementById('copyMini').onclick = async () => {
      const txt = `${person.name} · ${person.organization} · ${person.role} · ${person.category} · ${person.area} · ${person.location}`;
      await navigator.clipboard.writeText(txt);
      close2.textContent = '✓';
      setTimeout(() => close2.textContent = '✕', 700);
    };
  }

  function closeModal(){
    els.modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigateToHash(){
    const hash = location.hash || '';
    const m = hash.match(/^#persona\/(.+)$/);
    if (!m){
      els.routeHint.textContent = '';
      closeModal();
      return;
    }
    const slug = decodeURIComponent(m[1]);
    const person = people.find(p => p.slug === slug);
    if (!person){
      els.routeHint.textContent = 'Ficha no encontrada.';
      return;
    }
    els.routeHint.textContent = `Mostrando ficha de ${person.name}.`;
    openModal(person);
  }

  function render(){
    const filtered = getFiltered();
    els.visibleCount.textContent = filtered.length;
    renderChips(filtered);
    renderSidePanels(filtered);

    els.cards.innerHTML = filtered.map(personCard).join('');
    els.empty.style.display = filtered.length ? 'none' : 'block';

    document.querySelectorAll('.card').forEach(card => {
      const slug = card.dataset.slug;
      const person = people.find(p => p.slug === slug);
      const open = () => {
        location.hash = `persona/${encodeURIComponent(slug)}`;
      };
      card.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) return;
        open();
      });
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  [els.search, els.category, els.location, els.linkedin, els.sort].forEach(el => el.addEventListener('input', render));
  window.addEventListener('hashchange', navigateToHash);
  els.modal.addEventListener('click', (e) => { if (e.target === els.modal) closeModal(); });
  els.modalClose.addEventListener('click', closeModal);

  // Init with top chips and route.
  render();
  navigateToHash();
})();
