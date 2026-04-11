import { supabase } from "./supabase";

// ── Collaborators ──────────────────────────────────────────────────────────

export const getCourseCollaborators = async (courseId) => {
  const { data, error } = await supabase
    .from("course_collaborators")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at");
  if (error) throw error;
  return data;
};

export const updateCollaboratorRole = async (courseId, userId, role) => {
  const { data, error } = await supabase
    .from("course_collaborators")
    .update({ role })
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeCollaborator = async (courseId, userId) => {
  const { error } = await supabase
    .from("course_collaborators")
    .delete()
    .eq("course_id", courseId)
    .eq("user_id", userId);
  if (error) throw error;
};

/** Returns 'owner' | 'editor' | 'reviewer' | null */
export const getUserCourseRole = async (courseId, userId) => {
  const { data: course } = await supabase
    .from("courses")
    .select("user_id")
    .eq("id", courseId)
    .maybeSingle();
  if (course?.user_id === userId) return "owner";

  const { data: collab } = await supabase
    .from("course_collaborators")
    .select("role")
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .maybeSingle();
  return collab?.role ?? null;
};

// ── Invitations ───────────────────────────────────────────────────────────

export const inviteCollaborator = async (courseId, email, role, invitedBy) => {
  const { data, error } = await supabase
    .from("course_invitations")
    .upsert(
      {
        course_id: courseId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: invitedBy,
        accepted_at: null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "course_id,email" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getPendingInvitations = async (courseId) => {
  const { data, error } = await supabase
    .from("course_invitations")
    .select("*")
    .eq("course_id", courseId)
    .is("accepted_at", null)
    .order("created_at");
  if (error) throw error;
  return data;
};

export const cancelInvitation = async (invitationId) => {
  const { error } = await supabase
    .from("course_invitations")
    .delete()
    .eq("id", invitationId);
  if (error) throw error;
};

export const getInvitationByToken = async (token) => {
  const { data, error } = await supabase
    .from("course_invitations")
    .select("*, courses(title)")
    .eq("token", token)
    .is("accepted_at", null)
    .single();
  if (error) throw error;
  return data;
};

export const acceptInvitation = async (token, userId, userEmail) => {
  const { data: inv, error: fetchErr } = await supabase
    .from("course_invitations")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();
  if (fetchErr) throw fetchErr;

  const { error: collabErr } = await supabase.from("course_collaborators").insert({
    course_id: inv.course_id,
    user_id: userId,
    email: userEmail,
    role: inv.role,
    invited_by: inv.invited_by,
  });
  // Ignore unique-constraint errors (already a collaborator)
  if (collabErr && !collabErr.message.includes("duplicate") && !collabErr.code === "23505") {
    throw collabErr;
  }

  await supabase
    .from("course_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", inv.id);

  return { courseId: inv.course_id, role: inv.role };
};

// ── Comments ──────────────────────────────────────────────────────────────

export const getCourseComments = async (courseId) => {
  const { data, error } = await supabase
    .from("course_comments")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at");
  if (error) throw error;
  return data;
};

export const createComment = async ({
  courseId,
  moduleId = null,
  blockId = null,
  parentId = null,
  body,
  status = "open",
  priority = "normal",
  authorId,
  authorEmail,
}) => {
  const { data, error } = await supabase
    .from("course_comments")
    .insert({
      course_id: courseId,
      module_id: moduleId,
      block_id: blockId,
      parent_id: parentId,
      author_id: authorId,
      author_email: authorEmail,
      body,
      status,
      priority,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateComment = async (commentId, updates) => {
  const { data, error } = await supabase
    .from("course_comments")
    .update(updates)
    .eq("id", commentId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteComment = async (commentId) => {
  const { error } = await supabase
    .from("course_comments")
    .delete()
    .eq("id", commentId);
  if (error) throw error;
};
