# Hero-Bild — 2400 × 1600, 3:2

Erzeugt mit `shopify-workspace/foto/hero_sr.py`.

## Warum
Die Bildfläche im Hero ist bei 1920 px rund **1037 × 700 CSS** = **2074 × 1400 Gerätepixel**
auf einem 2×-Display. Das Poster hatte **1280 × 720** und wurde deshalb 1,67× hochgezogen.
Jetzt liegt **2400 × 1600** vor — die Datei wird heruntergerechnet, nicht hochgezogen.

## Rechenweg
1. Aus 1280 × 720 auf 3:2 beschnitten (1080 × 720), Ausschnitt ab x = 200 — Motiv (Vaporizer,
   Feuerzeuge, Aschenbecher) bleibt rechts der Mitte, links bleibt Fläche für die Typo.
2. **EDSR ×2** (Super-Resolution, Saafke/EDSR_Tensorflow, `foto/models/EDSR_x2.pb`) → 2160 × 1440.
   Klassisches CNNs-Verfahren: rekonstruiert Kanten aus der Quelle, erfindet keine Flächen.
3. Auf 2400 × 1600, dezenter Unscharfmaskus (Radius 1,1 / 45 % / Schwelle 2) und feines Korn
   gegen Banding.

## Dateien
| Datei | Größe | KB |
|---|---|---|
| `hero-2400.webp` | 2400 × 1600 | 153 |
| `hero-2400.jpg` | 2400 × 1600 | 469 |
| `hero-2000.webp` / `.jpg` | 2000 × 1333 | 121 / 320 |
| `hero-1600.webp` / `.jpg` | 1600 × 1067 | 92 / 230 |
| `hero-1200.webp` / `.jpg` | 1200 × 800 | 66 / 152 |
| `hero-3x2-2400-sr.webp` / `.jpg` | Master ohne Abstufung | 166 / 511 |

Empfehlung: `srcset` mit 1200 / 1600 / 2400, `sizes` = Bildflächenbreite. WebP zuerst, JPG als Fallback.

## Grenze
Eine echte 3:2-Aufnahme mit ≥ 2400 px bleibt besser als jede Rechnung — dieses Modell schärft
vorhandene Kanten, es erfindet keine Haare, Fasern oder Schrift. Wenn es die Quelle gibt
(Telefon-Foto, Kamera, Lieferant), einfach ersetzen: gleiche Dateinamen, kein Code.
