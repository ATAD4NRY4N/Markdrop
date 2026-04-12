-- Migration 009: Force PostgREST schema cache reload.
-- Migration 007 added a self-referential FK (template_id → courses.id) which
-- can leave PostgREST's cached schema in a stale state, causing 500 errors on
-- the courses query.  This migration signals PostgREST to rebuild its cache.

NOTIFY pgrst, 'reload schema';
