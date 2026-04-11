-- Migration 004: Course collaboration — roles, invitations, and review comments
-- Run with: supabase db push

-- ============================================================
-- course_collaborators  (accepted members)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_collaborators (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL CHECK (role IN ('editor', 'reviewer')),
  invited_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

ALTER TABLE public.course_collaborators ENABLE ROW LEVEL SECURITY;

-- Course owner can manage all collaborators for their courses
CREATE POLICY "collaborators: owner full access"
  ON public.course_collaborators FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.courses
            WHERE courses.id = course_collaborators.course_id
              AND courses.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses
            WHERE courses.id = course_collaborators.course_id
              AND courses.user_id = auth.uid())
  );

-- Collaborators can see their own record
CREATE POLICY "collaborators: self read"
  ON public.course_collaborators FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================
-- course_invitations  (pending invites by email + token)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_invitations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL CHECK (role IN ('editor', 'reviewer')),
  token       text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  invited_by  uuid REFERENCES auth.users(id),
  accepted_at timestamptz,
  expires_at  timestamptz NOT NULL DEFAULT now() + INTERVAL '7 days',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, email)
);

ALTER TABLE public.course_invitations ENABLE ROW LEVEL SECURITY;

-- Course owner can manage all invitations
CREATE POLICY "invitations: owner full access"
  ON public.course_invitations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.courses
            WHERE courses.id = course_invitations.course_id
              AND courses.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses
            WHERE courses.id = course_invitations.course_id
              AND courses.user_id = auth.uid())
  );

-- Any authenticated user can look up an invitation by token to accept it
CREATE POLICY "invitations: authenticated read"
  ON public.course_invitations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- course_comments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id    uuid REFERENCES public.course_modules(id) ON DELETE SET NULL,
  block_id     text,          -- optional block UUID within the module
  parent_id    uuid REFERENCES public.course_comments(id) ON DELETE CASCADE,
  author_id    uuid NOT NULL REFERENCES auth.users(id),
  author_email text NOT NULL,
  body         text NOT NULL CHECK (char_length(body) >= 1),
  status       text NOT NULL DEFAULT 'open'   CHECK (status   IN ('open', 'in_progress', 'resolved')),
  priority     text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER course_comments_updated_at
  BEFORE UPDATE ON public.course_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_course_comments_course_id
  ON public.course_comments (course_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_module_id
  ON public.course_comments (module_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_parent_id
  ON public.course_comments (parent_id);

ALTER TABLE public.course_comments ENABLE ROW LEVEL SECURITY;

-- Owners and collaborators can read all comments for a course
CREATE POLICY "comments: participants read"
  ON public.course_comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.courses
            WHERE courses.id = course_comments.course_id
              AND courses.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.course_collaborators
               WHERE course_collaborators.course_id = course_comments.course_id
                 AND course_collaborators.user_id = auth.uid())
  );

-- Owners and collaborators can insert their own comments
CREATE POLICY "comments: participants insert"
  ON public.course_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM public.courses
              WHERE courses.id = course_comments.course_id
                AND courses.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.course_collaborators
                 WHERE course_collaborators.course_id = course_comments.course_id
                   AND course_collaborators.user_id = auth.uid())
    )
  );

-- Authors can update their own comments; owners can update any (e.g. change status)
CREATE POLICY "comments: author or owner update"
  ON public.course_comments FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.courses
               WHERE courses.id = course_comments.course_id
                 AND courses.user_id = auth.uid())
  );

-- Authors can delete their own; owners can delete any
CREATE POLICY "comments: author or owner delete"
  ON public.course_comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.courses
               WHERE courses.id = course_comments.course_id
                 AND courses.user_id = auth.uid())
  );

-- ============================================================
-- Extend courses & course_modules RLS for collaborators
-- ============================================================

-- Allow collaborators to SELECT courses they were invited to
CREATE POLICY "courses: collaborator read"
  ON public.courses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.course_collaborators
            WHERE course_collaborators.course_id = courses.id
              AND course_collaborators.user_id = auth.uid())
  );

-- Allow editors to UPDATE courses they collaborate on
CREATE POLICY "courses: editor update"
  ON public.courses FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.course_collaborators
            WHERE course_collaborators.course_id = courses.id
              AND course_collaborators.user_id = auth.uid()
              AND course_collaborators.role = 'editor')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.course_collaborators
            WHERE course_collaborators.course_id = courses.id
              AND course_collaborators.user_id = auth.uid()
              AND course_collaborators.role = 'editor')
  );

-- Allow collaborators to SELECT modules
CREATE POLICY "course_modules: collaborator read"
  ON public.course_modules FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.course_collaborators cc
            WHERE cc.course_id = course_modules.course_id
              AND cc.user_id = auth.uid())
  );

-- Allow editors to UPDATE modules
CREATE POLICY "course_modules: editor update"
  ON public.course_modules FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.course_collaborators cc
            WHERE cc.course_id = course_modules.course_id
              AND cc.user_id = auth.uid()
              AND cc.role = 'editor')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.course_collaborators cc
            WHERE cc.course_id = course_modules.course_id
              AND cc.user_id = auth.uid()
              AND cc.role = 'editor')
  );
