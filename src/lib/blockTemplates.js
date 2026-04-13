import { materializeTemplateBlocks } from "./preGeneratedSlideTemplates";
import { supabase } from "./supabase";

function formatBlockTemplateError(error) {
  const message = String(error?.message || "Unknown error");
  const code = String(error?.code || "");

  if (
    code === "PGRST205" ||
    /public\.block_templates/i.test(message) ||
    /schema cache/i.test(message)
  ) {
    return "Block templates are not available in the current Supabase schema yet. Run npm run supabase:sync to apply migration 012_create_block_templates.sql.";
  }

  return message;
}

export const BLOCK_TEMPLATE_CATEGORY_OPTIONS = [
  { value: "all", label: "All Templates" },
  { value: "general", label: "General" },
  { value: "layout", label: "Layout" },
  { value: "lesson", label: "Lesson Flow" },
  { value: "assessment", label: "Assessment" },
  { value: "media", label: "Media" },
  { value: "narration", label: "Narration" },
  { value: "marp", label: "MARP Slides" },
];

const getTemplateTimestamp = (template) =>
  template?.updated_at || template?.created_at || "1970-01-01T00:00:00.000Z";

export function sortBlockTemplates(templates = []) {
  return [...templates].sort((left, right) => {
    const leftTime = Date.parse(getTemplateTimestamp(left));
    const rightTime = Date.parse(getTemplateTimestamp(right));

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return String(left?.title || "").localeCompare(String(right?.title || ""));
  });
}

export function parseBlockTemplateBlocks(template) {
  try {
    const blocks = JSON.parse(template?.blocks_json || "[]");
    return Array.isArray(blocks) ? blocks : [];
  } catch {
    return [];
  }
}

export function materializeBlockTemplateBlocks(template) {
  return materializeTemplateBlocks(parseBlockTemplateBlocks(template));
}

export function getBlockTemplateStats(template) {
  const blocks = parseBlockTemplateBlocks(template);
  return {
    blockCount: blocks.length,
  };
}

export function buildBlockTemplateStructurePreview(template) {
  const blocks = parseBlockTemplateBlocks(template);

  if (blocks.length === 0) {
    return "Template is empty.";
  }

  return blocks
    .map((block) => {
      if (String(block.type || "").startsWith("h")) {
        const level = Number.parseInt(String(block.type).slice(1), 10);
        if (Number.isFinite(level) && level >= 1 && level <= 6) {
          return `${"#".repeat(level)} ${block.content || ""}`.trim();
        }
      }

      if (block.type === "paragraph") return block.content || "[paragraph]";
      if (block.type === "blockquote") return `> ${block.content || ""}`.trim();
      if (block.type === "separator") return "---";
      return `[${block.type || "block"}] ${block.content || ""}`.trim();
    })
    .join("\n\n");
}

export async function getUserBlockTemplates(userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("block_templates")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return sortBlockTemplates(data || []);
  } catch (error) {
    console.error("Error fetching block templates:", error);
    return [];
  }
}

export async function getBlockTemplateById(id) {
  const { data, error } = await supabase
    .from("block_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching block template:", error);
    throw new Error(formatBlockTemplateError(error));
  }

  return data;
}

export async function createBlockTemplate(template) {
  try {
    const { data, error } = await supabase
      .from("block_templates")
      .insert({
        title: template.title,
        description: template.description || "",
        category: template.category || "general",
        blocks_json: template.blocks_json || "[]",
        thumbnail: template.thumbnail || null,
        tags: template.tags || [],
        user_id: template.user_id,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error creating block template:", error);
    return { success: false, error: formatBlockTemplateError(error) };
  }
}

export async function updateBlockTemplate(id, updates) {
  try {
    const { data, error } = await supabase
      .from("block_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating block template:", error);
    return { success: false, error: formatBlockTemplateError(error) };
  }
}

export async function deleteBlockTemplate(id) {
  try {
    const { error } = await supabase.from("block_templates").delete().eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting block template:", error);
    return { success: false, error: formatBlockTemplateError(error) };
  }
}