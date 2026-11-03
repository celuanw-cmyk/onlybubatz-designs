# Foto-Tour — welche Bilder wirklich neu müssen

Gemessen am **Live-Titelbild** (Admin-API, 446 aktive Produkte), nicht an der Dateigröße:
entscheidend ist, **wie viele Pixel das Produkt selbst im Bild hat**. Die Karte ist
297 css breit = **594 Gerätepixel** auf einem 2×-Display. Steht das Motiv mit weniger
als 594 px im Bild, wird es hochgerechnet.

| Stufe | Motiv im Bild | Anzahl | Empfehlung |
|---|---|---|---|
| **A** | < 400 px | **7** | sofort fotografieren |
| **B** | 400–499 px | **14** | fotografieren |
| **C** | 500–593 px | **315** | grenzwertig (1,0–1,2×), im Alltag unsichtbar |
| **D** | ≥ 594 px | **110** | ok |

Median im Katalog: **560 px Motiv**.

## Warum nicht „245 unter 600 px Datei"
Die Dateigröße zählt nicht, das Motiv zählt. Ein 597-px-Bild, dessen Produkt 94 % der
Fläche füllt, hat 561 Motivpixel — ein 1000-px-Bild mit 40 % Füllung nur 400. Die
Stufenliste in `tour.csv` sortiert deshalb nach **Motivpixeln**, mit Spalte
`motiv_im_bild_pct`, damit man den Unterschied sieht.

## Auffällig
**Storz & Bickel Mighty+ (512 × 600, Motiv 392 px)** steht in Stufe A — ausgerechnet der
Vaporizer, der im Hero als Blickfang dient. Der ist als erster dran.

Datei: `tour.csv` (Semikolon, UTF-8-BOM, öffnet in Excel direkt richtig).
