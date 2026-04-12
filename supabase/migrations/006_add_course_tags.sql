-- Migration 006: Add auto-generated content tags and manual product version tags to courses.
-- tags         — derived from H1 block content; populated by the client on first load
-- version_tags — manually set by the team to indicate which product version content suits

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS tags         text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS version_tags text[] NOT NULL DEFAULT '{}';

-- GIN indexes for efficient array-contains queries
CREATE INDEX IF NOT EXISTS idx_courses_tags
  ON public.courses USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_courses_version_tags
  ON public.courses USING GIN (version_tags);
