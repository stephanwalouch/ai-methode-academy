-- ============================================================
-- Mein Kursbereich – Datenbankschema
-- Ausführen in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Erweiterungen
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELLEN
-- ============================================================

-- Nutzerprofile (ergänzt auth.users)
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Einladungs-Token
CREATE TABLE invite_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT UNIQUE NOT NULL,
  label       TEXT,                          -- optionaler interner Name
  used_by     UUID REFERENCES profiles(id),
  used_at     TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,                   -- NULL = kein Ablaufdatum
  max_uses    INTEGER DEFAULT 1,             -- wie oft nutzbar
  use_count   INTEGER DEFAULT 0,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kurse
CREATE TABLE courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Module (Kapitel eines Kurses)
CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lektionen
CREATE TABLE lessons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id         UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  bunny_video_id    TEXT,      -- Video-ID aus Bunny.net
  bunny_library_id  TEXT,      -- Library-ID (überschreibt Env-Var wenn gesetzt)
  duration_seconds  INTEGER,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_published      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lektionsfortschritt
CREATE TABLE lesson_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- Community-Beiträge
CREATE TABLE forum_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id  UUID REFERENCES courses(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  is_pinned  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Antworten auf Beiträge
CREATE TABLE forum_replies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_solution BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Branding-Einstellungen (nur eine Zeile)
CREATE TABLE branding (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name   TEXT NOT NULL DEFAULT 'Mein Kursbereich',
  logo_url        TEXT,
  primary_color   TEXT NOT NULL DEFAULT '#6366f1',
  accent_color    TEXT NOT NULL DEFAULT '#8b5cf6',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Standardbranding einfügen
INSERT INTO branding (platform_name, primary_color, accent_color)
VALUES ('Mein Kursbereich', '#6366f1', '#8b5cf6');

-- ============================================================
-- TRIGGER: Profil bei Registrierung automatisch anlegen
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: updated_at automatisch aktualisieren
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER courses_updated_at    BEFORE UPDATE ON courses    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER branding_updated_at   BEFORE UPDATE ON branding   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_tokens   ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding        ENABLE ROW LEVEL SECURITY;

-- Hilfsfunktion: prüft ob aktueller Nutzer Admin ist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles
CREATE POLICY "Eigenes Profil lesen"      ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Eigenes Profil bearbeiten" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin: alle Profile"       ON profiles FOR ALL    USING (is_admin());

-- invite_tokens (nur Admins verwalten; Lesen für Token-Validierung via Service-Role)
CREATE POLICY "Admin: Einladungen verwalten" ON invite_tokens FOR ALL USING (is_admin());

-- courses
CREATE POLICY "Veröffentlichte Kurse lesen" ON courses FOR SELECT USING (is_published = TRUE OR is_admin());
CREATE POLICY "Admin: Kurse verwalten"      ON courses FOR ALL    USING (is_admin());

-- modules
CREATE POLICY "Module lesen"         ON modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND (c.is_published = TRUE OR is_admin()))
);
CREATE POLICY "Admin: Module verwalten" ON modules FOR ALL USING (is_admin());

-- lessons
CREATE POLICY "Lektionen lesen" ON lessons FOR SELECT USING (
  is_published = TRUE AND
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.id = module_id AND c.is_published = TRUE
  ) OR is_admin()
);
CREATE POLICY "Admin: Lektionen verwalten" ON lessons FOR ALL USING (is_admin());

-- lesson_progress
CREATE POLICY "Eigenen Fortschritt lesen"   ON lesson_progress FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Eigenen Fortschritt setzen"  ON lesson_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Eigenen Fortschritt löschen" ON lesson_progress FOR DELETE USING (user_id = auth.uid());

-- forum_posts
CREATE POLICY "Beiträge lesen"           ON forum_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Eigene Beiträge erstellen" ON forum_posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Eigene Beiträge bearbeiten" ON forum_posts FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Eigene Beiträge löschen"  ON forum_posts FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- forum_replies
CREATE POLICY "Antworten lesen"           ON forum_replies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Antworten erstellen"       ON forum_replies FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Antworten bearbeiten"      ON forum_replies FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Antworten löschen"         ON forum_replies FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- branding
CREATE POLICY "Branding lesen"     ON branding FOR SELECT USING (TRUE);
CREATE POLICY "Admin: Branding"    ON branding FOR ALL    USING (is_admin());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_modules_course_id    ON modules (course_id, sort_order);
CREATE INDEX idx_lessons_module_id    ON lessons (module_id, sort_order);
CREATE INDEX idx_progress_user_id     ON lesson_progress (user_id);
CREATE INDEX idx_progress_lesson_id   ON lesson_progress (lesson_id);
CREATE INDEX idx_forum_posts_user     ON forum_posts (user_id);
CREATE INDEX idx_forum_replies_post   ON forum_replies (post_id);
CREATE INDEX idx_invite_token         ON invite_tokens (token);
