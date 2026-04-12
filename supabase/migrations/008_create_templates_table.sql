-- Migration 008: Create the public templates table used by the Templates page.
-- Run with: supabase db push

CREATE TABLE IF NOT EXISTS public.templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  category    text NOT NULL DEFAULT 'general',
  content     text,
  thumbnail   text,
  images      jsonb NOT NULL DEFAULT '[]',
  tags        text[] NOT NULL DEFAULT '{}',
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER templates_set_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read templates
CREATE POLICY "templates_select_all"
  ON public.templates FOR SELECT
  USING (true);

-- Only the creator can insert/update/delete their templates
CREATE POLICY "templates_insert_own"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "templates_update_own"
  ON public.templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "templates_delete_own"
  ON public.templates FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_category  ON public.templates (category);
CREATE INDEX IF NOT EXISTS idx_templates_user_id   ON public.templates (user_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON public.templates (created_at DESC);
