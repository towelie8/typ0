# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektstand

typ0 ist eine geplante Web-App zum Erlernen des 10-Finger-Schreibens auf deutscher QWERTZ-Tastatur
(Zielgruppe: absolute Anfänger). Es gibt noch **keinen Code** — nur Anforderungen.
Build-, Lint- und Test-Befehle hier nachtragen, sobald das Projekt aufgesetzt ist.

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
