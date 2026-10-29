# typ0 – Session-Prompt

Vor jeder Session lesen, in dieser Reihenfolge: `CLAUDE.md` → diese Datei → `mabe/starter.md` (Todos)
→ das jüngste Log in `mabe/session/`. Die vollständigen Anforderungen stehen in
`mabe/prompt/project_prompt.md`. Wo diese Datei davon abweicht, gilt diese Datei, weil die
Abweichungen bewusst mit dem User entschieden wurden.

## Verbindliche Entscheidungen (2026-10-29)

Diese Entscheidungen nicht neu verhandeln. Änderungen nur nach Rücksprache mit dem User.

| Thema | Entscheidung |
|---|---|
| Stack | Vite + React + TypeScript + Tailwind CSS v4 + `motion/react`. Kein Next.js, kein Backend. |
| Hosting | Später auf dem eigenen VServer unter einer eigenen Domain (noch nicht vorhanden): `dist/` wird statisch über nginx oder Caddy ausgeliefert. |
| Tastatur/Hand | Eigene SVGs. `vkeyboardhand` wurde verworfen: US-ANSI-Layout ohne Ä/Ö/Ü/ß und ohne `<>`, keine ISO-Enter-Taste, die Hand besteht nur aus statischen Posen mit Überblendung. |
| Übungstexte | Zuerst Nonsens-Silben (`asdf jklö`), danach echte deutsche Wörter, die nur aus bereits gelernten Tasten bestehen. |
| Tippfehler | Blockieren, bis die richtige Taste gedrückt wird. Der Fehler wird gezählt und rot markiert. |
| Fortschritt | Vorerst `localStorage`, aber nur über die Schnittstelle `ProgressStore`, damit später Konten oder ein Server-Backend andocken können. Komponenten greifen nie direkt auf `localStorage` zu. |
| Tests | Vitest für Logik, Playwright für E2E. |
| Mobil | Responsives Layout. Ohne physische Tastatur erscheint ein Hinweis; ein Klick auf eine Taste zeigt weiterhin Highlight und Animation. |
| Design | Nur helles Theme. Die Fingerzonen-Farben müssen klar unterscheidbar sein. |

## Architektur (Zielbild)

- `src/data/layout.ts`: ISO-QWERTZ-Layout als **einzige Quelle**: je Taste `KeyboardEvent.code`,
  Zeichen (normal/Shift), Position/Breite, Reihe und Finger. Tastatur, Hand und Textgenerator
  lesen alle daraus.
- `src/data/lessons.json`: Lektionen mit `id`, `title`, `newKeys`, `words` (optional) und
  `minAccuracy` (95). Das Freischalten ergibt sich aus der Reihenfolge im Array.
- `src/components/`: `Keyboard` (SVG aus Layout), `Hands` (SVG-Hände + Animation),
  `Trainer` (Übungszeile, Eingabe, Statistik), `LessonPath` (Lektionsübersicht mit Sperren).
- `src/lib/`: `textgen.ts` (Übungstext aus erlaubten Tasten), `stats.ts` (Genauigkeit, Tempo),
  `progress/` (`ProgressStore`-Interface + `LocalStorageStore`).
- Hand-Animation: Die Fingerspitze bewegt sich im Bogen von der Grundstellung zur Zieltaste und
  wieder zurück; der aktive Finger wird hervorgehoben. Bei `useReducedMotion()` wird nur
  hervorgehoben, ohne Bewegung.

## Fachregeln

- Grundstellung: A/S/D/F (links) und J/K/L/Ö (rechts), Daumen auf der Leertaste.
- Ä, Ö, Ü, ß sowie die übrigen Tasten rechts außen drückt der rechte kleine Finger.
- Shift wird mit der Hand gegenüber der Zeichentaste gedrückt.
- Die Ziffer 6 drückt der linke Zeigefinger.
- Die Leertaste drückt der rechte Daumen; Alt/Win/Alt Gr der Daumen der jeweiligen Seite.
- Lernpfad: 1 Grundreihe + Leertaste → 2 obere Reihe → 3 untere Reihe → 4 Shift + Satzzeichen
  → 5 (optional) Zahlen/Sonderzeichen. Übungstexte enthalten nur bereits gelernte Tasten.
- Die nächste Lektion wird ab ≥ 95 % Genauigkeit freigeschaltet.
- Die App-Sprache ist Deutsch.

## Meilensteine

Reihenfolge einhalten. Jeder Meilenstein endet mit grünen Tests und einem Commit.

1. **M1:** Projekt-Setup (Vite, TS, Tailwind, Vitest, Playwright) + statische Tastatur mit Fingerzonen.
2. **M2:** Interaktion: Highlight bei physischem Tastendruck und Klick, Fingerangabe.
3. **M3:** Hand-Animation mit `motion/react`, inkl. reduced motion.
4. **M4:** Lernpfad: Lektionsdaten, Textgenerator, Trainer, Freischaltung, Fortschritt über `ProgressStore`.
5. **M5:** README (Start, neue Lektionen hinzufügen, Deployment per nginx/Caddy) und Endabnahme.

Danach die Befehle (dev, build, test, e2e, Einzeltest) in `CLAUDE.md` nachtragen.

## Definition of Done

- `npm run build`, `npm test` und `npm run test:e2e` laufen fehlerfrei.
- Im Browser geprüft: Tastatur und Fingerfarben sind korrekt; Tastendruck/Klick löst Highlight
  und die passende Finger-Animation aus; Lektion 1 ist spielbar und schaltet bei ≥ 95 % die
  nächste frei; der Fortschritt übersteht einen Reload; bei `prefers-reduced-motion: reduce`
  sind die Animationen reduziert.

## Session-Ende

- Log unter `mabe/session/JJJJ-MM-TT.md`: was gemacht wurde, Entscheidungen, nächste Schritte.
- Erledigte Todos in `mabe/starter.md` abhaken, neue eintragen. Die Todos sind parallel als GitHub-Issues in
  `towelie8/typ0` angelegt: Neue Todos auch als Issue anlegen, erledigte per `Closes #N` im Commit schließen.
- Commits als `towelie8`, ohne KI-Hinweis.
