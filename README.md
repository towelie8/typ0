# typ0

Web-App zum Erlernen des 10-Finger-Schreibens auf der deutschen QWERTZ-Tastatur, gedacht für
absolute Anfänger.

- Tastatur mit Fingerzonen: Jede Taste ist in der Farbe des Fingers eingefärbt, der sie drückt.
  Die Legende unter der Tastatur ordnet die Farben den Fingern zu.
- Beim Tastendruck (echte Tastatur oder Klick) leuchtet die Taste auf, ein Kreis in der
  Fingerfarbe zieht sich auf ihr zusammen, und ein Text nennt den zuständigen Finger.
- Geführter Lernpfad in neun Lektionen, von der Grundstellung bis zur Zahlenreihe. Jede Übung
  beginnt mit Silben, danach folgen echte Wörter, beides nur aus bereits gelernten Tasten.
- Ein Tippfehler hält die Übung an, bis die richtige Taste kommt. Ab 95 % Genauigkeit wird die
  nächste Lektion freigeschaltet. Der Fortschritt bleibt im Browser gespeichert.
- Bei `prefers-reduced-motion: reduce` entfällt die Kreis-Animation.

Stack: Vite, React, TypeScript, Tailwind CSS v4, `motion/react`; Tests mit Vitest und Playwright.
Es gibt kein Backend, das Ergebnis ist eine statische Seite.

## Starten

Voraussetzung: Node.js 24 und npm.

```bash
npm install
npm run dev          # Entwicklungsserver, Adresse steht in der Ausgabe (meist http://localhost:5173)
```

Weitere Befehle:

```bash
npm run build        # Typprüfung und Produktions-Build nach dist/
npm run preview      # dist/ lokal ausliefern
npm test             # Unit-Tests (Vitest)
npm run test:e2e     # Browser-Tests (Playwright); baut selbst und startet vite preview
npx vitest run src/lib/textgen.test.ts -t "erlaubte Zeichen"   # einzelner Test
```

Vor dem ersten `npm run test:e2e` den Browser installieren: `npx playwright install chromium`.

## Neue Lektion hinzufügen

Lektionen stehen in [`src/data/lessons.json`](src/data/lessons.json). Freigeschaltet wird in der
Reihenfolge des Arrays: Eine Lektion ist offen, sobald die vorige bestanden ist.

```json
{
  "id": "sonderzeichen",
  "title": "Plus, Raute und Kleiner-als",
  "description": "Der rechte kleine Finger greift nach + und #, der linke nach <.",
  "newKeys": ["+", "#", "<"],
  "minAccuracy": 95
}
```

| Feld | Bedeutung |
|---|---|
| `id` | Eindeutiger Schlüssel. Unter ihm wird der Fortschritt gespeichert; nachträglich nicht ändern. |
| `title`, `description` | Anzeige im Lernpfad und über der Übung. |
| `newKeys` | Zeichen, die in dieser Lektion dazukommen. `" "` ist die Leertaste, Großbuchstaben und Shift-Zeichen (`:`, `?`) werden mit Shift getippt. |
| `minAccuracy` | Genauigkeit in Prozent, ab der die nächste Lektion freigeschaltet wird. |

Übungstexte werden automatisch erzeugt (`src/lib/textgen.ts`). Sie enthalten nur Zeichen aus
`newKeys` dieser und aller vorigen Lektionen, und jede neue Taste kommt mindestens einmal vor.
Für die echten Wörter liest der Generator die Liste in [`src/data/words.ts`](src/data/words.ts):
Ein Wort wird verwendet, sobald alle seine Buchstaben gelernt sind; vor der Shift-Lektion
erscheint es klein geschrieben. Wer mehr Abwechslung möchte, ergänzt dort einfach Wörter.

Die Tests prüfen jede Lektion automatisch: eindeutige IDs, kein Zeichen doppelt eingeführt, nur
Zeichen der Tastatur, Übungstexte nur aus erlaubten Zeichen. Nach einer Änderung `npm test`
ausführen.

Zeichen, die nur mit Alt Gr erreichbar sind (`@`, `€`, `{`), unterstützt das Tastaturmodell
noch nicht.

## Deployment

`npm run build` erzeugt in `dist/` eine statische Seite: `index.html` plus Dateien unter
`dist/assets/`, deren Namen einen Inhalts-Hash tragen. Jeder Webserver kann sie ausliefern. Den
Fortschritt speichert jeder Browser selbst (`localStorage`), der Server muss nichts speichern.

```bash
npm ci
npm run build
rsync -av --delete dist/ user@server:/var/www/typ0/
```

Für den eigenen Server liegen eine fertige nginx-Konfiguration ([`deploy/typ0.dev.nginx`](deploy/typ0.dev.nginx))
und ein Skript bereit, das testet, baut und `dist/` per rsync hochlädt:

```bash
deploy/deploy.sh                                  # Standard: towelies-server:/var/www/typ0.dev
DEPLOY_HOST=anderer-server deploy/deploy.sh       # anderer SSH-Host
```

### Caddy

Caddy holt das TLS-Zertifikat für die Domain selbst.

```caddy
typ0.example.de {
	root * /var/www/typ0
	encode zstd gzip
	file_server

	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"
	header /index.html Cache-Control "no-cache"
}
```

### nginx

```nginx
server {
    listen 80;
    server_name typ0.example.de;
    root /var/www/typ0;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # Dateinamen enthalten einen Hash und ändern sich bei jedem Build.
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # index.html immer neu laden, damit ein neuer Build sofort ankommt.
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
}
```

Für HTTPS mit nginx z. B. `certbot --nginx -d typ0.example.de` ausführen.

Die App braucht kein Routing auf dem Server, weil sie nur aus einer Seite besteht. Soll sie in
einem Unterverzeichnis laufen (`https://example.de/typ0/`), beim Build den Pfad angeben:
`npx vite build --base=/typ0/`.

## Projektstruktur

```
src/data/layout.ts      ISO-QWERTZ-Layout, einzige Quelle für Tasten, Positionen und Finger
src/data/fingers.ts     Namen und Farben der Finger
src/data/lessons.json   Lektionen
src/data/words.ts       Wortliste für Übungstexte
src/lib/                Reine Logik mit Tests: Textgenerator, Trainer, Statistik, Shift-Regel, Fortschritt
src/components/         Tastatur, Lernpfad, Trainer, Hinweise
e2e/                    Playwright-Tests
```

Der Fortschritt läuft über die Schnittstelle `ProgressStore` (`src/lib/progress/`). Heute steht
`LocalStorageStore` dahinter. Für Konten mit Server-Speicher genügt eine weitere Implementierung,
die Komponenten bleiben unverändert.
