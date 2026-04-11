-- Migration 002: Add status (draft/published) column to courses table.
-- Run via: npx supabase db push

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived'));

-- Backfill existing rows (already handled by DEFAULT, but explicit for clarity)
UPDATE public.courses SET status = 'draft' WHERE status IS NULL;
