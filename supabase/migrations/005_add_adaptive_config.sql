-- Migration 005: Add adaptive_config to courses for the Adaptive Learning feature.
-- Run with: supabase db push

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS adaptive_config text NOT NULL
  DEFAULT '{"variants":[],"checkpoints":[]}';
