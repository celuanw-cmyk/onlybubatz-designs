/* Only Bubatz · v28 — Marken-Leiste: Filter-Logik (reine Vorschau, kein Live-Eingriff)
   Karten tragen data-brand (Katalogschreibweise). Zahlen kommen aus data-count (brands.json):
   41 Marken, 407 Artikel in Marken, 446 Produkte gesamt. Keine getippten Zahlen im JS. */
(function () {
  'use strict';
  var bar = document.getElementById('brandbar');
  if (!bar) return;

  var strip  = document.getElementById('bbstrip');
  var panel  = document.getElementById('brandpanel');
  var more   = document.getElementById('bbmore');
  var search = document.getElementById('bbsearch');
  var active = document.getElementById('bbactive');
  var empty  = document.getElementById('bbempty');
  var grid   = document.querySelector('.pgrid');
  var cards  = Array.prototype.slice.call(document.querySelectorAll('.pgrid .card'));
  var items  = Array.prototype.slice.call(document.querySelectorAll('.bpitem'));
  var total  = cards.length;
  var current = '';

  var hdr = document.querySelector('header.site');
  function setHdr() { document.documentElement.style.setProperty('--hdr', (hdr ? hdr.offsetHeight : 76) + 'px'); }
  setHdr();
  window.addEventListener('resize', setHdr);
  window.addEventListener('scroll', function () {
    bar.classList.toggle('scrolled', bar.getBoundingClientRect().top <= 1);
  }, { passive: true });

  function key(s) { return (s || '').trim().toLowerCase(); }
  function brandOf(c) { return key(c.getAttribute('data-brand')); }
  function countOf(el) { return parseInt(el.getAttribute('data-count') || '0', 10); }
  function labelOf(name) {
    var t = document.querySelector('.brandtab[data-brand="' + CSS.escape(name) + '"]') ||
            document.querySelector('.bpitem[data-brand="' + CSS.escape(name) + '"]');
    return (t && t.childNodes[0] ? t.childNodes[0].textContent : name).trim();
  }

  function paint() {
    var k = key(current), shown = 0;
    cards.forEach(function (c) {
      var hit = !k || brandOf(c) === k;
      c.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });

    Array.prototype.forEach.call(document.querySelectorAll('.brandtab, .bpitem'), function (t) {
      t.classList.toggle('on', key(t.getAttribute('data-brand')) === k);
    });

    if (k) {
      var tab = document.querySelector('.brandtab[data-brand="' + CSS.escape(current) + '"]') ||
                document.querySelector('.bpitem[data-brand="' + CSS.escape(current) + '"]');
      var n = tab ? countOf(tab) : 0;
      active.hidden = false;
      active.innerHTML = '<b>' + labelOf(current) + '</b> \u00b7 ' + n + ' Artikel' +
                         '<button type="button" data-reset>Filter l\u00f6schen</button>';
      var bn = empty.querySelector('[data-bname]');
      var bs = empty.querySelector('[data-bsatz]');
      if (bn) bn.textContent = labelOf(current);
      if (bs) bs.textContent = 'Im Sortiment sind ' + n + '. Hier sind ' + total + ' St\u00fcck geladen.';
    } else {
      active.hidden = true;
      active.innerHTML = '';
    }

    if (empty) {
      if (shown) { empty.style.display = 'none'; }
      else { empty.hidden = false; empty.style.display = ''; }
    }
  }

  function setBrand(b) {
    current = b;
    paint();
    closePanel();
    var on = document.querySelector('.brandtab.on') || document.querySelector('.bpitem.on');
    if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function openPanel() {
    panel.classList.add('open'); more.setAttribute('aria-expanded', 'true');
    if (search) setTimeout(function () { search.focus(); }, 120);
  }
  function closePanel() { panel.classList.remove('open'); more.setAttribute('aria-expanded', 'false'); }

  document.addEventListener('click', function (e) {
    var tab = e.target.closest('.brandtab, .bpitem');
    if (tab) { e.preventDefault(); setBrand(tab.getAttribute('data-brand') || ''); return; }
    if (e.target.closest('[data-reset]')) { setBrand(''); return; }
    if (e.target.closest('#bbmore')) { panel.classList.contains('open') ? closePanel() : openPanel(); return; }
    if (e.target.closest('[data-bpclose]')) { closePanel(); return; }
    if (panel.classList.contains('open') && !e.target.closest('#brandpanel') && !e.target.closest('#brandbar')) closePanel();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  if (search) search.addEventListener('input', function () {
    var q = key(search.value), n = 0;
    items.forEach(function (it) {
      var hit = !q || key(it.textContent).indexOf(q) > -1;
      it.classList.toggle('hide', !hit);
      if (hit) n++;
    });
    var none = panel.querySelector('.bpempty');
    if (!none) {
      none = document.createElement('p');
      none.className = 'bpempty';
      none.textContent = 'Nichts gefunden. Andere Schreibweise probieren.';
      panel.querySelector('.bpgrid').appendChild(none);
    }
    none.style.display = n ? 'none' : '';
  });

  paint();
})();
