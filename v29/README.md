# v29 — Modern (Vorschau, kein Live-Shop)

Antwort auf Andrees sieben Punkte vom 31.10. Basis: Papier/Grün/Rost aus `BRAND.md`,
Display jetzt **Anton** statt Alba Slab (siehe `TASTE.md`: Retro nur als Akzent).

## Dateien
- `index.html` — Startseite, eine Datei, kein Build
- `v29.css` — Design-Schicht (Tokens oben, alles über CSS-Variablen)
- `app.js` — Warenkorb, Reveal, Summe
- `img/uni/` — 10 Produktbilder als transparente WebP aus `fotos/after/` (freigestellt, 1:1, 88 %)
- `img/partner/` — Partner-Logos aus `theme_v28/assets`
- `shots/` — Aufnahmen 1440 und 390

## Die sieben Punkte
| # | Punkt | Lösung in v29 |
|---|---|---|
| 1 | Warenkorb: Fade/Blatt schlecht, neutral gewünscht | Panel 220 ms von rechts, Scrim 180 ms, kein Blatt, kein Fade-Loop; ESC + Klick auf Scrim schließen; `prefers-reduced-motion` = sofort |
| 2 | Hero rechts modern, schräg statt gerade, kleine Animation | Bildfläche randlos, linke Kante **13 %** schräg (mobil Oberkante 9 %), 900-ms-Schnitt beim Laden, danach 30-s-Drift `scale(1.03→1.10)` |
| 3 | Ausverkauft komplett ausgegraut, Preis weg, Produkt erahnbar | `filter:grayscale(1)`, Deckkraft .62, Papier-Schleier .22; Preis/Button `visibility:hidden` (Platz bleibt), Label „Ausverkauft“ in Mono |
| 4 | Partner vor der E-Mail, Klick zur Partnerseite | Sektion „Unsere Partner“ direkt über dem Newsletter, ganze Kachel = `<a target="_blank">`, Logo oder Wortmarke |
| 5 | Alle Produktbilder gleich in den Karten | 1:1-Rahmen, transparente WebP aus `fotos/after/` + `multiply` auf `#f3e8cf`; gemessen Kachel = `#f3e8cf` |
| 6 | Alles über Shopify einstellbar | siehe Settings-Liste unten (noch nicht im Theme gebaut) |
| 7 | Dezente Animationen | eine Skala 140/220/380/900 ms, nur `opacity`+`transform`, Reveal 12 px, `prefers-reduced-motion` respektiert |

## Tokens
```
Papier   #e5d5b1   Papier-2 #ece0c2   Papier-3 #f3e8cf
Tinte    #2b2114   Grün #123a22       Grün-tief #0a2416
Rost     #a8341f   Rost hell #c2452b  Gold #b08c3f
```
Kontrast: Rost auf Papier 4,56:1 · Tinte 10,9:1 · Creme auf Grün 10,2:1.

## Was @entwickler/@shopify daraus in Liquid brauchen
- `hero-split.liquid`: Settings `image`, `angle` (0–20 %, Default 13), `drift` (an/aus), `heading_1`, `heading_2`, `lead`, `cta_1/2`, `proof`
- `product-card.liquid`: `available` → Zustand `soldout` (Klassen wie in `v29.css`)
- `partner-list.liquid`: Metaobject-Liste (Logo, Name, URL, Reihenfolge), Fallback = Wortmarke
- Theme-Settings-Gruppe „Bewegung“: `motion` (aus/dezent), `drift` (an/aus)
- `cart-drawer.liquid`: alte Blatt-Phasen entfernen, 220/180 ms übernehmen

## Offen
- Partner: SK-Solution-Ziel-URL fehlt (Kachel bleibt nicht klickbar)
- `partner-ra-eisenmann.png` ist nur ein Blattsymbol → Wortmarke, echtes Logo nötig
- Hero-Quelle ist 1280 × 720 → bei 2×-Display 1,7× hochskaliert; gebraucht 3:2, ≥ 2400 × 1600
