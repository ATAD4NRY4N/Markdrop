-- Migration 010: Link templates to companion courses for full layout editing.
-- Each template now has a backing is_template=true course that the owner can
-- open in CourseBuilder to add modules, set layouts, and edit content.
-- Also adds sections_json to courses (used by CourseContext, was missing from DB).

-- Link templates → their companion course
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_templates_course_id
  ON public.templates (course_id)
  WHERE course_id IS NOT NULL;

-- sections_json stores the named-section groupings for a course's module list
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS sections_json text NOT NULL DEFAULT '[]';
