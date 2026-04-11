-- Migration 001: Create courses and course_modules tables for the Course Builder feature.
-- Run this in the Supabase SQL editor or via the Supabase CLI:
--   supabase db push

-- ============================================================
-- courses
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text NOT NULL DEFAULT 'Untitled Course',
  description     text NOT NULL DEFAULT '',
  scorm_version   text NOT NULL DEFAULT '1.2' CHECK (scorm_version IN ('1.2', '2004')),
  pass_threshold  integer NOT NULL DEFAULT 80 CHECK (pass_threshold BETWEEN 0 AND 100),
  max_attempts    integer NOT NULL DEFAULT 0 CHECK (max_attempts >= 0),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security — users can only see/edit their own courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses: owner full access"
  ON public.courses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- course_modules
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT 'Untitled Module',
  "order"     integer NOT NULL DEFAULT 0,
  blocks_json text NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for fast per-course queries
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id
  ON public.course_modules (course_id, "order");

-- Row Level Security — only the course owner can access modules
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_modules: owner full access"
  ON public.course_modules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_modules.course_id
        AND courses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_modules.course_id
        AND courses.user_id = auth.uid()
    )
  );
