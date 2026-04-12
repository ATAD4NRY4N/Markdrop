-- Migration 007: Add template designer role and course template system.
-- Adds is_template + template_id to courses, and expands collaborator roles.
-- Run with: supabase db push

-- ── Add template columns to courses ─────────────────────────────────────────
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.courses(id) ON DELETE SET NULL;

-- ── Expand role CHECK on course_collaborators ────────────────────────────────
ALTER TABLE public.course_collaborators
  DROP CONSTRAINT IF EXISTS course_collaborators_role_check;

ALTER TABLE public.course_collaborators
  ADD CONSTRAINT course_collaborators_role_check
  CHECK (role IN ('editor', 'reviewer', 'template_designer'));

-- ── Expand role CHECK on course_invitations ──────────────────────────────────
ALTER TABLE public.course_invitations
  DROP CONSTRAINT IF EXISTS course_invitations_role_check;

ALTER TABLE public.course_invitations
  ADD CONSTRAINT course_invitations_role_check
  CHECK (role IN ('editor', 'reviewer', 'template_designer'));

-- ── Indexes for efficient template lookups ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_courses_template_id
  ON public.courses (template_id)
  WHERE template_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_courses_is_template
  ON public.courses (is_template)
  WHERE is_template = true;
