/**
 * Häufige deutsche Wörter in korrekter Schreibung. Der Textgenerator nimmt nur Wörter, die
 * vollständig aus bereits gelernten Tasten bestehen; vor der Shift-Lektion werden sie klein
 * geschrieben. Die Gruppen dienen nur der Übersicht: Wann ein Wort vorkommt, ergibt sich allein aus
 * seinen Buchstaben. Neue Wörter einfach ergänzen, Dubletten schaden nicht.
 */
export const WORDS: string[] = [
  // Grundstellung (a s d f j k l ö)
  'das', 'dass', 'als', 'all', 'lass', 'falls', 'ja', 'da', 'Saal', 'Kalk', 'Skala', 'Kajak', 'Öl', 'Fass', 'Fall',
  'Salsa', 'Lasso',
  // + g h ä
  'Hals', 'Glas', 'Gas', 'sag', 'lag', 'Hass', 'Jagd', 'Gala', 'Saga', 'Hall', 'Haff', 'Schal', 'Hagel',
  'kahl', 'hallo', 'Lack', 'Hälse', 'Gläser',
  // + e i r u
  'der', 'die', 'und', 'ist', 'sie', 'er', 'es', 'aus', 'auf', 'alle', 'leer', 'Haus', 'Haare', 'Frau', 'Geld',
  'Feld', 'Uhr', 'jeder', 'Lied', 'Leid', 'Ruf', 'Ruhe', 'Erde', 'Seife', 'Riese', 'Reise', 'Hilfe', 'Kuss',
  'sauer', 'sehr', 'frei', 'drei', 'dir', 'Idee', 'Lager', 'Regel', 'Kugel', 'Kreis', 'Kreide', 'Hafer', 'Gras',
  'Rad', 'Rede', 'Seele', 'egal', 'Ader', 'Lehrer', 'Adler', 'Juli', 'Jahr', 'Jahre', 'Käfer', 'Säge', 'Räder',
  'Sieg', 'Ufer', 'heiß', 'lieb', 'Eis', 'Reis', 'Saft', 'Hase', 'Hasel', 'Fee', 'Ski', 'Esel', 'Igel', 'Fuß',
  // + q w t z o p ü
  'was', 'wo', 'wie', 'wir', 'Wort', 'Tor', 'Tag', 'Zeit', 'oft', 'Post', 'Paket', 'Tür', 'über', 'Topf', 'Zug',
  'Weg', 'Welt', 'Wasser', 'Wetter', 'Wolke', 'Zahl', 'Quelle', 'Quark', 'Opa', 'Oper', 'Pilz', 'Platz', 'heute',
  'Hose', 'Kopf', 'Stuhl', 'Stift', 'Sport', 'Spiel', 'Tier', 'Weide', 'Pferd', 'Pause', 'Ziege', 'Zoo', 'Hotel',
  'früh', 'müde', 'für', 'Glut', 'Lust', 'Tee', 'Tasse', 'Torte', 'Gast', 'groß', 'gut', 'alt', 'Herz', 'jetzt',
  'Uhrzeit', 'Leute', 'Straße', 'Zettel', 'Pizza', 'Party', 'Suppe', 'Teller', 'Wurst', 'Kartoffel', 'Tisch',
  'Pflaume', 'Ostern', 'Sonntag',
  // + c v b n m
  'ich', 'ein', 'eine', 'nicht', 'mit', 'von', 'bei', 'man', 'noch', 'nach', 'auch', 'nur', 'dann', 'wenn',
  'Buch', 'Baum', 'Brot', 'Blume', 'Bank', 'Mann', 'Mond', 'Name', 'Nacht', 'Morgen', 'Abend', 'Bild', 'immer',
  'schon', 'bin', 'kann', 'machen', 'Musik', 'Milch', 'Wind', 'Woche', 'Monat', 'Vater', 'Mutter', 'Kind', 'Hund',
  'Katze', 'Sonne', 'Regen', 'Himmel', 'Fenster', 'Stadt', 'Land', 'Wald', 'Berg', 'Bein', 'Vogel', 'viel',
  'Schule', 'Freund', 'Familie', 'Garten', 'Zimmer', 'Küche', 'Montag', 'Winter', 'Sommer', 'Frühling', 'Herbst',
  'neun', 'zehn', 'Ball', 'Bach', 'Ente', 'Insel', 'Licht', 'Mensch', 'schnell', 'Brief', 'Bus', 'Bahn', 'Moment',
  // + y x , . -
  'Text', 'Taxi', 'Hexe', 'Boxen', 'Typ', 'Yoga', 'Pony', 'Lexikon', 'extra', 'Axt', 'mixen', 'Baby', 'Hobby',
  'System', 'Party', 'Xylofon', 'E-Mail', 'T-Shirt', 'U-Bahn', 'Fax', 'Max', 'Hyäne',
]
