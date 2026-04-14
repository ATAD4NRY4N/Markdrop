import {
  filterBuiltInCourseTemplatesByCategory,
  getBuiltInCourseTemplateById,
  materializeCourseTemplateModules,
  materializeCourseTemplateSections,
  PRE_GENERATED_COURSE_TEMPLATES,
  searchBuiltInCourseTemplates,
} from "./preGeneratedCourseTemplates";
import { createCourse, createModule, deleteCourse, updateCourse } from "./storage";
import { supabase } from "./supabase";

export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: "all", label: "All Templates" },
  { value: "onboarding", label: "Onboarding" },
  { value: "technical", label: "Technical Training" },
  { value: "compliance", label: "Compliance" },
  { value: "narrated", label: "Narrated and Localized" },
  { value: "profile", label: "Profile README" },
  { value: "project", label: "Project README" },
  { value: "misc", label: "Miscellaneous" },
];

const getTemplateTimestamp = (template) =>
  template?.updated_at || template?.created_at || "1970-01-01T00:00:00.000Z";

const sortTemplates = (templates = []) =>
  [...templates].sort((left, right) => {
    if (!!left?.is_builtin !== !!right?.is_builtin) {
      return left?.is_builtin ? -1 : 1;
    }

    const leftTime = Date.parse(getTemplateTimestamp(left));
    const rightTime = Date.parse(getTemplateTimestamp(right));
    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return String(left?.title || "").localeCompare(String(right?.title || ""));
  });

const mergeTemplateCollections = (remoteTemplates = [], builtInTemplates = PRE_GENERATED_COURSE_TEMPLATES) =>
  sortTemplates([...builtInTemplates, ...(remoteTemplates || [])]);

const TEMPLATE_EDITOR_COURSE_SELECT = "id, user_id, is_template";

const parseLegacyTemplateBlocks = (template) => {
  try {
    const blocks = JSON.parse(template?.content || "[]");
    return Array.isArray(blocks) ? blocks : [];
  } catch {
    return [];
  }
};

async function getTemplateEditorCourse(courseId, expectedUserId = null) {
  if (!courseId) {
    return null;
  }

  const { data, error } = await supabase
    .from("courses")
    .select(TEMPLATE_EDITOR_COURSE_SELECT)
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  if (expectedUserId && data.user_id !== expectedUserId) {
    return null;
  }

  if (!data.is_template) {
    return null;
  }

  return data;
}

async function seedTemplateCourse(courseId, sourceTemplate = null) {
  const materializedModules = materializeCourseTemplateModules(sourceTemplate);
  const createdModules = [];

  if (materializedModules.length > 0) {
    for (const module of materializedModules) {
      const createdModule = await createModule(
        courseId,
        module.title,
        module.order,
        JSON.stringify(module.blocks),
      );
      createdModules.push({ ...createdModule, key: module.key });
    }
  } else {
    const initialBlocks = parseLegacyTemplateBlocks(sourceTemplate);
    const firstModule = await createModule(
      courseId,
      "Module 1",
      0,
      JSON.stringify(initialBlocks),
    );
    createdModules.push(firstModule);
  }

  const updates = {};

  if (sourceTemplate?.theme) {
    updates.theme_json = JSON.stringify(sourceTemplate.theme);
  }

  const sections = materializeCourseTemplateSections(sourceTemplate, createdModules);
  if (sections.length > 0) {
    updates.sections_json = JSON.stringify(sections);
  }

  if (sourceTemplate?.adaptiveConfig) {
    updates.adaptive_config = JSON.stringify(sourceTemplate.adaptiveConfig);
  }

  if (Object.keys(updates).length > 0) {
    await updateCourse(courseId, updates);
  }
}

async function createLinkedTemplateCourse({ templateId, title, description = "", userId, sourceTemplate = null }) {
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .insert({
      user_id: userId,
      title,
      description: description || "",
      is_template: true,
    })
    .select()
    .single();

  if (courseError) {
    throw courseError;
  }

  await seedTemplateCourse(courseData.id, sourceTemplate);

  const { data: linkedTemplate, error: linkError } = await supabase
    .from("templates")
    .update({ course_id: courseData.id })
    .eq("id", templateId)
    .select()
    .single();

  if (linkError) {
    throw linkError;
  }

  return {
    courseId: courseData.id,
    template: linkedTemplate,
  };
}

