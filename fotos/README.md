# Produktbilder — normalisiert (Punkt 5)

Alle 445 Produktbilder aus dem Shopify-Katalog, auf ein Maß gebracht.
Erzeugt mit `shopify-workspace/foto/normalize.py`.

## Was mit jedem Bild passiert
1. **Hintergrund weg:** Studio-Weiß wird gekeyt — nur Flächen, die vom Bildrand
   aus zusammenhängen, damit weiße Ware (Döschen, Papiere) nicht mitgelöscht wird.
2. **Kanten entmischt:** die Randfarbe wird vom Weiß gelöst, dadurch kein grauer
   oder weißer Saum auf Papier.
3. **Auf die Silhouette beschnitten** (leere Ränder fallen weg).
4. **88 % der Fläche**, längste Seite, zentriert → jedes Produkt sitzt gleich groß.
5. Ausgabe **1200 × 1200, unter 200 KB**, zwei Varianten:
   - `out_paper/<handle>.jpg` — auf Papier `#f3e8cf` gebacken (Fallback, überall einsetzbar)
   - `out_alpha/<handle>.webp` — transparenter Grund (beste Qualität, Karte darf jede Farbe haben)

## Zahlen
| | |
|---|---|
| Bilder | **445** (Mystery Box hat kein Bild) |
| freigestellt | **444** |
| volle Rahmen-Fallback | **1** (RAW LED Get Lit Sign — dunkles Produktfoto, kein Studio-Weiß) |
| Quelle schmaler als 800 px | **37** (Liste unten) — auf Kartenbreite 259 px unauffällig, für Zoom zu weich |
| JPG-Größe | Median 83 KB, Max 193 KB |
| WebP-Größe | Median 19 KB (480 px Web-Fassung), Max 194 KB |

## Offen (nur durch neue Fotos zu lösen)
Quellen unter 800 px — Lieferanten-CDN gibt keine größere Fassung her (geprüft:
`_600x600` im Pfad ist das Maximum, kein Originalsuffix abrufbar):

GIZEH Active Filter Slim 109×200 · Tightvac MiniVac 151×200 · Only Bubatz Hülle
Feuerzeug 200×197 · Purize XTRA Slim PINK 200×200 · NO@Odor CannaSafe 255×600 ·
Purize X-TRA Slim 348×600 · Medusa MIXED 365×600 · Hybrid Supreme Lime 377×600 ·
Kailar weiß 390×600 · Tightvac Pocket 396×600 · Dubi 420 421×600 · Hybrid Glas 421×600 ·
Hybrid bunt 432×600 · Kailar braun 448×600 · Smoking KUKUXUMUSU 471×600 ·
Kailar 65er 479×600 · Rastaman Dose 495×600 · Medusa ORGANIC 503×599 · RAW Blaze 529×600 ·
RAW Aschenbecher 600×571 · Granny's Long KSS 600×574 · Volcano Classic 600×566 ·
RAW Tray Scale 600×475 · Holzkiste Buddies 599×470 · RAW Metallaschenbecher 600×426 ·
RAW Get Lit Sign 599×406 · Smoking Red 600×312 · RAW Ethereal Gold 600×235 ·
OCB Schwarz KS 600×234 · OCB Unbleached 600×195 · OCB X-Pert Silber 600×192 ·
RAW Classic Black 600×167 · OCB Schwarz Long 600×155 · Purize XTRA ORGANIC 600×600 ·
Granny's Stash Jar 599×599 · Stash Book Holzbox 600×600

`index.html` zeigt alle 445 mit Umschalter „Original zeigen".
