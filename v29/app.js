/* v29 — nur drei Aufgaben: Warenkorb oeffnen/schliessen (neutral, 220 ms),
   dezente Reveals beim Scrollen, Summe aus echten Preisen rechnen. */
(function () {
  document.documentElement.classList.add('js');
  var body = document.body;
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('scrim');
  var openBtn = document.getElementById('cartOpen');
  var closeBtn = document.getElementById('cartClose');
  var FREE = 49;
  var t;

  function eur(n) {
    return n.toFixed(2).replace('.', ',') + ' €';
  }

  function totals() {
    var sum = 0;
    document.querySelectorAll('.ditem [data-price]').forEach(function (el) {
      sum += parseFloat(el.getAttribute('data-price')) || 0;
    });
    var out = document.getElementById('sum');
    var ship = document.getElementById('ship');
    var bar = document.getElementById('bar');
    if (!out) return;
    out.textContent = eur(sum);
    var rest = FREE - sum;
    if (rest > 0) {
      ship.textContent = 'Noch ' + eur(rest) + ' bis versandkostenfrei';
      bar.style.width = Math.min(100, (sum / FREE) * 100) + '%';
    } else {
      ship.textContent = 'Versandkostenfrei';
      bar.style.width = '100%';
    }
  }

  function open() {
    clearTimeout(t);
    drawer.hidden = false;
    scrim.hidden = false;
    requestAnimationFrame(function () {
      body.classList.add('cart-open', 'lock');
      openBtn.setAttribute('aria-expanded', 'true');
      drawer.focus({ preventScroll: true });
    });
  }

  function close() {
    body.classList.remove('cart-open');
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus({ preventScroll: true });
    t = setTimeout(function () {
      drawer.hidden = true;
      scrim.hidden = true;
      body.classList.remove('lock');
    }, 260);
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('cart-open')) close();
  });

  totals();

  /* Reveal: 12 px hoch, 380 ms, nur opacity/transform */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }
})();
