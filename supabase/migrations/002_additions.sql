-- ============================================================
-- Migration 002: Notizen, Downloads, zuletzt angeschaute Lektion
-- Im Supabase SQL Editor ausführen
-- ============================================================

-- Zuletzt angeschaute Lektion pro User+Kurs
CREATE TABLE IF NOT EXISTS last_viewed_lessons (
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

-- Persönliche Notizen pro User+Lektion
CREATE TABLE IF NOT EXISTS lesson_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  lesson_id  UUID NOT NULL REFERENCES lessons(id)   ON DELETE CASCADE,
  content    TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- Downloads pro Lektion (vom Admin gepflegt)
CREATE TABLE IF NOT EXISTS lesson_downloads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE last_viewed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_downloads    ENABLE ROW LEVEL SECURITY;

-- last_viewed_lessons
CREATE POLICY "Eigene zuletzt-angesehen lesen"  ON last_viewed_lessons FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Eigene zuletzt-angesehen setzen" ON last_viewed_lessons FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Eigene zuletzt-angesehen update" ON last_viewed_lessons FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin: zuletzt-angesehen"        ON last_viewed_lessons FOR ALL USING (is_admin());

-- lesson_notes
CREATE POLICY "Eigene Notizen lesen"     ON lesson_notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Eigene Notizen erstellen" ON lesson_notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Eigene Notizen updaten"   ON lesson_notes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Eigene Notizen löschen"   ON lesson_notes FOR DELETE USING (user_id = auth.uid());

-- lesson_downloads
CREATE POLICY "Downloads lesen"       ON lesson_downloads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin: Downloads"      ON lesson_downloads FOR ALL USING (is_admin());

-- Trigger: lesson_notes updated_at
CREATE TRIGGER lesson_notes_updated_at
  BEFORE UPDATE ON lesson_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_last_viewed_user    ON last_viewed_lessons (user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user   ON lesson_notes (user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_downloads    ON lesson_downloads (lesson_id, sort_order);

-- Letzte login_at Spalte auf profiles (für User-Verwaltung)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
