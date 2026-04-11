import { supabase } from "./supabase";

// Create a folder for the user
export const createFolder = async (userId, folderName, parentFolderId = null) => {
  const { data, error } = await supabase
    .from("folders")
    .insert({
      name: folderName,
      user_id: userId,
      parent_folder_id: parentFolderId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user's folders
export const getUserFolders = async (userId, parentFolderId = null) => {
  let query = supabase.from("folders").select("*").eq("user_id", userId);

  // If parentFolderId is specified, filter by it
  if (parentFolderId !== undefined) {
    if (parentFolderId === null) {
      query = query.is("parent_folder_id", null);
    } else {
      query = query.eq("parent_folder_id", parentFolderId);
    }
  }
  // If parentFolderId is undefined, get all folders for the user

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

// Create a markdown document
export const createMarkdown = async (userId, title, content, folderId = null) => {
  const { data, error } = await supabase
    .from("markdowns")
    .insert({
      title,
      content,
      user_id: userId,
      folder_id: folderId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user's markdown documents
export const getUserMarkdowns = async (userId, folderId = null) => {
  let query = supabase.from("markdowns").select("*").eq("user_id", userId);

  // If folderId is specified, filter by it
  if (folderId !== undefined) {
    if (folderId === null) {
      query = query.is("folder_id", null);
    } else {
      query = query.eq("folder_id", folderId);
    }
  }
  // If folderId is undefined, get all markdowns for the user

  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Update markdown document
export const updateMarkdown = async (markdownId, updates) => {
  const { data, error } = await supabase
    .from("markdowns")
    .update(updates)
    .eq("id", markdownId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete markdown document
export const deleteMarkdown = async (markdownId) => {
  const { error } = await supabase.from("markdowns").delete().eq("id", markdownId);

  if (error) throw error;
};

// Delete folder (and all its contents)
export const deleteFolder = async (folderId) => {
  const { error } = await supabase.from("folders").delete().eq("id", folderId);

  if (error) throw error;
};

// Get a single markdown by ID
export const getMarkdownById = async (markdownId) => {
  const { data, error } = await supabase
    .from("markdowns")
    .select("*")
    .eq("id", markdownId)
    .single();

  if (error) throw error;
  return data;
};

// Get all folders for a user (helper function for UserProfile)
export const getAllUserFolders = async (userId) => {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

// Get all markdowns for a user (helper function for UserProfile)
export const getAllUserMarkdowns = async (userId) => {
  const { data, error } = await supabase
    .from("markdowns")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
};

// ---------------------------------------------------------------------------
// Course storage functions
// ---------------------------------------------------------------------------

// Create a new course
export const createCourse = async (userId, title, description = "", scormVersion = "1.2", passThreshold = 80, maxAttempts = 0) => {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      user_id: userId,
      title,
      description,
      scorm_version: scormVersion,
      pass_threshold: passThreshold,
      max_attempts: maxAttempts,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all courses for a user
export const getUserCourses = async (userId) => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Get a single course by ID
export const getCourseById = async (courseId) => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error) throw error;
  return data;
};

// Update a course
export const updateCourse = async (courseId, updates) => {
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a course (cascades to modules via DB FK)
export const deleteCourse = async (courseId) => {
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) throw error;
};

// ---------------------------------------------------------------------------
// Course module storage functions
// ---------------------------------------------------------------------------

// Create a module in a course
export const createModule = async (courseId, title, order = 0, blocksJson = "[]") => {
  const { data, error } = await supabase
    .from("course_modules")
    .insert({
      course_id: courseId,
      title,
      order,
      blocks_json: blocksJson,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all modules for a course, ordered
export const getCourseModules = async (courseId) => {
  const { data, error } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order", { ascending: true });

  if (error) throw error;
  return data;
};

// Update a module
export const updateModule = async (moduleId, updates) => {
  const { data, error } = await supabase
    .from("course_modules")
    .update(updates)
    .eq("id", moduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a module
export const deleteModule = async (moduleId) => {
  const { error } = await supabase.from("course_modules").delete().eq("id", moduleId);
  if (error) throw error;
};

// Reorder modules by updating their order fields
export const reorderModules = async (moduleIds) => {
  const updates = moduleIds.map((id, index) =>
    supabase.from("course_modules").update({ order: index }).eq("id", id)
  );
  await Promise.all(updates);
};
