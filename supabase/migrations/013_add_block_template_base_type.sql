-- Migration 013: Scope block templates to a single standard block type.

ALTER TABLE public.block_templates
  ADD COLUMN IF NOT EXISTS base_block_type text;

CREATE INDEX IF NOT EXISTS idx_block_templates_base_block_type
  ON public.block_templates (base_block_type);