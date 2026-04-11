-- Add theme_json column to courses table for per-course theming configuration
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS theme_json JSONB NOT NULL DEFAULT '{}';
