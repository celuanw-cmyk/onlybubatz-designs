/* Only Bubatz · v27 — Interaktionsschicht
   Daten kommen NICHT aus diesem File, sondern aus data-Attributen,
   die _apply.py aus stock.json (Shopify Admin API) schreibt.
   Regel: keine erfundenen Zahlen im JS. */
(() => {
  'use strict';

  const FREE_SHIP = 49.00;          // verbindliche Policy: ab 49 € versandkostenfrei
  const SHIP_COST = 7.49;           // verbindliche Policy (nicht 6,90 / nicht 3,90)
  const CART_KEY  = 'ob_v27_cart';

  const eur = n => n.toFixed(2).replace('.', ',') + ' €';
  const money = s => parseFloat(String(s).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  /* ---------- Warenkorb ---------- */
  const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
  const writeCart = c => { localStorage.setItem(CART_KEY, JSON.stringify(c)); paintCart(); };

  function addToCart(name, price) {
    const cart = readCart();
    const hit = cart.find(i => i.name === name);
    if (hit) hit.qty++; else cart.push({ name, price, qty: 1 });
    writeCart(cart);
    return cart;
  }

  const cartCount = () => readCart().reduce((s, i) => s + i.qty, 0);
  const cartSum = () => readCart().reduce((s, i) => s + i.price * i.qty, 0);

  function paintCart() {
    const n = cartCount(), sum = cartSum();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = n;
      el.hidden = n === 0;
    });
    document.querySelectorAll('.cartmini').forEach(el => {
      el.setAttribute('aria-label', n ? `Warenkorb, ${n} Artikel` : 'Warenkorb, leer');
    });
    const body = document.getElementById('mcBody');
    if (!body) return;
    const rest = Math.max(0, FREE_SHIP - sum);
    body.innerHTML = '';
    if (!n) {
      body.insertAdjacentHTML('beforeend', '<p class="mc-empty">Noch nichts drin. Grinder ab 6,90 €.</p>');
    } else {
      readCart().forEach(i => {
        const row = document.createElement('div');
        row.className = 'mc-row';
        row.innerHTML = `<span>${i.qty} ×</span><span class="mc-name"></span><span class="mc-p"></span>`;
        row.querySelector('.mc-name').textContent = i.name;
        row.querySelector('.mc-p').textContent = eur(i.price * i.qty);
        body.appendChild(row);
      });
      const bar = document.createElement('div');
      bar.className = 'mc-progress';
      bar.innerHTML = `<div class="mc-bar"><i style="width:${Math.min(100, sum / FREE_SHIP * 100)}%"></i></div>
        <small>${rest > 0 ? `Noch ${eur(rest)} bis versandkostenfrei` : 'Versandkostenfrei ✓'}</small>`;
      body.appendChild(bar);
    }
    const foot = document.getElementById('mcFoot');
    if (foot) foot.innerHTML = n
      ? `<div class="mc-sum"><span>Zwischensumme</span><b>${eur(sum)}</b></div>
         <small>zzgl. ${eur(SHIP_COST)} Versand${sum >= FREE_SHIP ? ' — entfällt ab 49 €' : ''}</small>`
      : '';
  }

  /* ---------- Mini-Warenkorb auf/zu ---------- */
  function initDrawer() {
    const drawer = document.getElementById('minicart');
    if (!drawer) return;
    document.querySelectorAll('.cartmini').forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault();
      drawer.classList.toggle('open');
      document.body.classList.toggle('mc-locked', drawer.classList.contains('open'));
    }));
    drawer.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => {
      drawer.classList.remove('open');
      document.body.classList.remove('mc-locked');
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { drawer.classList.remove('open'); document.body.classList.remove('mc-locked'); }
    });
  }

  /* ---------- Quick-Add / Ausverkauft / Benachrichtigen ---------- */
  function initCards() {
    document.querySelectorAll('.card').forEach(card => {
      const stock = parseInt(card.dataset.stock ?? '1', 10);
      const out = card.dataset.stock !== undefined && stock <= 0;
      const btn = card.querySelector('.add');
      const name = card.querySelector('h3')?.textContent.trim() || 'Artikel';
      const price = money(card.dataset.price || card.querySelector('.pricerow b')?.textContent);

      if (out) {
        card.classList.add('is-out');
        if (btn) {
          btn.textContent = 'Benachrichtigen';
          btn.classList.add('notify');
          btn.setAttribute('aria-label', `${name}: ausverkauft – benachrichtigen`);
          btn.addEventListener('click', () => {
            if (btn.dataset.done) return;
            const mail = prompt('E-Mail für die Benachrichtigung:');
            if (!mail || !mail.includes('@')) return;
            try {
              const list = JSON.parse(localStorage.getItem('ob_waitlist') || '[]');
              list.push({ name, mail, at: new Date().toISOString() });
              localStorage.setItem('ob_waitlist', JSON.stringify(list));
            } catch {}
            btn.textContent = 'Eingetragen ✓';
            btn.dataset.done = '1';
          });
        }
        return;
      }

      if (btn) btn.addEventListener('click', () => {
        addToCart(name, price);
        const old = btn.textContent;
        btn.textContent = 'Hinzugefügt ✓';
        btn.classList.add('added');
        setTimeout(() => { btn.textContent = old; btn.classList.remove('added'); }, 1200);
        // Drawer NICHT automatisch öffnen: sonst blockiert er den nächsten Quick-Add.
        const badge = document.querySelector('.cart-count');
        if (badge) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
      });
    });
  }

  /* ---------- Sterne nur bei echten Bewertungen ---------- */
  function initReviews() {
    document.querySelectorAll('.card').forEach(card => {
      const real = card.dataset.reviews && card.dataset.reviews !== '0';
      if (!real) card.querySelectorAll('.rate').forEach(r => r.remove());
    });
  }

  /* ---------- Filter-Chips ---------- */
  function initFilters() {
    const chips = [...document.querySelectorAll('.shopbar .chip')];
    const cards = [...document.querySelectorAll('.pgrid .card')];
    if (!chips.length || !cards.length) return;
    chips.forEach(chip => chip.addEventListener('click', e => {
      e.preventDefault();
      chips.forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      const want = chip.textContent.trim();
      const w = want.toLowerCase().replace(/s$/, '');
      let shown = 0;
      cards.forEach(card => {
        const type = (card.dataset.type || '').toLowerCase();
        const hit = want === 'Alle' || type.includes(w) || w.includes(type.replace(/s$/, ''));
        card.hidden = !hit;
        if (hit) shown++;
      });
      const empty = document.getElementById('emptyState');
      if (empty) empty.hidden = shown > 0;
    }));
  }

  /* ---------- PDP: Varianten, Menge, Sticky-Bar ---------- */
  function initPdp() {
    document.querySelectorAll('.variant').forEach(v => v.addEventListener('click', () => {
      if (v.classList.contains('oos')) return;
      v.parentElement.querySelectorAll('.variant').forEach(x => x.classList.remove('on'));
      v.classList.add('on');
      const label = document.querySelector('.optlabel span');
      if (label) label.textContent = `${v.textContent.trim()} gewählt`;
    }));

    const qty = document.querySelector('.qty');
    if (qty) {
      const input = qty.querySelector('input');
      const [minus, plus] = qty.querySelectorAll('button');
      const set = d => { input.value = Math.min(99, Math.max(1, (parseInt(input.value, 10) || 1) + d)); };
      minus?.addEventListener('click', () => set(-1));
      plus?.addEventListener('click', () => set(1));
    }

    const bar = document.querySelector('.stickybuy');
    const main = document.querySelector('.buyrow .btn');
    if (bar && main) {
      bar.classList.add('collapsed');
      new IntersectionObserver(([e]) => {
        bar.classList.toggle('collapsed', e.isIntersecting);
      }, { rootMargin: '-80px 0px 0px 0px' }).observe(main);
    }

    document.querySelectorAll('.stickybuy .btn, .buyrow .btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const price = money(document.querySelector('.priceblock b')?.textContent);
        addToCart(document.querySelector('h1')?.textContent.trim() || 'Artikel', price);
        const drawer = document.getElementById('minicart');
        if (drawer) { drawer.classList.add('open'); document.body.classList.add('mc-locked'); }
      });
    });
  }

  /* ---------- Accordion: nur eins offen, a11y ---------- */
  function initAccordion() {
    const all = [...document.querySelectorAll('.acc details')];
    all.forEach(d => {
      const s = d.querySelector('summary');
      if (s) s.setAttribute('role', 'button');
      d.addEventListener('toggle', () => {
        if (d.open) all.forEach(o => { if (o !== d) o.open = false; });
      });
    });
  }

  /* ---------- Liefertermin ohne hartes Datum ---------- */
  function initCutoff() {
    document.querySelectorAll('[data-cutoff]').forEach(el => {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(15, 0, 0, 0);
      const today = now < cutoff && now.getDay() !== 0 && now.getDay() !== 6;
      el.textContent = today
        ? 'Bestellst du in den nächsten ' + Math.max(1, Math.round((cutoff - now) / 36e5)) + ' Std., geht es heute raus.'
        : 'Bestellst du jetzt, geht es am nächsten Werktag raus.';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDrawer(); initCards(); initReviews(); initFilters(); initPdp(); initAccordion(); initCutoff(); paintCart();
  });
})();
