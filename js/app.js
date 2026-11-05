/* =========================================================
   GeoPatitas — lógica de la app (sin frameworks)
   Navegación por hash: #/inicio, #/mapa, #/reportar,
   #/ficha/<folio>, #/adopciones, #/aliados, #/nosotros, #/moderacion
   ========================================================= */
(function () {
  'use strict';

  var D = window.GP_DATA;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Íconos ---------- */
  var ICONS = {
    paw: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 11c-3 0-6 3.5-6 6.5 0 1.8 1.4 2.5 3 2.5 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.6 0 3-.7 3-2.5C18 14.5 15 11 12 11z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    sheriff: '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,1.5 14.8,7.2 21.1,6.8 17.6,12 21.1,17.2 14.8,16.8 12,22.5 9.2,16.8 2.9,17.2 6.4,12 2.9,6.8 9.2,7.2" fill="#C9963A" stroke="#5A4126" stroke-width="1.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.4" fill="#F4EAD6" stroke="#5A4126" stroke-width="1"/></svg>'
  };
  function paintIcons(root) {
    $$('[data-icon]', root).forEach(function (el) {
      if (!el.firstElementChild) el.innerHTML = ICONS[el.getAttribute('data-icon')] || '';
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function statusLabel(st) { return D.STATUS[st].label; }
  function findReport(id) { return D.REPORTS.filter(function (r) { return r.id === id; })[0]; }

  /* ---------- Estado ---------- */
  var state = {
    filter: 'todos',
    search: '',
    selected: null,
    zone: null,
    pending: D.PENDING.slice(),
    approved: 0,
    removed: 0
  };

  /* =========================================================
     ROUTER
     ========================================================= */
  var VIEWS = ['inicio', 'mapa', 'reportar', 'ficha', 'adopciones', 'aliados', 'nosotros', 'moderacion'];

  function route() {
    var parts = (location.hash || '#/inicio').replace(/^#\/?/, '').split('/');
    var view = VIEWS.indexOf(parts[0]) >= 0 ? parts[0] : 'inicio';

    $$('.view').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== view; });

    var navKey = view === 'ficha' ? 'mapa' : view;
    $$('.main-nav a').forEach(function (a) {
      if (a.getAttribute('data-nav') === navKey) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    if (view === 'ficha') renderFicha(parts[1]);
    if (view === 'mapa') renderMap();
    if (view === 'moderacion') renderModeration();

    window.scrollTo(0, 0);
    $('#main').focus({ preventScroll: true });
  }

  /* =========================================================
     INICIO
     ========================================================= */
  function renderRecent() {
    $('#recentList').innerHTML = D.REPORTS.slice(0, 3).map(function (r) {
      return '' +
        '<a class="poster" href="#/ficha/' + r.id + '">' +
          '<span class="poster-inner">' +
            '<span class="poster-title">SE BUSCA</span>' +
            '<hr class="poster-rule">' +
            '<span class="poster-photo">[Foto]</span>' +
            '<span class="poster-row"><span class="badge ' + r.status + '">' + statusLabel(r.status) + '</span><span class="poster-sub small">' + esc(r.time) + '</span></span>' +
            '<span class="poster-name poster-left" style="font-size:20px">' + esc(r.title) + '</span>' +
            '<span class="poster-sub poster-left">Visto en ' + esc(r.zona) + ' (aproximada)</span>' +
          '</span>' +
        '</a>';
    }).join('');
  }

  /* =========================================================
     MAPA
     ========================================================= */
  function visibleReports() {
    var q = state.search.trim().toLowerCase();
    return D.REPORTS.filter(function (r) {
      var okStatus = state.filter === 'todos' || r.status === state.filter;
      var okSearch = !q || (r.zona + ' ' + r.title).toLowerCase().indexOf(q) >= 0;
      return okStatus && okSearch;
    });
  }

  function renderChips() {
    var defs = [['todos', 'Todos'], ['help', 'Necesita ayuda'], ['follow', 'En seguimiento'], ['done', 'Atendido']];
    $('#mapChips').innerHTML = defs.map(function (d) {
      var cls = d[0] === 'todos' ? '' : ' ' + d[0];
      return '<button type="button" class="chip' + cls + '" data-filter="' + d[0] + '" aria-pressed="' + (state.filter === d[0]) + '">' + d[1] + '</button>';
    }).join('');
  }

  function renderMap() {
    var list = visibleReports();
    renderChips();
    $('#mapCount').textContent = list.length + (list.length === 1 ? ' reporte' : ' reportes') + ' · ubicaciones aproximadas (datos de demostración)';

    $('#mapList').innerHTML = list.map(function (r) {
      return '' +
        '<button type="button" class="report-item" data-select="' + r.id + '" aria-current="' + (state.selected === r.id) + '">' +
          '<span class="report-thumb">[Foto]</span>' +
          '<span class="report-body">' +
            '<span class="report-top"><span class="badge ' + r.status + '">' + statusLabel(r.status) + '</span><span>' + esc(r.time) + '</span></span>' +
            '<span class="report-title">' + esc(r.title) + '</span>' +
            '<span class="report-zone">' + esc(r.zona) + '</span>' +
          '</span>' +
        '</button>';
    }).join('');

    $('#mapPins').innerHTML = list.map(function (r) {
      return '' +
        '<div class="pin-wrap" style="left:' + r.x + '%;top:' + r.y + '%">' +
          '<div class="pin-area" aria-hidden="true"></div>' +
          '<button type="button" class="pin ' + r.status + '" data-select="' + r.id + '" aria-pressed="' + (state.selected === r.id) + '" aria-label="Reporte: ' + esc(r.title) + ', ' + statusLabel(r.status) + '">' + ICONS.paw + '</button>' +
        '</div>';
    }).join('');

    renderPopup();
  }

  function renderPopup() {
    var pop = $('#mapPopup');
    var r = state.selected && findReport(state.selected);
    if (!r) { pop.hidden = true; pop.innerHTML = ''; return; }
    pop.innerHTML = '' +
      '<div class="popup-photo">[Foto]<button type="button" class="popup-close" data-close-popup aria-label="Cerrar">×</button></div>' +
      '<div class="popup-body">' +
        '<div class="report-top"><span class="badge ' + r.status + '">' + statusLabel(r.status) + '</span><span>' + esc(r.time) + '</span></div>' +
        '<strong style="font-size:17px">' + esc(r.title) + '</strong>' +
        '<span class="muted small">' + esc(r.zona) + ' (aproximada)</span>' +
        '<a class="btn btn-dark btn-block" href="#/ficha/' + r.id + '">Ver ficha</a>' +
      '</div>';
    pop.hidden = false;
  }

  /* =========================================================
     FICHA
     ========================================================= */
  function renderFicha(id) {
    var r = findReport(id) || D.REPORTS[0];
    state.selected = r.id;
    var level = D.STATUS[r.status].level;
    var steps = ['Reportado', 'En seguimiento', 'Atendido', 'Adoptado'].map(function (n, i) {
      return '<div class="tl-step' + (i < level ? ' is-done' : '') + '"><span class="tl-dot">' + (i + 1) + '</span>' + n + '</div>';
    }).join('');

    $('#fichaContent').innerHTML = '' +
      '<a class="back-link" href="#/mapa">← Volver al mapa</a>' +
      '<div class="ficha">' +
        '<div class="ficha-photo"><span class="badge ' + r.status + '">' + statusLabel(r.status) + '</span>[Foto principal]</div>' +
        '<div class="ficha-info">' +
          '<span class="ficha-wanted">SE BUSCA AYUDA</span>' +
          '<span class="muted small">Reporte #' + r.id + ' · dato de demostración</span>' +
          '<h1 class="h1 h1-sm">' + esc(r.title) + '</h1>' +
          '<div class="health">Estado de salud aparente: ' + esc(r.salud) + '</div>' +
          '<div class="facts">' +
            fact('Tamaño', r.size) + fact('Color', r.color) + fact('Zona aproximada', r.zona) + fact('Último reporte', r.time) +
          '</div>' +
          '<div class="fact"><span>Características particulares</span><span>' + esc(r.rasgos) + '</span></div>' +
          '<div class="card" style="padding:18px;border-radius:14px;gap:14px"><span class="muted small">Seguimiento del caso</span><div class="timeline">' + steps + '</div></div>' +
          '<div class="btn-row">' +
            '<button type="button" class="btn btn-primary">Quiero ayudar</button>' +
            '<button type="button" class="btn btn-outline" data-share="' + r.id + '">Compartir reporte</button>' +
            '<button type="button" class="btn btn-outline">Informar que ya fue atendido</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  function fact(label, value) { return '<div class="fact"><span>' + label + '</span><span>' + esc(value) + '</span></div>'; }

  /* =========================================================
     REPORTAR
     ========================================================= */
  function renderZones() {
    var map = $('#zoneMap');
    $$('.zone-btn', map).forEach(function (b) { b.remove(); });
    D.ZONES.forEach(function (z) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'zone-btn';
      b.style.left = z.x + '%';
      b.style.top = z.y + '%';
      b.textContent = z.name;
      b.setAttribute('data-zone', z.name);
      b.setAttribute('aria-pressed', String(state.zone === z.name));
      map.appendChild(b);
    });
    var t = $('#zoneText');
    t.classList.remove('error');
    t.textContent = state.zone ? 'Zona elegida: ' + state.zone : 'Aún no eliges una zona';
    $('#zoneInput').value = state.zone || '';
  }

  function onSubmitReport(e) {
    e.preventDefault();
    if (!state.zone) {
      var t = $('#zoneText');
      t.textContent = 'Elige una zona aproximada para enviar el reporte.';
      t.classList.add('error');
      t.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var data = Object.fromEntries(new FormData(e.target).entries());
    // TODO: enviar `data` a la API / base de datos (queda pendiente de moderación).
    console.log('[GeoPatitas] Reporte listo para enviar:', data);
    $('#reportFormWrap').hidden = true;
    $('#reportSent').hidden = false;
    window.scrollTo(0, 0);
  }

  function resetReport() {
    $('#reportForm').reset();
    $('#photoName').hidden = true;
    state.zone = null;
    renderZones();
    $('#reportSent').hidden = true;
    $('#reportFormWrap').hidden = false;
  }

  /* =========================================================
     ADOPCIONES
     ========================================================= */
  function renderDogs() {
    var q = $('#dogSearch').value.trim().toLowerCase();
    var size = $('#dogSize').value, age = $('#dogAge').value, sex = $('#dogSex').value;
    var list = D.DOGS.filter(function (d) {
      return (!q || (d.name + ' ' + d.desc).toLowerCase().indexOf(q) >= 0) &&
        (!size || d.size === size) && (!age || d.age === age) && (!sex || d.sex === sex);
    });
    $('#dogEmpty').hidden = list.length > 0;
    $('#dogList').innerHTML = list.map(function (d) {
      return '' +
        '<article class="poster">' +
          '<div class="poster-inner">' +
            '<span class="poster-title">SE BUSCA HOGAR</span>' +
            '<hr class="poster-rule">' +
            '<div class="poster-photo" style="height:190px">[Foto]</div>' +
            '<h2 class="poster-name" style="margin:0;font-weight:400">' + esc(d.name) + '</h2>' +
            '<span class="poster-meta">' + esc(d.ageText) + ' · ' + esc(d.size) + ' · ' + esc(d.sex) + '</span>' +
            '<p class="poster-desc">' + esc(d.desc) + '</p>' +
            '<hr class="poster-rule">' +
            '<span class="poster-reward">RECOMPENSA: UN HOGAR</span>' +
            '<button type="button" class="btn btn-primary btn-block">Conocer más</button>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* =========================================================
     ALIADOS y NOSOTROS
     ========================================================= */
  function renderVets() {
    var slot = $('#vetList .slot-card');
    $$('#vetList .vet-card').forEach(function (n) { n.remove(); });
    D.VETS.forEach(function (v) {
      var el = document.createElement('article');
      el.className = 'card vet-card';
      el.innerHTML = '' +
        '<div class="vet-head"><span class="vet-logo">[Logo]</span>' +
          '<div><div class="vet-name">' + esc(v.name) + '</div><div class="muted small">[Dirección] · Santiago Ixcuintla</div></div></div>' +
        '<span class="sheriff-badge">' + ICONS.sheriff + esc(v.badge) + '</span>' +
        '<div class="coupon"><span class="coupon-label">PROMOCIÓN</span><span class="small">[Descuento o servicio para perritos rescatados]</span></div>' +
        '<div class="btn-row"><button type="button" class="btn btn-dark">Ver promociones</button><button type="button" class="btn btn-outline">Contactar</button></div>';
      $('#vetList').insertBefore(el, slot);
    });
  }

  function renderTeam() {
    $('#teamList').innerHTML = D.TEAM.map(function (t) {
      return '<article class="card team-card"><span class="team-photo">[Foto]</span><span class="team-name">' + esc(t.name) + '</span><span class="team-role">' + esc(t.role) + '</span></article>';
    }).join('');
  }

  /* =========================================================
     MODERACIÓN
     ========================================================= */
  function renderModeration() {
    $('#cntPending').textContent = state.pending.length;
    $('#cntApproved').textContent = state.approved;
    $('#cntRemoved').textContent = state.removed;
    $('#modEmpty').hidden = state.pending.length > 0;
    $('#modQueue').innerHTML = state.pending.map(function (m) {
      return '' +
        '<div class="mod-item">' +
          '<span class="mod-thumb">' + esc(m.foto) + '</span>' +
          '<div class="mod-body"><strong>' + esc(m.title) + '</strong><span class="muted small">' + esc(m.zona) + ' · ' + esc(m.time) + '</span><span class="mod-reason">Motivo de revisión: ' + esc(m.motivo) + '</span></div>' +
          '<div class="btn-row">' +
            '<button type="button" class="btn btn-green" data-approve="' + m.id + '">Aprobar</button>' +
            '<button type="button" class="btn btn-danger" data-remove="' + m.id + '">Eliminar</button>' +
          '</div>' +
        '</div>';
    }).join('');
  }
  function dropPending(id) {
    state.pending = state.pending.filter(function (m) { return m.id !== id; });
  }

  /* =========================================================
     EVENTOS (delegación)
     ========================================================= */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a');
    if (!t) return;

    if (t.hasAttribute('data-filter')) { state.filter = t.getAttribute('data-filter'); state.selected = null; renderMap(); return; }
    if (t.hasAttribute('data-select')) { state.selected = t.getAttribute('data-select'); renderMap(); return; }
    if (t.hasAttribute('data-close-popup')) { state.selected = null; renderMap(); return; }
    if (t.hasAttribute('data-zone')) { state.zone = t.getAttribute('data-zone'); renderZones(); return; }
    if (t.hasAttribute('data-approve')) { dropPending(t.getAttribute('data-approve')); state.approved++; renderModeration(); return; }
    if (t.hasAttribute('data-remove')) { dropPending(t.getAttribute('data-remove')); state.removed++; renderModeration(); return; }
    if (t.id === 'modReset') { state.pending = D.PENDING.slice(); state.approved = 0; state.removed = 0; renderModeration(); return; }
    if (t.id === 'newReport') { resetReport(); return; }
    if (t.hasAttribute('data-share')) {
      var url = location.href;
      if (navigator.share) navigator.share({ title: 'GeoPatitas', text: 'Ayuda a este perrito', url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { t.textContent = 'Enlace copiado'; });
      return;
    }
    if (t.getAttribute('href') === '#') e.preventDefault(); // enlaces de redes aún sin URL
  });

  $('#mapSearch').addEventListener('input', function (e) { state.search = e.target.value; state.selected = null; renderMap(); });
  $('#reportForm').addEventListener('submit', onSubmitReport);
  $$('#reportForm input[type="file"]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      var p = $('#photoName');
      p.hidden = !f;
      if (f) p.textContent = 'Foto seleccionada: ' + f.name;
    });
  });
  ['#dogSearch', '#dogSize', '#dogAge', '#dogSex'].forEach(function (s) {
    $(s).addEventListener('input', renderDogs);
  });
  window.addEventListener('hashchange', route);

  /* =========================================================
     INICIO DE LA APP
     ========================================================= */
  paintIcons(document);
  renderRecent();
  renderZones();
  renderDogs();
  renderVets();
  renderTeam();
  renderModeration();
  route();

  /* ---------- PWA: registrar service worker ---------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('[GeoPatitas] No se pudo registrar el service worker:', err);
      });
    });
  }
})();
