-- ============================================================
-- Migration 008: Lesson resources – add file metadata columns
-- ============================================================

-- Add metadata columns to existing lesson_downloads table
ALTER TABLE lesson_downloads ADD COLUMN IF NOT EXISTS file_size    bigint;
ALTER TABLE lesson_downloads ADD COLUMN IF NOT EXISTS file_type    text;   -- 'pdf' | 'word' | 'excel' | 'powerpoint'
ALTER TABLE lesson_downloads ADD COLUMN IF NOT EXISTS storage_path text;   -- path inside the bucket

-- ============================================================
-- Storage bucket: lesson-files
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-files',
  'lesson-files',
  false,          -- private – only authenticated users can read
  52428800,       -- 50 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Authenticated users can read lesson files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can upload lesson files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-files' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update lesson files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'lesson-files' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete lesson files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lesson-files' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
