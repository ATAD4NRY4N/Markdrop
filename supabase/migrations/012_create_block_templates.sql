-- Migration 012: Create private block template storage for user-managed sidebar templates.

CREATE TABLE IF NOT EXISTS public.block_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  category    text NOT NULL DEFAULT 'general',
  blocks_json text NOT NULL DEFAULT '[]',
  thumbnail   text,
  tags        text[] NOT NULL DEFAULT '{}',
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER block_templates_set_updated_at
  BEFORE UPDATE ON public.block_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.block_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_templates_select_own"
  ON public.block_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "block_templates_insert_own"
  ON public.block_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "block_templates_update_own"
  ON public.block_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "block_templates_delete_own"
  ON public.block_templates FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_block_templates_user_id
  ON public.block_templates (user_id);

CREATE INDEX IF NOT EXISTS idx_block_templates_category
  ON public.block_templates (category);

CREATE INDEX IF NOT EXISTS idx_block_templates_created_at
  ON public.block_templates (created_at DESC);