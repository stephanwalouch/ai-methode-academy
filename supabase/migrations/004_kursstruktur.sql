-- ============================================================
-- AI Methode Academy – Komplette Kursstruktur
-- 6 Module, 83 Lektionen
-- ============================================================

DO $$
DECLARE
  v_course_id  uuid;
  v_module_id  uuid;
BEGIN

  -- Ersten Kurs holen (oder anpassen falls mehrere Kurse existieren)
  SELECT id INTO v_course_id FROM courses ORDER BY created_at LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Kein Kurs gefunden. Bitte zuerst einen Kurs im Admin-Bereich anlegen.';
  END IF;

  -- Bestehende Module + Lektionen dieses Kurses löschen (sauberer Neustart)
  DELETE FROM lesson_progress WHERE lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN modules m ON l.module_id = m.id
    WHERE m.course_id = v_course_id
  );
  DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = v_course_id);
  DELETE FROM modules WHERE course_id = v_course_id;

  -- ============================================================
  -- MODUL 1: Einstieg (11 Lektionen)
  -- ============================================================
  INSERT INTO modules (course_id, title, description, sort_order)
  VALUES (v_course_id, 'Einstieg', 'Das Fundament deiner KI-Agentur – was sie ist, wie das Geschäftsmodell funktioniert und welche Fehler du vermeiden solltest.', 0)
  RETURNING id INTO v_module_id;

  INSERT INTO lessons (module_id, title, sort_order, is_published) VALUES
    (v_module_id, '1.1 Willkommen & Kursüberblick',              0,  true),
    (v_module_id, '1.2 Für wen ist das Programm geeignet',        1,  true),
    (v_module_id, '1.3 Was ist eine KI-Agentur',                  2,  true),
    (v_module_id, '1.4 Vorteile einer KI-Agentur',                3,  true),
    (v_module_id, '1.5 Warum gerade jetzt starten',               4,  true),
    (v_module_id, '1.6 Überblick über das Geschäftsmodell',       5,  true),
    (v_module_id, '1.7 Typische Anfängerfehler',                  6,  true),
    (v_module_id, '1.8 Was dich im Kurs erwartet (Roadmap)',      7,  true),
    (v_module_id, '1.9 Häufige Fragen (FAQ)',                     8,  true),
    (v_module_id, '1.10 Tools & Setup (Überblick)',               9,  true),
    (v_module_id, '1.11 Abschluss Modul 1',                      10, true);

  -- ============================================================
  -- MODUL 2: Mindset & Erwartungshaltung (17 Lektionen)
  -- ============================================================
  INSERT INTO modules (course_id, title, description, sort_order)
  VALUES (v_course_id, 'Mindset & Erwartungshaltung', 'Der häufigste Grund für Scheitern ist nicht fehlende Technik – sondern der falsche Kopf. Dieses Modul gibt dir das richtige Fundament.', 1)
  RETURNING id INTO v_module_id;

  INSERT INTO lessons (module_id, title, sort_order, is_published) VALUES
    (v_module_id, '2.1 Willkommen zu Modul 2',                                         0,  true),
    (v_module_id, '2.2 Warum Mindset im Business entscheidend ist',                     1,  true),
    (v_module_id, '2.3 Die Wahrheit über Online-Business & KI (kein Get Rich Quick)',   2,  true),
    (v_module_id, '2.4 Realistische Erwartungen an Zeit & Ergebnisse',                  3,  true),
    (v_module_id, '2.5 Wie viel du wirklich verdienen kannst (realistische Beispiele)', 4,  true),
    (v_module_id, '2.6 Kurzfristiges Geld vs. nachhaltiges Einkommen',                 5,  true),
    (v_module_id, '2.7 Warum die meisten scheitern (und wie du es vermeidest)',         6,  true),
    (v_module_id, '2.8 Geduld vs. Ungeduld',                                            7,  true),
    (v_module_id, '2.9 Konsistenz schlägt Talent',                                      8,  true),
    (v_module_id, '2.10 Umgang mit Rückschlägen',                                       9,  true),
    (v_module_id, '2.11 Warum du keine Perfektion brauchst',                            10, true),
    (v_module_id, '2.12 Fokus statt Ablenkung',                                         11, true),
    (v_module_id, '2.13 Denkfehler von Anfängern',                                      12, true),
    (v_module_id, '2.14 Disziplin vs. Motivation',                                      13, true),
    (v_module_id, '2.15 Umfeld & negative Einflüsse',                                   14, true),
    (v_module_id, '2.16 Von Konsument zu Umsetzer',                                     15, true),
    (v_module_id, '2.17 Warum du nicht alles verstehen musst',                          16, true);

  -- ============================================================
  -- MODUL 3: KI-Tools & Infrastruktur (16 Lektionen)
  -- ============================================================
  INSERT INTO modules (course_id, title, description, sort_order)
  VALUES (v_course_id, 'KI-Tools & Infrastruktur', 'Dein vollständiger Toolstack: Webseiten, Funnels, Chatbots, Automationen und Voice Agents – Schritt für Schritt aufgebaut.', 2)
  RETURNING id INTO v_module_id;

  INSERT INTO lessons (module_id, title, sort_order, is_published) VALUES
    (v_module_id, '3.1 Willkommen zu Modul 3',                          0,  true),
    (v_module_id, '3.2 Wie du dieses Modul richtig nutzt',              1,  true),
    (v_module_id, '3.3 Überblick: Die 5 Säulen deiner KI-Agentur',     2,  true),
    (v_module_id, '3.4 Was ist KI?',                                     3,  true),
    (v_module_id, '3.5 Was sind LLMs?',                                  4,  true),
    (v_module_id, '3.6 Wie Tools zusammenarbeiten',                      5,  true),
    (v_module_id, '3.7 Säule 1: Webseiten & Leadsysteme – Einführung',  6,  true),
    (v_module_id, '3.8 Webseiten erstellen – Demo Teil 1',               7,  true),
    (v_module_id, '3.9 Webseiten erstellen – Demo Teil 2',               8,  true),
    (v_module_id, '3.10 Leadsysteme & Formulare einbinden',             9,  true),
    (v_module_id, '3.11 Säule 2: Funnel & Terminsysteme',               10, true),
    (v_module_id, '3.12 Funnel erstellen & Kalender integrieren (Demo)', 11, true),
    (v_module_id, '3.13 Säule 3: KI-Chatbots – Einführung & Demo',     12, true),
    (v_module_id, '3.14 Säule 4: KI-Automationen – Einführung & Demo', 13, true),
    (v_module_id, '3.15 Säule 5: Voice Agents – Einführung & Demo',    14, true),
    (v_module_id, '3.16 Tool-Setup, Kosten & Abschluss Modul 3',       15, true);

  -- ============================================================
  -- MODUL 4: Angebotsfindung, Positionierung & Monetarisierung (12 Lektionen)
  -- ============================================================
  INSERT INTO modules (course_id, title, description, sort_order)
  VALUES (v_course_id, 'Angebotsfindung, Positionierung & Monetarisierung', 'Was soll ich anbieten? An wen? Zu welchem Preis? Dieses Modul gibt dir klare Antworten und ein konkretes Angebot.', 3)
  RETURNING id INTO v_module_id;

  INSERT INTO lessons (module_id, title, sort_order, is_published) VALUES
    (v_module_id, '4.1 Willkommen zu Modul 4',                           0,  true),
    (v_module_id, '4.2 Warum dein Angebot wichtiger ist als deine Tools', 1,  true),
    (v_module_id, '4.3 Was ein gutes Angebot ausmacht',                   2,  true),
    (v_module_id, '4.4 Warum du mit einfachen Services starten solltest', 3,  true),
    (v_module_id, '4.5 Wie du mit den 5 Säulen Geld verdienst',          4,  true),
    (v_module_id, '4.6 Positionierung – Für wen machst du das?',         5,  true),
    (v_module_id, '4.7 Zielgruppen definieren & Nische wählen',          6,  true),
    (v_module_id, '4.8 Lokale vs. digitale Positionierung',              7,  true),
    (v_module_id, '4.9 Angebotsarten: Projektgeschäft vs. Retainer',     8,  true),
    (v_module_id, '4.10 Monetarisierungsstrategie entwickeln',            9,  true),
    (v_module_id, '4.11 Pricing – Wie du deinen Preis findest',          10, true),
    (v_module_id, '4.12 Angebotserstellung & strategischer Start',       11, true);

  -- ============================================================
  -- MODUL 5: Kundengewinnung & Sales (15 Lektionen)
  -- ============================================================
  INSERT INTO modules (course_id, title, description, sort_order)
  VALUES (v_course_id, 'Kundengewinnung & Sales', 'Ohne Kunden kein Business. Dieses Modul gibt dir ein komplettes, wiederholbares System zur Kundengewinnung – von der Lead-Recherche bis zum Abschluss.', 4)
  RETURNING id INTO v_module_id;

  INSERT INTO lessons (module_id, title, sort_order, is_published) VALUES
    (v_module_id, '5.1 Willkommen zu Modul 5',                          0,  true),
    (v_module_id, '5.2 Überblick: Dein Kundengewinnungssystem',         1,  true),
    (v_module_id, '5.3 Was Sales wirklich ist',                          2,  true),
    (v_module_id, '5.4 Leadgenerierung – Zielgruppen finden',           3,  true),
    (v_module_id, '5.5 Google Maps & Lead-Recherche (Demo)',             4,  true),
    (v_module_id, '5.6 Lead-Bewertung & Qualifizierung',                5,  true),
    (v_module_id, '5.7 Cold Outreach – Kanalvergleich & Strategie',     6,  true),
    (v_module_id, '5.8 Cold Calling – Vorbereitung & Skript',           7,  true),
    (v_module_id, '5.9 Cold DMs – Instagram & LinkedIn',                8,  true),
    (v_module_id, '5.10 E-Mail-Outreach',                               9,  true),
    (v_module_id, '5.11 Das Verkaufsgespräch führen',                   10, true),
    (v_module_id, '5.12 Einwände behandeln',                            11, true),
    (v_module_id, '5.13 Closing – Abschluss sicher machen',            12, true),
    (v_module_id, '5.14 Follow-up & Pipeline pflegen',                  13, true),
    (v_module_id, '5.15 CRM-Setup & Sales-System (Demo)',               14, true);

  -- ============================================================
  -- MODUL 6: Kundenmanagement, Upsells & Kundenbindung (12 Lektionen)
  -- ============================================================
  INSERT INTO modules (course_id, title, description, sort_order)
  VALUES (v_course_id, 'Kundenmanagement, Upsells & Kundenbindung', 'Dein erster Kunde ist der Anfang. Dieses Modul zeigt dir, wie du ihn zum langfristigen Partner machst und stabile Retainer aufbaust.', 5)
  RETURNING id INTO v_module_id;

  INSERT INTO lessons (module_id, title, sort_order, is_published) VALUES
    (v_module_id, '6.1 Willkommen zu Modul 6',                           0,  true),
    (v_module_id, '6.2 Kunden-Onboarding – Checkliste & Prozess',        1,  true),
    (v_module_id, '6.3 Kick-off-Gespräch & Erwartungsmanagement',        2,  true),
    (v_module_id, '6.4 Projekt-Setup & Zugang organisieren',             3,  true),
    (v_module_id, '6.5 Ersten Meilenstein liefern',                       4,  true),
    (v_module_id, '6.6 Projektumsetzung – Kommunikation & Updates',      5,  true),
    (v_module_id, '6.7 Qualitätssicherung & Projektübergabe',            6,  true),
    (v_module_id, '6.8 Feedback einholen & nachoptimieren',              7,  true),
    (v_module_id, '6.9 Langfristige Kundenbindung aufbauen',             8,  true),
    (v_module_id, '6.10 Upselling – Wann und wie?',                      9,  true),
    (v_module_id, '6.11 Upsell-Pfade & Erweiterungsangebote',           10, true),
    (v_module_id, '6.12 Retainer-Modelle & laufende Einnahmen',         11, true);

  RAISE NOTICE '✅ Kursstruktur erfolgreich angelegt:';
  RAISE NOTICE '   6 Module';
  RAISE NOTICE '   83 Lektionen (11 + 17 + 16 + 12 + 15 + 12)';
  RAISE NOTICE '   Kurs-ID: %', v_course_id;

END $$;

-- Ergebnis zur Kontrolle anzeigen
SELECT
  m.sort_order + 1            AS "Modul Nr.",
  m.title                     AS "Modul",
  COUNT(l.id)                 AS "Anzahl Lektionen"
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
WHERE m.course_id = (SELECT id FROM courses ORDER BY created_at LIMIT 1)
GROUP BY m.id, m.sort_order, m.title
ORDER BY m.sort_order;
