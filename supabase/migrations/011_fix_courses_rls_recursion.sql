-- Migration 011: Fix recursive RLS policies between courses and course_collaborators.
--
-- The original collaboration policies referenced courses from course_collaborators
-- and course_collaborators from courses. Postgres detects that as infinite policy
-- recursion for courses SELECTs, which breaks both the dashboard query and
-- course creation responses.

CREATE OR REPLACE FUNCTION public.is_course_owner(target_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses
    WHERE id = target_course_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_course_collaborator(
  target_course_id uuid,
  allowed_roles text[] DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_collaborators
    WHERE course_id = target_course_id
      AND user_id = auth.uid()
      AND (
        allowed_roles IS NULL
        OR role = ANY(allowed_roles)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_course_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_course_collaborator(uuid, text[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_course_owner(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_course_collaborator(uuid, text[]) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "collaborators: owner full access" ON public.course_collaborators;
CREATE POLICY "collaborators: owner full access"
  ON public.course_collaborators
  FOR ALL
  USING (public.is_course_owner(course_id))
  WITH CHECK (public.is_course_owner(course_id));

DROP POLICY IF EXISTS "courses: collaborator read" ON public.courses;
CREATE POLICY "courses: collaborator read"
  ON public.courses
  FOR SELECT
  USING (public.is_course_collaborator(id));

DROP POLICY IF EXISTS "courses: editor update" ON public.courses;
CREATE POLICY "courses: editor update"
  ON public.courses
  FOR UPDATE
  USING (public.is_course_collaborator(id, ARRAY['editor']))
  WITH CHECK (public.is_course_collaborator(id, ARRAY['editor']));

DROP POLICY IF EXISTS "course_modules: collaborator read" ON public.course_modules;
CREATE POLICY "course_modules: collaborator read"
  ON public.course_modules
  FOR SELECT
  USING (public.is_course_collaborator(course_id));

DROP POLICY IF EXISTS "course_modules: editor update" ON public.course_modules;
CREATE POLICY "course_modules: editor update"
  ON public.course_modules
  FOR UPDATE
  USING (public.is_course_collaborator(course_id, ARRAY['editor']))
  WITH CHECK (public.is_course_collaborator(course_id, ARRAY['editor']));

DROP POLICY IF EXISTS "comments: participants read" ON public.course_comments;
CREATE POLICY "comments: participants read"
  ON public.course_comments
  FOR SELECT
  USING (
    public.is_course_owner(course_id)
    OR public.is_course_collaborator(course_id)
  );

DROP POLICY IF EXISTS "comments: participants insert" ON public.course_comments;
CREATE POLICY "comments: participants insert"
  ON public.course_comments
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.is_course_owner(course_id)
      OR public.is_course_collaborator(course_id)
    )
  );

DROP POLICY IF EXISTS "comments: author or owner update" ON public.course_comments;
CREATE POLICY "comments: author or owner update"
  ON public.course_comments
  FOR UPDATE
  USING (
    author_id = auth.uid()
    OR public.is_course_owner(course_id)
  );

DROP POLICY IF EXISTS "comments: author or owner delete" ON public.course_comments;
CREATE POLICY "comments: author or owner delete"
  ON public.course_comments
  FOR DELETE
  USING (
    author_id = auth.uid()
    OR public.is_course_owner(course_id)
  );

NOTIFY pgrst, 'reload schema';