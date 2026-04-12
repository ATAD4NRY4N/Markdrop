/**
 * tagUtils.js
 * Utilities for deriving course content tags from module block data.
 *
 * Block schema (relevant fields):
 *   { id: string, type: "h1" | "h2" | ... | "paragraph" | ..., content: string }
 *
 * Auto-tags are extracted from H1 blocks (type === "h1") across all modules of a course.
 * They represent the major topics covered, one tag per distinct H1 heading.
 */

/**
 * Strip common markdown formatting from a string so tag labels are plain text.
 * e.g. "**Bold Title**" → "Bold Title", "[link](url)" → "link"
 */
export function plainText(str = "") {
  return str
    .replace(/\*\*(.+?)\*\*/g, "$1")    // bold
    .replace(/\*(.+?)\*/g, "$1")         // italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // markdown links
    .replace(/`(.+?)`/g, "$1")           // inline code
    .replace(/#+\s*/g, "")               // leading hashes (in case type is "text" with # prefix)
    .trim();
}

/**
 * Derive an array of tag strings from a course's module array.
 * Each module should have a `blocks_json` string (array of block objects).
 * Returns a deduplicated, alphabetically sorted array of tags from H1 blocks.
 *
 * @param {Array<{blocks_json: string}>} modules
 * @returns {string[]}
 */
export function extractTagsFromModules(modules = []) {
  const tags = new Set();

  for (const mod of modules) {
    let blocks;
    try {
      blocks = JSON.parse(mod.blocks_json || "[]");
    } catch {
      continue;
    }

    for (const block of blocks) {
      if (block.type === "h1" && block.content) {
        const tag = plainText(block.content);
        if (tag) tags.add(tag);
      }
    }
  }

  return [...tags].sort();
}
