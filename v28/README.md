# Only Bubatz — Vorschau v27

Gleicher Look wie der Live-Shop (Anton + Inter, Creme/Ink, Rost-Akzent) — aber auf Verkauf optimiert.
Kein Live-Eingriff: reine Vorschau, alle Daten (Bewertungen, Bestände, Texte) sind Platzhalter.

## Was anders ist

**1. Ein Bildstil für alle Produkte**
Alle Produktbilder wurden freigestellt und auf eine einheitliche Creme-Fläche (1000×1000, 84 % Füllung,
weicher Schatten) gesetzt. Vorher: weiße Studiofotos, Packshots und Herstellergrafiken wild gemischt.
Werkzeug: `trim_v27_images.py` (im Workspace) — lässt sich auf alle 417 Produkte anwenden.

**2. Hero: ein Produkt, ein CTA**
Statt unscharfem Pflanzenhintergrund und drei gleich lauten Buttons: ein großes Produktbild,
ein Haupt-CTA („Jetzt shoppen"), ein leiser Zweitlink, direkt darunter Social Proof (4,8/5 · 2.400+).

**3. Trust dort, wo entschieden wird**
Trust-Row unter dem Hero (24h, diskret, ab 49 € frei, Bewertungen) und nochmal als Kasten auf der
Produktseite — nicht nur in der Laufschrift.

**4. Kategorien im Hauptmenü**
Grinder, Bong, Blättchen, Vaporizer sind jetzt oben in der Navigation statt nur weit unten.

**5. Kategorie-Kacheln einheitlich**
Gleiches Seitenverhältnis, gleicher Hintergrund, Bild freigestellt — kein Zusammenstoß mehr von
Text und Motiv.

**6. Produktkarten aufgeräumt**
Zwei Zeilen Titel (nicht mehr abgeschnitten), Marke, Sterne + Anzahl, Preis mit Streichpreis,
Bestandshinweis, ruhiger Quick-Add-Button statt vollflächiger Buttonleisten.

**7. Produktseite: Kaufen über dem Falz**
Galerie links, Kaufbox rechts: Titel, Sterne, Preis, Varianten, Menge, CTA, Liefertermin,
Vertrauenskasten, erst danach Beschreibung/Specs als Accordion. Auf Mobil klebt eine Kaufleiste unten.
Keine sichtbare SEO-Keyword-Wolke mehr.

**8. Cross-Sell und Bewertungen**
„Passt dazu" nach der Kaufbox, Bewertungsblock mit verifizierten Käufen — beides fehlte live komplett.

## Dateien

- `index.html` — Startseite
- `shop.html` — Kategorie/Grid mit Filtern
- `produkt.html` — Produktseite
- `style.css` — Design-System (Tokens wie live: `#f4f0e4`, `#0a0f0b`, `#e04f1a`, `#003319`, Mint `#1fe9ab`)
- `img/norm/` — normalisierte Produktbilder
- `data.json` — Produktdaten (Name, Preis, Bild), gezogen aus dem Live-Shop

## Nächster Schritt

Umsetzung in Hydrogen (Live-Shop) bzw. Theme — Reihenfolge nach Wirkung:
1. Bild-Normalisierung aller Produkte (größter optischer Sprung, kein Code nötig)
2. Produktseite: Kaufbox nach oben
3. Karten + Grid auf v27-Layout
4. Reviews-App + Cross-Sell

## v27 — Interaktionsschicht (dev)

Drei Dateien, die `index.html`, `shop.html` und `produkt.html` erweitern:

| Datei | Zweck |
|---|---|
| `app.js` | Warenkorb (localStorage), Quick-Add, Benachrichtigen, Filter, Varianten, Accordion, Liefer-Cutoff |
| `fix.css` | Radien (12/10/999), 44-px-Klickziele, Ausverkauft-Zustand, Mini-Warenkorb, Mobil-Grid |
| `stock.json` | Echte Katalogdaten je Karte: `price`, `compareAt` (nur mit Guard `> price × 1.05`), `stock`, `available` |

**Keine Zahl im JS.** `_apply.py` schreibt `data-stock`, `data-price`, `data-type` aus `stock.json`
in die Karten und ersetzt jede Preiszeile. Quelle der Daten ist die Shopify Admin API
(`productByHandle` → `variants { price compareAtPrice inventoryQuantity availableForSale }`).

```
python _apply.py       # Karten mit Daten versorgen, CSS/JS verdrahten (idempotent)
python _check390.py    # Regressionstest bei 390 px: Überlauf, Klickziele, Quick-Add
```

Versand-Regel im Mini-Warenkorb: **ab 49 € frei, sonst 7,49 €** (Verbindliche Policy, nicht 6,90 €).
