-- Kurs umbenennen und veröffentlichen
UPDATE courses
SET
  title        = 'AI Methode Academy',
  description  = 'Dein komplettes System zum Aufbau einer eigenen KI-Agentur – von Mindset über Tools bis zu deinen ersten Kunden.',
  is_published = true
WHERE id = (SELECT id FROM courses ORDER BY created_at LIMIT 1);

-- Ergebnis prüfen
SELECT id, title, is_published,
  (SELECT COUNT(*) FROM modules WHERE course_id = courses.id) AS module_count,
  (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = courses.id) AS lesson_count
FROM courses
WHERE title = 'AI Methode Academy';
