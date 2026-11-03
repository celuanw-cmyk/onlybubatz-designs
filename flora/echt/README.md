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

## Upload-Fassung, farbgleich getönt (@video, 03.11.2026)

Der Freisteller ist **natürlich grün-gelb** (Mittelluminanz **98,2**), der Platzhalter
im Theme ist **tiefgrün** (Mittelluminanz **43,2**). Bei gleicher Deckkraft würde die
Ebene durch den Tausch also **35 % blasser** — die Pflanze wäre fast weg.

Deshalb hier zwei fertige Upload-Fassungen, auf das Platzhalter-Farbschema getönt
und luminanzgematcht:

| Datei | px | KB | mean RGB | Luminanz |
|---|---|---|---|---|
| `ob-plant-gruen-900.webp` | 453 × 900 | 187 | 17,6 / 57,9 / 32,7 | **43,0** |
| `ob-plant-gruen-1400.webp` | 705 × 1400 | 286 | 17,5 / 57,5 / 32,5 | **42,7** |

Referenz `plant-1-gruen.webp`: 18 / 58 / 33, Luminanz 43,2 → Tausch ist dichteneutral.

Gemessen in der echten Fläche (733 × 919 css bei 1440, **DPR2** = 1466 × 1838 Gerätepixel,
`multiply` 10 % auf `#f3e8cf`):

| Fassung | Upscale bei DPR2 | Laplacian | mittlere Helligkeit |
|---|---|---|---|
| heute im Theme (260 × 360) | **5,11×** | 0,69 | 227,11 |
| `ob-plant-gruen-900` | 2,04× | **2,58 (3,7×)** | 227,04 |

Vorhernachher in Gerätepixeln: `vergleich-dpr2.png` (links heute, rechts neu) —
links sind die Blattzacken zu Klecksen zerfallen, rechts steht die Zeichnung.

Upload fürs Theme: `ob-plant-gruen-900.webp` reicht für alle drei Ebenen
(919 px, 406 px, 412 px hoch) — eine Datei, ein Request, die kleinen werden
heruntergerechnet. `-1400` nur, wenn die Ebene später größer als ~900 px läuft.
