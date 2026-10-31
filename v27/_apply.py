import json, re, html, unicodedata, pathlib

BASE = pathlib.Path(__file__).parent
stock = json.load(open(BASE / 'stock.json', encoding='utf-8'))

def norm(s):
    s = html.unescape(s or '').lower()
    s = unicodedata.normalize('NFKD', s)
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', s)).strip()

STOCK = {norm(k): v for k, v in stock.items()}

def eur(x):
    return f"{x:.2f}".replace('.', ',') + ' €'

def pricerow(v):
    """Preiszeile ausschliesslich aus Katalogdaten. Streichpreis nur mit Guard."""
    if v['compareAt'] and v['compareAt'] > v['price'] * 1.05:
        off = round((1 - v['price'] / v['compareAt']) * 100)
        return f'<div class="pricerow"><b>{eur(v["price"])}</b><s>{eur(v["compareAt"])}</s><span class=\'off\'>-{off}%</span></div>'
    return f'<div class="pricerow"><b>{eur(v["price"])}</b></div>'

CARD = re.compile(r'<article class="card"([^>]*)>(.*?)</article>', re.S)

def patch_cards(src, page):
    stats = {'cards': 0, 'matched': 0, 'prices': 0, 'unmatched': []}
    def repl(m):
        attrs, inner = m.group(1), m.group(2)
        stats['cards'] += 1
        h3 = re.search(r'<h3>(.*?)</h3>', inner, re.S)
        if not h3:
            return m.group(0)
        title = re.sub(r'\s+', ' ', h3.group(1)).strip()
        v = STOCK.get(norm(title))
        if not v:
            # Fallback: v27 kürzt lange Titel gelegentlich — Präfix-Vergleich
            key = norm(title)[:26]
            cand = [val for k, val in STOCK.items() if k.startswith(key)]
            v = cand[0] if len(cand) == 1 else None
        if not v:
            stats['unmatched'].append(title[:50])
            return m.group(0)
        stats['matched'] += 1
        # alte data-Attribute entfernen (Idempotenz)
        attrs = re.sub(r'\s+data-(stock|price|compare|type|reviews)="[^"]*"', '', attrs)
        stock_n = 0 if not v['available'] else int(v['stock'])
        attrs += (f' data-stock="{stock_n}" data-price="{v["price"]:.2f}"'
                  f' data-type="{html.escape(v.get("type") or "")}" data-reviews="0"')
        # Preiszeile datengetrieben ersetzen
        new_inner, n = re.subn(r'<div class="pricerow">.*?</div>', pricerow(v), inner, count=1, flags=re.S)
        if n:
            stats['prices'] += 1
            inner = new_inner
        return f'<article class="card"{attrs}>{inner}</article>'
    out = CARD.sub(repl, src)
    print(f"  {page}: {stats['cards']} Karten, {stats['matched']} zugeordnet, {stats['prices']} Preise ersetzt"
          + (f", ohne Daten: {stats['unmatched']}" if stats['unmatched'] else ""))
    return out

DRAWER = '''<div id="minicart" role="dialog" aria-modal="true" aria-label="Warenkorb">
  <div class="mc-head"><b>Warenkorb</b><button data-close aria-label="Schliessen">&times;</button></div>
  <div id="mcBody"></div>
  <div id="mcFoot"></div>
</div>
'''

for page in ['index.html', 'shop.html', 'produkt.html']:
    p = BASE / page
    src = p.read_text(encoding='utf-8')
    src = patch_cards(src, page)
    if 'href="fix.css"' not in src:
        src = src.replace('</head>', '  <link rel="stylesheet" href="fix.css">\n</head>', 1)
    if 'src="app.js"' not in src:
        src = src.replace('</body>', DRAWER + '<script src="app.js" defer></script>\n</body>', 1)
    p.write_text(src, encoding='utf-8')
    print(f"{page}: Karten mit echten Daten, fix.css + app.js + Drawer verdrahtet")
