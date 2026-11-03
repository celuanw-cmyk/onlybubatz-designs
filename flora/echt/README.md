# Pflanze — Freisteller aus dem Flyer

Quelle: Kundenflyer (`shopify-workspace/_src_img/flyer.jpg`), ROI (840, 525, 1127, 1044).
Pipeline: `_foto_plant_hero.py` → Maske → Farb-Matting → EDSR ×2 → 705 × 1400.

| Datei | px | KB |
|---|---|---|
| `pflanze-1400.webp` | 705 × 1400 | 300 |
| `pflanze-900.webp` | 453 × 900 | 186 |
| `pflanze-600.webp` | 302 × 600 | 97 |
| `pflanze-1400.png` | 705 × 1400 | 1321 (Master) |

Geprüft: 1 Alpha-Insel (groß 434 156 px), 0 Inseln unter 50 px, alle vier Ecken alpha 0,
52 % der Fläche transparent, 45 276 halbtransparente Kantenpixel = weicher Rand, kein Saum.

Einsatz: Papierflächen `multiply` 5–12 %, dunkle Felder `soft-light` 55–65 %.
Datei ersetzt den Platzhalter in der Flora-Einstellung, ohne Code-Änderung.