async function createEditableTemplateCopy(sourceTemplate, userId) {
  const { data: templateData, error } = await supabase
    .from("templates")
    .insert({
      title: sourceTemplate.title,
      description: sourceTemplate.description,
      category: sourceTemplate.category,
      content: sourceTemplate.content,
      thumbnail: sourceTemplate.thumbnail,
      images: sourceTemplate.images || [],
      tags: sourceTemplate.tags || [],
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const { courseId, template } = await createLinkedTemplateCourse({
    templateId: templateData.id,
    title: sourceTemplate.title,
    description: sourceTemplate.description,
    userId,
    sourceTemplate,
  });

  return {
    courseId,
    template: template || templateData,
  };
}

export async function getTemplatePermissions(template, userId) {
  const canManageTemplate = Boolean(
    userId && !template?.is_builtin && template?.user_id === userId,
  );

  if (!userId) {
    return {
      canManageTemplate,
      canEditLayout: false,
      editCreatesCopy: false,
    };
  }

  if (canManageTemplate) {
    return {
      canManageTemplate: true,
      canEditLayout: true,
      editCreatesCopy: false,
    };
  }

  if (template?.is_builtin) {
    return {
      canManageTemplate: false,
      canEditLayout: true,
      editCreatesCopy: true,
    };
  }

  const templateCourse = await getTemplateEditorCourse(template?.course_id, userId);

  return {
    canManageTemplate: false,
    canEditLayout: true,
    editCreatesCopy: !templateCourse,
  };
}

export async function getAllTemplates() {
  const builtInTemplates = PRE_GENERATED_COURSE_TEMPLATES;

  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return mergeTemplateCollections(data || [], builtInTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return builtInTemplates;
  }
}

export async function getTemplateById(id) {
  const builtInTemplate = getBuiltInCourseTemplateById(id);
  if (builtInTemplate) {
    return builtInTemplate;
  }

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
  const builtInTemplates = filterBuiltInCourseTemplatesByCategory(category);

  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return mergeTemplateCollections(data || [], builtInTemplates);
  } catch (error) {
    console.error("Error fetching templates by category:", error);
    return builtInTemplates;
  }
}

export async function searchTemplates(query) {
  const builtInTemplates = searchBuiltInCourseTemplates(query);

  try {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return mergeTemplateCollections(data || [], builtInTemplates);
  } catch (error) {
    console.error("Error searching templates:", error);
    return builtInTemplates;
  }
}

export async function instantiateBuiltInTemplateCourse(templateOrId, userId) {
  const template =
    typeof templateOrId === "string"
      ? getBuiltInCourseTemplateById(templateOrId)
      : templateOrId;

  if (!template?.is_builtin) {
    throw new Error("Built-in course template not found");
  }

  if (!userId) {
    throw new Error("A signed-in user is required to apply this template");
  }

  const course = await createCourse(
    userId,
    template.title,
    template.description || "",
    template.scormVersion || "1.2",
    template.passThreshold ?? 80,
    template.maxAttempts ?? 0,
  );

  const materializedModules = materializeCourseTemplateModules(template);
  const createdModules = [];

  for (const module of materializedModules) {
    const createdModule = await createModule(
      course.id,
      module.title,
      module.order,
      JSON.stringify(module.blocks),
    );
    createdModules.push({ ...createdModule, key: module.key });
  }

  const updates = {};
  if (template.theme) {
    updates.theme_json = JSON.stringify(template.theme);
  }

  const sections = materializeCourseTemplateSections(template, createdModules);
  if (sections.length > 0) {
    updates.sections_json = JSON.stringify(sections);
  }

  if (template.adaptiveConfig) {
    updates.adaptive_config = JSON.stringify(template.adaptiveConfig);
  }

  if (Object.keys(updates).length > 0) {
    await updateCourse(course.id, updates);
  }

  return course;
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
      try {
        const { template: linkedTemplate } = await createLinkedTemplateCourse({
          templateId: templateData.id,
          title: template.title,
          description: template.description,
          userId: template.user_id,
          sourceTemplate: template,
        });

        return { success: true, data: linkedTemplate || templateData };
      } catch (courseError) {
        console.error("Error creating companion template course:", courseError);
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

    if (data?.course_id && (updates.title !== undefined || updates.description !== undefined)) {
      const courseUpdates = {};
      if (updates.title !== undefined) {
        courseUpdates.title = updates.title;
      }
      if (updates.description !== undefined) {
        courseUpdates.description = updates.description;
      }

      if (Object.keys(courseUpdates).length > 0) {
        try {
          const templateCourse = await getTemplateEditorCourse(data.course_id, data.user_id);

          if (templateCourse) {
            await updateCourse(templateCourse.id, courseUpdates);
          } else if (data.user_id) {
            await createLinkedTemplateCourse({
              templateId: data.id,
              title: data.title,
              description: data.description,
              userId: data.user_id,
              sourceTemplate: data,
            });
          }
        } catch (courseSyncError) {
          console.error("Error syncing companion template course:", courseSyncError);
        }
      }
    }

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

export async function deleteTemplateWithCourse(template) {
  try {
    if (template?.course_id) {
      await deleteCourse(template.course_id);
    }

    const { error } = await supabase.from("templates").delete().eq("id", template.id);
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting template and companion course:", error);
    return { success: false, error: error.message };
  }
}

export async function resolveTemplateEditorCourse(template, userId) {
  try {
    if (!template?.id) {
      throw new Error("Template not found");
    }

    if (!userId) {
      throw new Error("A signed-in user is required to edit templates");
    }

    const templateCourse = await getTemplateEditorCourse(template.course_id, userId);
    if (templateCourse) {
      return { success: true, courseId: templateCourse.id, repaired: false, copied: false };
    }

    if (!template.is_builtin && template.user_id === userId) {
      const { courseId } = await createLinkedTemplateCourse({
        templateId: template.id,
        title: template.title,
        description: template.description,
        userId,
        sourceTemplate: template,
      });

      return {
        success: true,
        courseId,
        repaired: !!template.course_id,
        copied: false,
      };
    }

    const { courseId } = await createEditableTemplateCopy(template, userId);

    return {
      success: true,
      courseId,
      repaired: false,
      copied: true,
    };
  } catch (error) {
    console.error("Error resolving template editor course:", error);
    return { success: false, error: error.message };
  }
}

// For templates created before migration 010 (no course_id), creates and links
// a companion course on the fly so the owner can open the layout editor.
export async function ensureTemplateCourse(templateId, title, userId, description = "") {
  try {
    const { courseId } = await createLinkedTemplateCourse({
      templateId,
      title,
      description,
      userId,
      sourceTemplate: { title, description },
    });

    return { success: true, courseId };
  } catch (error) {
    console.error("Error ensuring template course:", error);
    return { success: false, error: error.message };
  }
}
