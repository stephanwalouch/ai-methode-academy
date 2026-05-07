-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text        NOT NULL,
  body        text        NOT NULL,
  is_active   boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Only one announcement active at a time (optional – enforced in app logic)
-- RLS: only admins can write, everyone can read active ones
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Everyone can read active announcements"
  ON announcements FOR SELECT
  USING (is_active = true);
