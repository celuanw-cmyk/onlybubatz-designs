"""v27-Verifikation bei 390 px mit echtem Viewport (Playwright + System-Edge)."""
import json
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8787/v27/"
pages = ["index.html", "shop.html", "produkt.html"]
out = {}

with sync_playwright() as pw:
    b = pw.chromium.launch(channel="msedge", headless=True)
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=False)
    for p in pages:
        page = ctx.new_page()
        errs = []
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.on("requestfailed", lambda r: errs.append("FAILED " + r.url.split("/")[-1]))
        page.on("response", lambda r: errs.append("HTTP%d %s" % (r.status, r.url.split("/")[-1])) if r.status >= 400 else None)
        page.goto(BASE + p, wait_until="networkidle")
        page.wait_for_timeout(600)
        r = page.evaluate("""() => {
          const skip = el => el.closest('#minicart');
          const off = [...document.querySelectorAll('*')]
            .filter(e => !skip(e))
            .filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > innerWidth + 1; })
            .map(e => ({t: e.tagName, c: (e.className||'').toString().slice(0,28), r: Math.round(e.getBoundingClientRect().right)}));
          const cart = document.querySelector('.cartmini')?.getBoundingClientRect();
          const adds = [...document.querySelectorAll('.card .add')];
          return {
            vw: innerWidth, sw: document.documentElement.scrollWidth,
            overflow: off.length, erste: off.slice(0, 4),
            cart: cart ? Math.round(cart.width) + 'x' + Math.round(cart.height) : null,
            addMinHoehe: adds.length ? Math.min(...adds.map(a => Math.round(a.getBoundingClientRect().height))) : null,
            sterne: document.querySelectorAll('.rate').length,
            docH: document.documentElement.scrollHeight
          };
        }""")
        # Wechselwirkung: erster Quick-Add
        try:
            page.locator(".card .add").first.click(timeout=3000)
            page.wait_for_timeout(400)
            r["quickAdd"] = page.evaluate("""() => ({
              zaehler: document.querySelector('.cart-count')?.textContent,
              drawer: document.getElementById('minicart')?.classList.contains('open'),
              progress: document.querySelector('.mc-progress small')?.textContent
            })""")
        except Exception as e:
            r["quickAdd"] = "kein Add-Button: " + type(e).__name__
        r["konsole"] = errs
        out[p] = r
        page.close()
    b.close()

print(json.dumps(out, ensure_ascii=False, indent=1))
