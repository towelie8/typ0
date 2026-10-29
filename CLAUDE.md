# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektstand

typ0 ist eine Web-App zum Erlernen des 10-Finger-Schreibens auf deutscher QWERTZ-Tastatur
(Zielgruppe: absolute Anfänger). Stand: M1–M4 fertig (Tastatur mit Fingerzonen, Highlight, animierte Hände, Lernpfad mit Trainer), M5 (README, Endabnahme) offen.

## Befehle

```bash
npm run dev                          # Dev-Server
npm run build                        # Typecheck (tsc) + Produktions-Build nach dist/
npm test                             # Vitest (Unit-Tests unter src/**/*.test.ts)
npx vitest run src/data/layout.test.ts -t "Grundstellung"   # einzelner Test
npm run test:e2e                     # Playwright; baut und startet selbst `vite preview` auf :4173
```

Playwright-Browser fehlen nach einem Update → `npx playwright install chromium`.

## Architektur

- `src/data/layout.ts` ist die **einzige Quelle** für das ISO-QWERTZ-Layout: Reihen als Tabellen
  (`KeyboardEvent.code`, Zeichen, Shift-Zeichen, Finger, Breite), x-Positionen werden daraus berechnet.
  `code` ist die physische US-Position, daher liefert `KeyY` ein „z“. ISO-Enter reicht über zwei Reihen
  (`keysInRow` liefert beide Ausschnitte). Abfragen über `keyByCode`/`keyByChar`, Grundstellung in `HOME_KEYS`.
- `src/data/fingers.ts`: Name und Farben je Finger. `src/components/Keyboard.tsx` zeichnet das SVG nur
  aus diesen Daten; die Tasten tragen `data-code`/`data-finger`/`data-home`, die Finger `data-digit`/`data-highlight`,
  die Kuppe `data-tip` (von E2E-Tests genutzt).
- Eingabe: `src/hooks/useKeyState.ts` hört window-weit auf keydown/keyup (über `code`, nicht `key`) und
  verwaltet den Zustand über den reinen Reducer `src/lib/keyState.ts` (`pressed` = gehalten,
  `active` = zuletzt gedrückt, bleibt für die Fingeranzeige stehen). Klicks auf die SVG-Tasten gehen
  über dieselben `press`/`release`-Funktionen. Strg/Meta-Kürzel werden nicht abgefangen, Tab bleibt frei.
- Hände: `src/components/Hands.tsx` liegt als `<g>` im SVG der Tastatur (`pointer-events: none`).
  Geometrie rein und getestet in `src/lib/hands.ts` (Tasteneinheiten): `Digit` teilt den Layout-`thumb`
  in `l-thumb`/`r-thumb` (Leertaste = rechter Daumen). Ziel jedes Fingers ist die gehaltene Taste aus
  `pressed` (`digitTargets`), sonst die Grundstellung; motion animiert einen Fortschrittswert über eine
  Bézierkurve (`arcPoint`). Hervorgehoben wird der Finger von `active`. `useReducedMotion()` → keine Bewegung.
  Darstellung als Piktogramm (Wunsch User): Silhouette aus Handfläche (`src/lib/handShape.ts`) und Fingern als
  runde Linien; dunkler Umriss über eine Maske, Inneres halbtransparent weiß, aktiver Finger in Zonenfarbe.
- Shift-Regel: `strokesForChar` in `src/lib/strokes.ts` (Shift mit der Gegenhand); `shiftAdvice` im
  Reducer meldet Shift auf der falschen Seite.
- Lernpfad: `src/data/lessons.json` (Reihenfolge = Freischaltreihenfolge, `newKeys` als Zeichen, Großbuchstaben
  = mit Shift), Wortliste `src/data/words.ts`. `src/lib/textgen.ts` erzeugt Übungstexte nur aus gelernten
  Zeichen (`allowedChars`), Wörter vor der Shift-Lektion klein (`fitWord`). Tests prüfen jede Lektion.
- Trainer: reiner Reducer `src/lib/trainer.ts`, prüft `code` + Shift statt `key` (OS-Layout egal). Eingaben
  kommen über den `onKey`-Callback von `useKeyState`. Ohne laufende Lektion ist die Seite die freie Tastatur
  (M2/M3-Tests verlassen sich darauf).
- Fortschritt nur über `ProgressStore` (`src/lib/progress/`), nie direkt `localStorage`; Schlüssel
  `typ0.progress.v1`. Genauigkeit wird abgerundet (`stats.ts`).
- E2E: `typeExercise`/`codeForChar` in `e2e/helpers.ts` tippen den Übungstext aus `data-text` ab.
- Texte über Finger: `FINGERS[f].name` (Nominativ) bzw. `.dative` („mit dem rechten Zeigefinger“).
- Stolperstein: `'ß'.toUpperCase()` ist „SS“. Buchstabentasten erkennt man daran, dass `shiftChar`
  der Großbuchstabe von `char` ist (`isLetterKey` in `src/lib/keyName.ts`).
- E2E: Die keydown-Listener hängen erst nach dem ersten Effekt; vor Tastendrücken direkt nach
  `goto()` `waitForKeyListener(page)` aus `e2e/helpers.ts` aufrufen.

## Session-Ablauf (`mabe/`)

- Vor jeder Session `mabe/prompt/session_prompt.md` lesen: verbindliche Entscheidungen
  (Vite + React + TS + Tailwind v4 + `motion/react`, eigene SVGs statt `vkeyboardhand`,
  Vitest + Playwright, Fortschritt über `ProgressStore`), Architektur, Meilensteine M1–M5.
  Er geht `mabe/prompt/project_prompt.md` (Rohanforderungen) vor.
- Offene Todos stehen in `mabe/starter.md`.
- Nach jeder Session ein Session-Log unter `mabe/session/` anlegen.

## Vorgaben aus dem Project Prompt (Kurzfassung)

- Umsetzungsreihenfolge: statische Tastatur + Fingerzonen → Interaktion (Taste/Klick) →
  Hand-Animation → Lernpfad mit Lektionslogik.
- Lernpfad: Grundreihe+Leertaste → obere Reihe → untere Reihe → Shift/Satzzeichen →
  (optional) Zahlen/Sonderzeichen. Übungstexte nur aus bereits gelernten Tasten;
  Freischaltung der nächsten Lektion ab 95 % Genauigkeit.
- Fingerzuordnung muss QWERTZ-korrekt sein: Grundstellung A/S/D/F und J/K/L/Ö, Daumen auf
  Leertaste; Ä, Ö, Ü und ß gehören zum rechten kleinen Finger.
- `prefers-reduced-motion` muss Animationen reduzieren/abschalten.
- App-Sprache Deutsch. Lektionsdaten so modular halten, dass neue Lektionen leicht ergänzt
  werden können; README muss Start und Hinzufügen neuer Lektionen dokumentieren.

## Definition of Done

`npm run build` fehlerfrei; im Browser geprüft: Tastatur + Fingerfarben korrekt,
Highlight und Finger-Animation bei Tastendruck/Klick, Lektion 1 spielbar und schaltet bei
≥ 95 % die nächste frei, Fortschritt übersteht Reload, reduzierte Animationen bei
`prefers-reduced-motion: reduce`.

## Git

Privates Repo: als `towelie8 <57617678+towelie8@users.noreply.github.com>` committen
(repo-lokal gesetzt), keine KI-Attribution in Commits.
