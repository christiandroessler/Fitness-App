// Ausführungshinweise für die Startbibliothek: 2–3 Stichpunkte pro Übung
// (Technik, häufige Fehler, Atmung), getrennt von der kurzen `beschreibung`
// gehalten. Werden im Timer angezeigt und einmalig pro Übung vorgelesen.
export const EXERCISE_HINWEISE: Record<string, string[]> = {
  // A.3 Erwärmung
  'ERW-01': ['Locker bleiben, nicht verkrampfen', 'Landung weich über den Vorfuß abfedern', 'Atmung gleichmäßig, nicht anhalten'],
  'ERW-02': ['Kurze, lockere Schritte', 'Arme entspannt mitschwingen', 'Aufrechte Haltung, Blick nach vorn'],
  'ERW-03': ['Knie bis zur Hüfte anheben, nicht höher erzwingen', 'Oberkörper bleibt aufrecht', 'Gleichmäßiges Tempo auf beiden Seiten'],
  'ERW-04': ['Ferse locker Richtung Gesäß führen, nicht reißen', 'Oberkörper ruhig halten', 'Kleine, schnelle Schritte'],
  'ERW-05': ['Große, kontrollierte statt kleiner hektischer Kreise', 'Schultern bleiben unten, nicht hochziehen', 'Nach 10 s Richtung wechseln'],
  'ERW-06': ['Hüfte bleibt locker und beweglich', 'Blick nach vorn, nicht auf die Füße schauen', 'Kontrolliertes Tempo, nicht stolpern'],

  // A.4 Aktivierung
  'AKT-01': ['Am oberen Punkt Gesäß bewusst anspannen', 'Unteren Rücken nicht überstrecken', 'Fersen nah am Gesäß aufstellen'],
  'AKT-02': ['Becken bleibt gerade, kippt nicht zur Seite', 'Anhebendes Bein aktiv gestreckt halten', 'Kontrolliert absenken, nicht fallen lassen'],
  'AKT-03': ['Spannung auf dem Band die ganze Zeit halten', 'Oberkörper bleibt ruhig, keine Ausweichbewegung', 'Knie zeigen in Fußrichtung, kippen nicht nach innen'],
  'AKT-04': ['Füße bleiben zusammen, nur das Knie öffnet sich', 'Becken nicht mit nach hinten drehen', 'Bewegung kommt aus der Hüfte, nicht aus dem Rücken'],
  'AKT-05': ['Becken bleibt waagerecht, kippt nicht', 'Blick auf einen festen Punkt für die Balance', 'Standbein leicht gebeugt, nicht durchgedrückt'],
  'AKT-06': ['Unterer Rücken bleibt flach am Boden', 'Bewegung langsam und kontrolliert, kein Schwung', 'Ruhig weiteratmen, Luft nicht anhalten'],
  'AKT-07': ['Schulterblätter zusammenziehen, nicht die Schultern hochziehen', 'Ellbogen nah am Körper führen', 'Aufrechte Haltung, kein Hohlkreuz'],
  'AKT-08': ['Kurze, schnelle Bewegung, Boden nur antippen', 'Knie bleiben locker, nicht blockieren', 'Aufrechte Körperhaltung halten'],

  // A.5 Mobilisation
  'MOB-01': ['Beide Sitzbeinhöcker möglichst am Boden lassen', 'Bewegung langsam und kontrolliert', 'Kein Ziehen oder Schmerz im Knie zulassen'],
  'MOB-02': ['Gestrecktes Bein bleibt lang, Zehen zeigen nach oben', 'Gewicht langsam zur Seite verlagern, nicht wippen', 'Nur so weit gehen, wie es sich angenehm dehnt'],
  'MOB-03': ['Oberkörper bleibt stabil, Bewegung kommt aus der Hüfte', 'Schwung nutzen, aber kontrolliert bleiben', 'Aufrechte Haltung, nicht ins Hohlkreuz fallen'],
  'MOB-04': ['Becken bleibt gerade, dreht nicht mit', 'Standbein stabil, leicht gebeugt', 'Kontrollierte Amplitude statt maximaler Höhe'],
  'MOB-05': ['Bewegung geht durch die ganze Wirbelsäule', 'Langsam und mit dem Atem verbinden', 'Schultern bleiben über den Handgelenken'],
  'MOB-06': ['Knie bleiben während der Rotation übereinander', 'Blick folgt der oberen Hand', 'Nur so weit drehen, wie die Schulter locker mitgeht'],
  'MOB-07': ['Bewegung kommt aus der Brustwirbelsäule, nicht aus dem unteren Rücken', 'Hüfte bleibt ruhig über den Knien', 'Langsam ein- und ausfädeln'],
  'MOB-08': ['Hinteres Bein bleibt möglichst gestreckt', 'Rotation kommt aus dem Oberkörper, nicht durch Reißen am Arm', 'Becken bleibt nach vorn ausgerichtet'],

  // A.6 Potentiate
  'POT-01': ['Kurze, schnelle Gegenbewegung vor dem Absprung', 'Weich über den Vorfuß landen', 'Bei Ermüdung lieber länger pausieren als Qualität verlieren'],
  'POT-02': ['Kurzer Bodenkontakt, wie ein Gummiball', 'Bewegung kommt aus dem Sprunggelenk, Knie bleiben leicht gebeugt', 'Aufrechte Haltung halten'],
  'POT-03': ['Sicher und kontrolliert auf dem äußeren Bein abfangen', 'Knie beim Landen nicht nach innen kippen lassen', 'Lieber kontrolliert als maximal weit springen'],
  'POT-04': ['Kleine Hüpfer, keinen Sprung in die Höhe erzwingen', 'Landung weich und leise', 'Bei Wackeln lieber die Amplitude reduzieren'],
  'POT-05': ['Sofort nach der Landung explosiv wieder abdrücken', 'Landung mit gebeugten Knien abfedern', 'Nur auf stabilem, rutschfestem Untergrund ausführen'],
  'POT-06': ['Landung aktiv abfangen und kurz halten', 'Arme zum Schwungholen nutzen', 'Weite ist zweitrangig — die Landequalität zählt'],

  // A.7 Kraft, kniedominant
  'KNI-01': ['Rumpfwinkel während der ganzen Bewegung konstant halten', 'Vorderes Knie zeigt in Richtung Fußspitze', 'Ferse des vorderen Fußes bleibt am Boden'],
  'KNI-02': ['Oberkörperwinkel bewusst wählen und beibehalten (aufrecht = mehr Oberschenkel, vorgebeugt = mehr Gesäß)', 'Knie kippt nicht nach innen', 'Besonders beim Absenken kontrolliertes Tempo'],
  'KNI-03': ['Gleicher Rumpfwinkel wie in der Stufe ohne Gewicht', 'Hanteln locker an den Seiten führen', 'Ferse des vorderen Fußes bleibt fest am Boden'],
  'KNI-04': ['Hantel sicher und nah am Körper halten', 'Rumpf bleibt stabil, kein Wegkippen zur Seite', 'Eher langsameres Tempo als bei leichteren Stufen'],
  'KNI-05': ['Am tiefsten Punkt Spannung halten, nicht ausruhen', 'Aus der Pause kontrolliert und zügig hochdrücken', 'Rumpfwinkel bleibt auch in der Pause stabil'],
  'KNI-06': ['Über die ganze Fußsohle hochdrücken, nicht abstoßen', 'Absenken so langsam wie möglich', 'Oberkörper bleibt aufrecht, kein Schwung mit den Armen'],
  'KNI-07': ['Kontrolliert und langsam absetzen, nicht fallen lassen', 'Knie bleibt über dem Fuß ausgerichtet', 'Gegenbein aktiv nach vorn strecken für die Balance'],

  // A.8 Kraft, hüftdominant
  'HUE-01': ['Oben Gesäß bewusst anspannen, nicht ins Hohlkreuz drücken', 'Becken bleibt während der Bewegung gerade', 'Standfuß fest auf dem Stuhl verankern'],
  'HUE-02': ['Rücken bleibt während der ganzen Bewegung gerade', 'Hüfte als Scharnier nutzen, Knie nur leicht gebeugt', 'Schwungbein und Oberkörper bewegen sich wie eine Waage'],
  'HUE-03': ['Hantel dicht am Standbein entlangführen', 'Rücken bleibt gerade, keine Rundung im unteren Rücken', 'Bewegung kommt aus der Hüfte, nicht aus dem Rücken'],
  'HUE-04': ['Langhantel eng am Körper führen', 'Blick leicht nach vorn/unten, Nacken bleibt neutral', 'Besonders beim Absenken kontrolliertes Tempo'],
  'HUE-05': ['Absenken so langsam wie möglich, dabei Spannung halten', 'Rumpf und Hüfte bleiben in einer Linie gestreckt', 'Rechtzeitig mit den Händen abfangen, kein hartes Aufkommen'],
  'HUE-06': ['Nur so weit absenken, wie die Spannung kontrolliert gehalten werden kann', 'Rumpf bleibt gestreckt, kein Abknicken in der Hüfte', 'Bei Bedarf jederzeit mit den Händen abfangen'],
  'HUE-07': ['Langhantel gut mit Handtuch oder Matte polstern', 'Becken bleibt gerade, dreht nicht zur Seite', 'Oben kurz die Spannung im Gesäß halten'],

  // A.9 Kraft, Wade
  'WAD-01': ['Ferse tief unter die Stufenkante absenken für vollen Bewegungsumfang', 'Kontrolliertes Tempo, nicht wippen', 'Balance notfalls mit leichtem Festhalten sichern'],
  'WAD-02': ['Gleicher voller Bewegungsumfang wie ohne Gewicht', 'Zusatzgewicht nah am Körper halten', 'Kontrolliert absenken, nicht ins Gewicht fallen lassen'],
  'WAD-03': ['Gebeugtes Knie spricht gezielt den Soleus an', 'Hantel gut polstern, damit sie nicht drückt', 'Vollen Bewegungsumfang nutzen, oben kurz halten'],

  // A.10 Isometrie
  'ISO-01': ['So hart wie möglich nach oben ziehen', 'Rumpf bleibt während der Kontraktion stabil', 'Nach jeder Kontraktion bewusst lockerlassen'],
  'ISO-02': ['Kraft gleichmäßig aufbauen, nicht ruckartig', 'Becken bleibt gerade, dreht nicht weg', 'Volle Anspannung für die gesamte Kontraktionsdauer halten'],
  'ISO-03': ['Vorgegebenen Winkel (90 Grad) einhalten', 'Rücken bleibt flach an der Wand', 'Maximale Spannung für die volle Kontraktionsdauer'],
  'ISO-04': ['Druck kommt aus dem Sprunggelenk, nicht aus dem Knie', 'Gleichmäßig und kontrolliert steigern', 'Nach der Kontraktion kurz lockern'],
  'ISO-05': ['Oberschenkel möglichst waagerecht halten', 'Rücken bleibt flach an der Wand', 'Ruhig weiteratmen, Luft nicht anhalten'],
  'ISO-06': ['Becken bleibt gerade, kippt nicht zur Seite', 'Angehobenes Bein aktiv strecken', 'Bei Zittern lieber den Winkel etwas verringern'],
  'ISO-07': ['Gewicht in die Fersen bringen, Rumpf bleibt aufrecht', 'Das Band liefert die Spannung — nicht selbst nach vorn fallen', 'Ruhig und gleichmäßig atmen'],

  // A.11 Rumpf, Sagittalebene
  'RSA-01': ['Unterer Rücken bleibt neutral, wird nicht flach gedrückt', 'Nur Kopf und Schultern leicht anheben, kein volles Aufrichten', 'Anspannung kommt aus der Bauchmuskulatur, nicht aus dem Nacken'],
  'RSA-02': ['Becken bleibt während der Bewegung ruhig und gerade', 'Arm und Bein strecken sich auf Höhe des Rückens', 'Langsam und kontrolliert, kein Schwung'],
  'RSA-03': ['Rumpf bleibt stabil, nur der Arm bewegt sich', 'Quadrate klein und kontrolliert zeichnen', 'Becken darf dabei nicht mitdrehen'],
  'RSA-04': ['Gerade Linie von Kopf bis Ferse halten', 'Becken weder anheben noch durchhängen lassen', 'Ruhig weiteratmen, Luft nicht anhalten'],
  'RSA-05': ['Becken bleibt gerade, kippt nicht zur angehobenen Seite', 'Bein nur so hoch heben, wie die Position stabil bleibt', 'Kontrolliertes Tempo statt schnellem Wechsel'],
  'RSA-06': ['Unterer Rücken bleibt am Boden', 'Bein so tief senken, wie die Spannung noch gehalten wird', 'Langsame, kontrollierte Bewegung'],
  'RSA-07': ['Nur leicht anheben, keine Überstreckung erzwingen', 'Blick nach unten, Nacken bleibt lang', 'Gleichmäßig anspannen, kein Ruckeln'],

  // A.12 Rumpf, Frontalebene
  'RFR-01': ['Gerade Linie von Kopf bis Knie halten', 'Hüfte nicht nach hinten wegkippen lassen', 'Schulter bleibt über dem Ellbogen'],
  'RFR-02': ['Gerade Linie von Kopf bis Fuß halten', 'Hüfte aktiv nach oben schieben, nicht durchhängen', 'Schulter bleibt stabil über dem Ellbogen'],
  'RFR-03': ['Rumpfspannung aus dem vollen Seitstütz beibehalten', 'Bein kontrolliert anheben, kein Schwung', 'Becken bleibt gerade, dreht nicht nach vorn'],
  'RFR-04': ['Hüfte aktiv nach oben drücken, gerade Linie halten', 'Oberes Bein liefert die Stützkraft auf der Bank', 'Bei zu starkem Zittern lieber die Haltezeit verkürzen'],
  'RFR-05': ['Deutlich intensiver als der kurze Hebel — Spannung bewusst aufbauen', 'Gerade Linie von Kopf bis Fuß', 'Lieber kürzer korrekt halten als lang mit Einknicken'],
  'RFR-06': ['Rumpf bewusst gegen das seitliche Wegkippen anspannen', 'Schultern bleiben auf gleicher Höhe', 'Aufrechte, neutrale Haltung ohne Ausweichen'],
  'RFR-07': ['Bewegung kommt aus der Hüfte, Oberkörper bleibt ruhig', 'Bein kontrolliert anheben und absenken, kein Schwung', 'Spannung auf dem Band durchgehend halten'],

  // A.13 Nacken
  'NAC-01': ['Bewegung ist klein — ein Doppelkinn-Gefühl reicht', 'Nacken bleibt lang, keine Kopfbewegung nach vorn', 'Gleichmäßig und ohne Verspannung ausführen'],
  'NAC-02': ['Kraft gleichmäßig aufbauen, nicht ruckartig', 'Kopf bewegt sich nicht, nur die Spannung wirkt', 'Hals bleibt lang, Schultern nicht hochziehen'],
  'NAC-03': ['Druck gleichmäßig und kontrolliert aufbauen', 'Kinn bleibt leicht eingezogen, nicht nach vorn schieben', 'Kopf bewegt sich nicht'],
  'NAC-04': ['Beide Seiten gleich stark trainieren', 'Schulter bleibt unten, zieht nicht mit hoch', 'Kopf bewegt sich nicht, nur Spannung aufbauen'],
  'NAC-05': ['Nur leicht anheben, wie in der Aeroposition auf dem Rad', 'Nacken bleibt lang, kein Überstrecken', 'Blick bleibt nach vorn/unten gerichtet'],
  'NAC-06': ['Zug des Bandes gleichmäßig entgegenwirken', 'Kinn bleibt leicht eingezogen', 'Bewegung ist minimal, es geht um die Spannung'],

  // A.14 Hüfte und Gesäß
  'HFT-01': ['Spannung auf dem Band durchgehend halten', 'Kniebeuge-Winkel während der Schritte konstant halten', 'Oberkörper bleibt aufrecht, kein Wippen'],
  'HFT-02': ['Becken bleibt waagerecht, auch mit Zusatzgewicht', 'Hantel dient der Balance, nicht dem Schwung', 'Blick auf einen festen Punkt für die Stabilität'],
  'HFT-03': ['Bewegung kommt aus der Hüfte, Oberkörper bleibt ruhig', 'Fuß bleibt in neutraler Position, dreht nicht ein', 'Kontrolliert anheben und absenken'],
  'HFT-04': ['Knie gegen das Band leicht nach außen drücken', 'Becken bleibt gerade, kein Überstrecken im Rücken', 'Oben Gesäß bewusst anspannen'],
  'HFT-05': ['Bewegung ist klein und kontrolliert', 'Standbein-Knie bleibt stabil über dem Fuß', 'Becken so tief absenken, wie es sauber kontrollierbar ist'],

  // A.15 Beweglichkeit
  'BEW-01': ['Becken leicht nach vorn kippen für die Dehnung', 'Oberkörper bleibt aufrecht, kein Hohlkreuz', 'In die Dehnung hineinatmen, nicht drücken'],
  'BEW-02': ['Nur so tief gehen, wie es sich noch kontrolliert anfühlt', 'Becken bleibt unter dem Körper, kippt nicht nach vorn', 'Gleichmäßig und ruhig atmen'],
  'BEW-03': ['Becken bleibt möglichst gerade ausgerichtet', 'In die Dehnung hinein entspannen, nicht ruckartig drücken', 'Bei Knieproblemen die Intensität reduzieren'],
  'BEW-04': ['Rücken bleibt gerade, Bewegung kommt aus der Hüfte', 'Nur so weit vorbeugen, wie die Dehnung angenehm ist', 'Knie des gestreckten Beins bleibt locker, nicht durchdrücken'],
  'BEW-05': ['Rücken bleibt aufrecht, nicht rund werden lassen', 'Knie sanft mit den Ellbogen nach unten führen', 'Keine ruckartigen Bewegungen'],
  'BEW-06': ['Bewegung kommt aus dem oberen Rücken, nicht aus dem unteren', 'Kopf bleibt in Verlängerung der Wirbelsäule', 'Langsam in die Streckung hineingehen'],
  'BEW-07': ['Nur so weit drehen, wie es in der Schulter angenehm ist', 'Rumpf bleibt stabil, keine Ausweichbewegung im Rücken', 'Gleichmäßig atmen, nicht die Luft anhalten'],
  'BEW-08': ['Ferse bleibt während der Dehnung am Boden', 'Knie des hinteren Beins bleibt gestreckt', 'Becken zur Wand schieben, nicht nur den Oberkörper'],
  'BEW-09': ['Gesäß sinkt Richtung Fersen ab', 'Atmung tief und ruhig in den Rücken lenken', 'Seitliche Verlagerung langsam und kontrolliert']
};
