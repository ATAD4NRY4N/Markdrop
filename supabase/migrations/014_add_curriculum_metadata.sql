-- Migration 014: Add curriculum path metadata and derived curriculum tags to
-- courses and course_modules so lesson repo paths can be generated consistently.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS curriculum_metadata_json text NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS curriculum_tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.course_modules
  ADD COLUMN IF NOT EXISTS curriculum_metadata_json text NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS curriculum_tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_courses_curriculum_tags
  ON public.courses USING GIN (curriculum_tags);

CREATE INDEX IF NOT EXISTS idx_course_modules_curriculum_tags
  ON public.course_modules USING GIN (curriculum_tags);