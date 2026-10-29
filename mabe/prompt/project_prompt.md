Erstelle eine Web-Anwendung zum Erlernen des 10-Finger-Schreibens auf einer deutschen QWERTZ-Tastatur. Die Anwendung richtet sich an absolute Anfänger und soll einen geführten Lernpfad bieten.

## 1. Ziel und Kernfunktionen

Eine Single-Page-Web-App mit folgenden Kernfunktionen:

A) Tastatur-Visualisierung mit Finger-Zuordnung
- Eine interaktive QWERTZ-Tastatur als SVG/HTML-Grafik.
- Jede Taste ist farblich der zuständigen Fingerzone zugeordnet (Grundreihe: A/S/D/F links, J/K/L/Ö rechts; Daumen: Leertaste).
- Bei Tastendruck (echte Tastatur oder Klick) leuchtet die Taste auf und zeigt an, welcher Finger sie drücken soll.

B) Hand-/Finger-Animation pro Taste
- Für jede einzelne Taste zeigt eine Animation, wie sich die Hand bzw. der Finger von der Grundstellung zur Ziel-Taste bewegt.
- Die Animation sollte als SVG-Handgrafik umgesetzt werden, bei der der aktive Finger hervorgehoben und die Bewegungsrichtung angedeutet wird.
- Nutze dafür eine geeignete Animationsbibliothek (z. B. Framer Motion / `motion/react`), damit die Übergänge flüssig sind und `prefers-reduced-motion` respektiert wird.

C) Geführter Lernpfad für blutige Anfänger
- Gliedere den Lernstoff in aufeinander aufbauende Lektionen. Die didaktische Reihenfolge ist:
  1. Grundreihe (ASDF JKLÖ) inkl. Leertaste – Fokus auf Grundstellung und Zurückkehren nach jedem Anschlag.
  2. Obere Reihe (QWERTZ UIOPÜ).
  3. Untere Reihe (YXCVB NM,.-).
  4. Großschreibung (Shift) und Satzzeichen.
  5. Zahlenreihe und Sonderzeichen (optional als spätere Erweiterung).
- Jede Lektion enthält kurze Übungstexte/Nonsens-Kombinationen, die nur die bereits gelernten Tasten verwenden.
- Neue Tasten werden erst freigeschaltet, wenn die vorherige Lektion mit einer Mindestgenauigkeit (z. B. 95 %) abgeschlossen wurde.
- Fortschritt und Genauigkeit werden pro Lektion gespeichert (z. B. in `localStorage`).

## 2. Vorgeschlagener Tech-Stack (bitte im Plan bestätigen oder begründet anpassen)

- Framework: React mit TypeScript (Next.js optional, wenn dir das für Routing/Deployment sinnvoll erscheint).
- Styling: Tailwind CSS.
- Tastatur- und Hand-Visualisierung: Prüfe die Bibliothek `vkeyboardhand` (npm: `vkeyboardhand`). Sie bietet SVG-basierte Tastatur- und Handgrafiken mit Event-Kopplung und ist React-kompatibel. Falls sie für die Animationsanforderungen nicht ausreicht, schlage eine eigene SVG-Implementierung mit Framer Motion vor.
- Animation: `motion/react` (Framer Motion) für SVG-Path-Animationen, Finger-Highlights und Übergänge.
- State/Storage: React State + `localStorage` für den Lernfortschritt.

## 3. Vorgehen (bitte im Plan-Modus starten)

Bevor du Code schreibst:
1. Erkunde die `vkeyboardhand`-Bibliothek (README, API, React-Beispiel) und bewerte, ob sie die Anforderungen an Tastatur-Layout, Finger-Highlighting und Hand-Animation abdeckt.
2. Erstelle einen detaillierten Implementierungsplan mit Komponentenstruktur, Datenmodell für Lektionen (JSON) und Animationskonzept.
3. Frage mich nach Unklarheiten, bevor du mit der Umsetzung beginnst.

Nach meiner Freigabe des Plans:
- Implementiere die App schrittweise. Beginne mit dem statischen Tastatur-Layout + Fingerzonen, dann die Interaktion (Tastendruck/Klick), dann die Hand-Animation, dann den Lernpfad mit Lektionslogik.
- Achte darauf, dass die Tastaturbelegung und Fingerzuordnung für QWERTZ korrekt sind (z. B. linke Hand: A/S/D/F, rechte Hand: J/K/L/Ö; Umlaute Ä/Ö/Ü werden vom rechten kleinen Finger gedrückt; ß ebenfalls rechter kleiner Finger).

## 4. Verifikationskriterien (am Ende ausführen)

- `npm run build` muss ohne Fehler durchlaufen.
- Starte den Dev-Server und prüfe im Browser:
  - Die QWERTZ-Tastatur wird korrekt angezeigt und die Fingerzonen sind farblich unterscheidbar.
  - Drücken einer Taste (physisch oder per Klick) löst das korrekte Tasten-Highlight und die passende Finger-Animation aus.
  - Die erste Lektion (Grundreihe) ist spielbar; ein Abschluss mit ≥ 95 % Genauigkeit schaltet die nächste Lektion frei.
  - Der Fortschritt bleibt nach einem Reload erhalten (`localStorage`).
- Prüfe die Animationen mit `prefers-reduced-motion: reduce` (Animationen sollten reduziert oder deaktiviert werden).

## 5. Zusätzliche Hinweise

- Die App-Sprache ist Deutsch.
- Halte den Code modular und gut kommentiert, damit die Lektionsdaten später einfach erweitert werden können.
- Wenn du für die Hand-Animation eigene SVG-Pfade erstellen musst, achte auf realistische Fingerbewegungen (Bogen von der Grundstellung zur Taste und zurück).
- Dokumentiere im `README.md`, wie man die App startet und wie neue Lektionen hinzugefügt werden.