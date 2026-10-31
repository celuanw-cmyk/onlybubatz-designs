/* Only Bubatz · v27 — Marken-Leiste: Filter-Logik (reine Vorschau, kein Live-Eingriff)
   Karten tragen data-brand (aus dem Katalog geschrieben). Kein Fake-Rating, keine Fake-Zahlen. */
(() => {
  'use strict';
  const bar = document.getElementById('brandbar');
  if (!bar) return;

  const strip  = document.getElementById('bbstrip');
  const panel  = document.getElementById('brandpanel');
  const more   = document.getElementById('bbmore');
  const search = document.getElementById('bbsearch');
  const active = document.getElementById('bbactive');
  const empty  = document.getElementById('bbempty');
  const grid   = document.querySelector('.pgrid');
  const cards  = Array.from(document.querySelectorAll('.pgrid .card'));
  const items  = Array.from(document.querySelectorAll('.bpitem'));
  let current  = '';

  /* Höhe der Haupt-Navbar messen → Sticky-Offset der Leiste */
  const hdr = document.querySelector('header.site');
  const setHdr = () => document.documentElement.style.setProperty('--hdr', (hdr ? hdr.offsetHeight : 76) + 'px');
  setHdr();
  window.addEventListener('resize', setHdr);
  window.addEventListener('scroll', () => {
    bar.classList.toggle('scrolled', bar.getBoundingClientRect().top <= 1);
  }, { passive: true });

  const key = s => (s || '').trim().toLowerCase();
  const brandOf = c => key(c.getAttribute('data-brand'));

  function paint() {
    const k = key(current);
    let shown = 0;
    cards.forEach(c => {
      const hit = !k || brandOf(c) === k;
      c.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });

    document.querySelectorAll('.brandtab').forEach(t =>
      t.classList.toggle('on', key(t.getAttribute('data-brand')) === k));
    items.forEach(t => t.classList.toggle('on', key(t.getAttribute('data-brand')) === k));

    if (k) {
      const label = (document.querySelector(`.brandtab[data-brand="${CSS.escape(current)}"]`) ||
                     document.querySelector(`.bpitem[data-brand="${CSS.escape(current)}"]`) || {}).textContent || current;
      active.hidden = false;
      active.innerHTML = `Marke: <b>${label.replace(/\s*\d+$/, '')}</b> · ${shown} von ${cards.length} Produkten dieser Vorschau
        <button type="button" data-reset>Alle Marken zeigen</button>`;
    } else {
      active.hidden = true;
      active.innerHTML = '';
    }

    empty.hidden = shown !== 0;
    if (!shown && grid) empty.style.display = '';
    else if (empty) empty.style.display = 'none';
  }

  function setBrand(b) {
    current = b;
    paint();
    closePanel();
    const on = document.querySelector('.brandtab.on') || document.querySelector('.bpitem.on');
    if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function openPanel() { panel.classList.add('open'); more.setAttribute('aria-expanded', 'true'); if (search) setTimeout(() => search.focus(), 120); }
  function closePanel() { panel.classList.remove('open'); more.setAttribute('aria-expanded', 'false'); }
  const togglePanel = () => panel.classList.contains('open') ? closePanel() : openPanel();

  document.addEventListener('click', e => {
    const tab = e.target.closest('.brandtab, .bpitem');
    if (tab) { e.preventDefault(); setBrand(tab.getAttribute('data-brand') || ''); return; }
    if (e.target.closest('[data-reset]')) { setBrand(''); return; }
    if (e.target.closest('#bbmore')) { togglePanel(); return; }
    if (e.target.closest('[data-bpclose]')) { closePanel(); return; }
    if (panel.classList.contains('open') && !e.target.closest('#brandpanel') && !e.target.closest('#brandbar')) closePanel();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) closePanel(); });

  if (search) search.addEventListener('input', () => {
    const q = key(search.value);
    let n = 0;
    items.forEach(it => {
      const hit = !q || key(it.textContent).includes(q);
      it.classList.toggle('hide', !hit);
      if (hit) n++;
    });
    let none = panel.querySelector('.bpempty');
    if (!none) { none = document.createElement('p'); none.className = 'bpempty'; none.textContent = 'Keine Marke gefunden.'; panel.querySelector('.bpgrid').appendChild(none); }
    none.style.display = n ? 'none' : '';
  });

  /* Startzustand: "Alle" aktiv */
  paint();
})();
