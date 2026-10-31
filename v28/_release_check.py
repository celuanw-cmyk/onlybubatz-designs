"""Release-Gate für die v27-Präsentation.

Prüft die ÖFFENTLICHE Seite (nicht lokal) und die Bild-Aktualität im Repo.
Exit-Code 0 = abgabefähig, 1 = Fehler.

    python _release_check.py                 # gegen die GitHub-Pages-URL
    python _release_check.py --base http://127.0.0.1:8790/v27/
"""
import argparse, json, os, re, subprocess, sys, urllib.request
from playwright.sync_api import sync_playwright

PUB = "https://celuanw-cmyk.github.io/onlybubatz-designs/v28/"
PAGES = ["index.html", "shop.html", "produkt.html", "ergebnis.html"]

# Erfundene Sozialdaten – dürfen nirgends stehen (BRAND.md + § 5 UWG)
BANNED = ["4.8/5", "4,8/5", "2.400", "2.412", "12.000", "328 Bewertungen", "96 %",
          "heute gekauft", "4,9 von 5", "verifizierter Kauf", "verifizierte Bewertungen"]

PASS, FAIL, WARN = "PASS", "FAIL", "WARN"
results = []

def add(status, check, detail=""):
    results.append((status, check, detail))

def get(url):
    req = urllib.request.Request(url + ("&" if "?" in url else "?") + "cb=" + str(os.getpid()),
                                 headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")

def check_content(base):
    for p in PAGES:
        try:
            src = get(base + p)
        except Exception as e:
            add(FAIL, f"{p} erreichbar", type(e).__name__)
            continue
        hits = [b for b in BANNED if b in src]
        add(PASS if not hits else FAIL, f"{p} ohne erfundene Sozialdaten", ", ".join(hits))
        if p != "ergebnis.html":
            m = re.search(r'<div class="previewflag">(.*?)</div>', src, re.S)
            ok = m and ("aus dem Katalog" in m.group(1))
            add(PASS if ok else WARN, f"{p} Vorschau-Leiste aktuell",
                "kein Hinweis auf Katalogpreise" if not ok else "")

def check_prices(base):
    """Preise/Streichen auf der Shop-Seite gegen stock.json (Quelle Admin-API)."""
    try:
        shop = get(base + "shop.html")
        stock = json.loads(get(base + "stock.json"))
        by_price = {}
        for entry in stock.values():
            by_price[round(float(entry["price"]), 2)] = entry
        cards = re.findall(r'<article class="card[^"]*"[^>]*data-price="([\d.]+)"[^>]*>(.*?)</article>', shop, re.S)
        bad = []
        for price, inner in cards:
            b = re.search(r'<b>([\d.,]+) €</b>', inner)
            if not b:
                continue
            shown = float(b.group(1).replace(".", "").replace(",", "."))
            if abs(shown - float(price)) > 0.01:
                bad.append(f"{b.group(1)} != {price}")
            # Streichpreis nur oberhalb des Preises
            s = re.search(r'<s>([\d.,]+) €</s>', inner)
            if s:
                struck = float(s.group(1).replace(".", "").replace(",", "."))
                if struck <= shown * 1.05:
                    bad.append(f"Streichpreis {s.group(1)} <= Preis {b.group(1)}")
        add(PASS if not bad else FAIL, f"Preise/Streichpreise konsistent ({len(cards)} Karten)", "; ".join(bad[:3]))
    except Exception as e:
        add(WARN, "Preisprüfung", type(e).__name__)

def check_browser(base):
    with sync_playwright() as pw:
        b = pw.chromium.launch(channel="msedge", headless=True)
        # Desktop
        p = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
        errs = []
        p.on("pageerror", lambda e: errs.append(str(e)))
        p.goto(base + "shop.html", wait_until="networkidle"); p.wait_for_timeout(700)
        m = p.evaluate("""() => ({
            sw: document.documentElement.scrollWidth, vw: innerWidth,
            script: document.scripts.length,
            addH: Math.round(document.querySelector('.card .add')?.getBoundingClientRect().height || 0),
            sterne: document.querySelectorAll('.rate').length,
            daten: document.querySelectorAll('.card[data-stock]').length,
            karten: document.querySelectorAll('.card').length
        })""")
        add(PASS if m["sw"] <= m["vw"] else FAIL, "Shop 1440 px ohne Querscrollen", f"{m['sw']}/{m['vw']}")
        add(PASS if m["script"] >= 1 else FAIL, "Interaktionsschicht geladen", f"{m['script']} Script(s)")
        add(PASS if m["addH"] >= 44 else FAIL, "Quick-Add ≥ 44 px", f"{m['addH']} px")
        add(PASS if m["sterne"] == 0 else FAIL, "keine erfundenen Sterne im Grid", f"{m['sterne']} Blöcke")
        add(PASS if m["daten"] == m["karten"] else FAIL, "alle Karten mit Katalogdaten",
            f"{m['daten']}/{m['karten']}")
        # Kaufweg
        for i in range(3):
            p.locator(".card .add").nth(i).click(); p.wait_for_timeout(150)
        p.locator(".cartmini").first.click(); p.wait_for_timeout(400)
        cart = p.evaluate("""() => ({
            zaehler: document.querySelector('.cart-count')?.textContent,
            zeilen: document.querySelectorAll('.mc-row').length,
            summe: document.querySelector('.mc-sum b')?.textContent,
            progress: document.querySelector('.mc-progress small')?.textContent })""")
        add(PASS if cart["zaehler"] == "3" and cart["zeilen"] == 3 else FAIL,
            "Warenkorb zählt und listet", json.dumps(cart, ensure_ascii=False))
        add(PASS if not errs else FAIL, "keine JS-Fehler", "; ".join(errs[:2]))
        # Mobil
        m2 = b.new_context(viewport={"width": 390, "height": 844}).new_page()
        for pth in ["index.html", "shop.html", "produkt.html"]:
            m2.goto(base + pth, wait_until="networkidle"); m2.wait_for_timeout(400)
            o = m2.evaluate("""() => ({sw: document.documentElement.scrollWidth,
                overflow: [...document.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect();
                    return r.width > 0 && r.right > innerWidth + 1 && !e.closest('#minicart, .bbstrip'); }).length})""")
            add(PASS if o["overflow"] == 0 and o["sw"] <= 390 else FAIL,
                f"{pth} 390 px ohne Überlauf", f"{o['overflow']} Elemente, {o['sw']} px")
        b.close()

def check_shots_fresh():
    """Screenshots der Präsentation müssen neuer sein als die Seiten, die sie zeigen."""
    root = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=os.path.dirname(os.path.abspath(__file__)),
                          capture_output=True, text=True).stdout.strip() or os.path.dirname(os.path.abspath(__file__))
    try:
        html = subprocess.run(["git", "log", "-1", "--format=%ct", "--", "v28/index.html", "v28/shop.html", "v28/produkt.html"],
                              cwd=root, capture_output=True, text=True).stdout.strip()
        shots = subprocess.run(["git", "log", "-1", "--format=%ct", "--", "v28/shots/v28-home.jpg",
                                "v28/shots/v28-shop.jpg", "v28/shots/v28-pdp.jpg"],
                               cwd=root, capture_output=True, text=True).stdout.strip()
        if not html or not shots:
            add(WARN, "Screenshot-Aktualität", "keine Git-Historie")
            return
        add(PASS if int(shots) >= int(html) else FAIL, "Präsentations-Screenshots aktueller als die Seiten",
            f"HTML {html} · Shots {shots}")
    except Exception as e:
        add(WARN, "Screenshot-Aktualität", type(e).__name__)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default=PUB)
    a = ap.parse_args()
    base = a.base if a.base.endswith("/") else a.base + "/"
    print(f"Release-Gate gegen {base}\n")
    check_content(base)
    check_prices(base)
    check_browser(base)
    check_shots_fresh()
    width = max(len(c) for _, c, _ in results) + 2
    for status, check, detail in results:
        print(f"  [{status}] {check.ljust(width)} {detail}")
    fails = sum(1 for s, _, _ in results if s == FAIL)
    warns = sum(1 for s, _, _ in results if s == WARN)
    print(f"\n{len(results)} Prüfungen · {fails} Fehler · {warns} Warnungen")
    print("ABGABEFÄHIG" if fails == 0 else "NICHT ABGABEFÄHIG")
    return 0 if fails == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
