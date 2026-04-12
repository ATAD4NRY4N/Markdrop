import { supabase } from "./supabase";

export async function getAllTemplates() {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
}

export async function getTemplateById(id) {
  try {
    const { data, error } = await supabase.from("templates").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching template:", error);
    throw error;
  }
}

export async function getTemplatesByCategory(category) {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching templates by category:", error);
    throw error;
  }
}

export async function searchTemplates(query) {
  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching templates:", error);
    throw error;
  }
}

export async function createTemplate(template) {
  try {
    // 1. Insert the template record
    const { data: templateData, error } = await supabase
      .from("templates")
      .insert({
        title: template.title,
        description: template.description,
        category: template.category,
        content: template.content,
        thumbnail: template.thumbnail,
        images: template.images || [],
        tags: template.tags || [],
        user_id: template.user_id,
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Create a companion is_template course so the owner can open the full
    //    CourseBuilder to set up modules and page layouts.
    if (template.user_id) {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert({
          user_id: template.user_id,
          title: template.title,
          is_template: true,
        })
        .select()
        .single();

      if (!courseError && courseData) {
        // 3. Seed with a first module so the editor isn't empty
        await supabase.from("course_modules").insert({
          course_id: courseData.id,
          title: "Module 1",
          order: 0,
          blocks_json: "[]",
        });

        // 4. Link the course back to the template
        const { data: linked } = await supabase
          .from("templates")
          .update({ course_id: courseData.id })
          .eq("id", templateData.id)
          .select()
          .single();

        return { success: true, data: linked || templateData };
      }
    }

    return { success: true, data: templateData };
  } catch (error) {
    console.error("Error creating template:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTemplate(id, updates) {
  try {
    const { data, error } = await supabase
      .from("templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating template:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTemplate(id) {
  try {
    const { error } = await supabase.from("templates").delete().eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { success: false, error: error.message };
  }
}

// For templates created before migration 010 (no course_id), creates and links
// a companion course on the fly so the owner can open the layout editor.
export async function ensureTemplateCourse(templateId, title, userId) {
  try {
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert({
        user_id: userId,
        title,
        is_template: true,
      })
      .select()
      .single();

    if (courseError) throw courseError;

    await supabase.from("course_modules").insert({
      course_id: courseData.id,
      title: "Module 1",
      order: 0,
      blocks_json: "[]",
    });

    const { data: linked, error: linkError } = await supabase
      .from("templates")
      .update({ course_id: courseData.id })
      .eq("id", templateId)
      .select()
      .single();

    if (linkError) throw linkError;
    return { success: true, courseId: courseData.id };
  } catch (error) {
    console.error("Error ensuring template course:", error);
    return { success: false, error: error.message };
  }
}
