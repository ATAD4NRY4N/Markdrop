/**
 * Search & replace utilities for CourseForge.
 * Extracts all searchable text fields from every block type, provides
 * search-across-modules and targeted replace helpers.
 */

const HEADING_RE = /^h[1-6]$/;
const SIMPLE_CONTENT_TYPES = new Set([
  "paragraph","blockquote","alert","code","math","diagram","ul","ol","task-list","table",
]);

// ── Text segment extraction ──────────────────────────────────────────────────

/**
 * Returns [{path, text}] for every searchable text field in a block.
 * `path` uses dot-notation (e.g. "content", "pairs.0.term").
 */
export function getBlockTextSegments(block) {
  const segs = [];

  if (HEADING_RE.test(block.type) || SIMPLE_CONTENT_TYPES.has(block.type)) {
    if (typeof block.content === "string" && block.content)
      segs.push({ path: "content", text: block.content });
    return segs;
  }

  switch (block.type) {
    case "image":
      if (block.alt) segs.push({ path: "alt", text: block.alt });
      break;
    case "video":
      if (block.title) segs.push({ path: "title", text: block.title });
      break;
    case "pdf":
      if (block.title) segs.push({ path: "title", text: block.title });
      break;
    case "progress-marker":
      if (block.label) segs.push({ path: "label", text: block.label });
      break;
    case "course-nav":
      if (block.prevLabel) segs.push({ path: "prevLabel", text: block.prevLabel });
      if (block.nextLabel) segs.push({ path: "nextLabel", text: block.nextLabel });
      break;
    case "flashcard":
      if (block.front) segs.push({ path: "front", text: block.front });
      if (block.back) segs.push({ path: "back", text: block.back });
      break;
    case "fill-in-the-blank":
      if (block.sentence) segs.push({ path: "sentence", text: block.sentence });
      if (block.feedbackCorrect) segs.push({ path: "feedbackCorrect", text: block.feedbackCorrect });
      if (block.feedbackIncorrect) segs.push({ path: "feedbackIncorrect", text: block.feedbackIncorrect });
      (block.answers || []).forEach((a, i) => {
        if (a) segs.push({ path: `answers.${i}`, text: a });
      });
      break;
    case "matching":
      if (block.prompt) segs.push({ path: "prompt", text: block.prompt });
      (block.pairs || []).forEach((p, i) => {
        if (p.term) segs.push({ path: `pairs.${i}.term`, text: p.term });
        if (p.definition) segs.push({ path: `pairs.${i}.definition`, text: p.definition });
      });
      break;
    case "knowledge-check":
      if (block.prompt) segs.push({ path: "prompt", text: block.prompt });
      (block.options || []).forEach((o, i) => {
        if (o) segs.push({ path: `options.${i}`, text: o });
      });
      break;
    case "hotspot":
      if (block.alt) segs.push({ path: "alt", text: block.alt });
      (block.hotspots || []).forEach((h, i) => {
        if (h.label) segs.push({ path: `hotspots.${i}.label`, text: h.label });
        if (h.content) segs.push({ path: `hotspots.${i}.content`, text: h.content });
      });
      break;
    case "categorization":
      if (block.prompt) segs.push({ path: "prompt", text: block.prompt });
      (block.items || []).forEach((item, i) => {
        if (item.content) segs.push({ path: `items.${i}.content`, text: item.content });
      });
      break;
    case "learning-objective":
      (block.objectives || []).forEach((obj, i) => {
        if (obj) segs.push({ path: `objectives.${i}`, text: obj });
      });
      break;
    case "branching":
      if (block.prompt) segs.push({ path: "prompt", text: block.prompt });
      (block.choices || []).forEach((c, i) => {
        if (c.label) segs.push({ path: `choices.${i}.label`, text: c.label });
      });
      break;
    case "carousel":
      (block.images || []).forEach((img, i) => {
        if (img.alt) segs.push({ path: `images.${i}.alt`, text: img.alt });
        if (img.caption) segs.push({ path: `images.${i}.caption`, text: img.caption });
      });
      break;
    case "quiz":
      if (block.title) segs.push({ path: "title", text: block.title });
      (block.questions || []).forEach((q, qi) => {
        if (q.prompt) segs.push({ path: `questions.${qi}.prompt`, text: q.prompt });
        (q.options || []).forEach((o, oi) => {
          if (o) segs.push({ path: `questions.${qi}.options.${oi}`, text: o });
        });
        if (q.feedbackCorrect)
          segs.push({ path: `questions.${qi}.feedbackCorrect`, text: q.feedbackCorrect });
        if (q.feedbackIncorrect)
          segs.push({ path: `questions.${qi}.feedbackIncorrect`, text: q.feedbackIncorrect });
      });
      break;
    default:
      break;
  }

  return segs;
}

// ── Regex helper ─────────────────────────────────────────────────────────────

function escapeRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeRe(query, caseSensitive) {
  return new RegExp(escapeRe(query), caseSensitive ? "g" : "gi");
}

/** Replace every occurrence of `query` in `text`. */
export function replaceAllText(text, query, replacement, caseSensitive) {
  if (!query) return text;
  return text.replace(makeRe(query, caseSensitive), replacement);
}

// ── Deep-set helper ──────────────────────────────────────────────────────────

/** Immutably set a value at a dot-notation path inside an object/array tree. */
export function deepSet(root, pathStr, value) {
  return _set(root, pathStr.split("."), value);
}

function _set(target, parts, value) {
  if (parts.length === 0) return value;
  const key = parts[0];
  const rest = parts.slice(1);
  if (Array.isArray(target)) {
    const idx = Number(key);
    const copy = [...target];
    copy[idx] = _set(copy[idx], rest, value);
    return copy;
  }
  return { ...(target || {}), [key]: _set((target || {})[key], rest, value) };
}

// ── Snippet builder ──────────────────────────────────────────────────────────

function makeSnippet(text, matchStart, matchLen, ctx = 45) {
  const start = Math.max(0, matchStart - ctx);
  const end = Math.min(text.length, matchStart + matchLen + ctx);
  return {
    before: (start > 0 ? "…" : "") + text.slice(start, matchStart),
    match: text.slice(matchStart, matchStart + matchLen),
    after: text.slice(matchStart + matchLen, end) + (end < text.length ? "…" : ""),
  };
}

// ── Core search ──────────────────────────────────────────────────────────────

/**
 * Search every module's blocks for `query`.
 * Returns a flat array of match objects (in module/block order):
 * { moduleId, moduleName, blockId, blockType, fieldPath, matchStart, matchLength, snippet }
 */
export function searchModules(modules, query, caseSensitive = false) {
  if (!query || !query.trim()) return [];
  const results = [];
  for (const mod of modules) {
    let blocks;
    try { blocks = JSON.parse(mod.blocks_json || "[]"); } catch { blocks = []; }
    for (const block of blocks) {
      _searchBlockDeep(block, mod.id, mod.title, query, caseSensitive, results);
    }
  }
  return results;
}

function _searchBlockDeep(block, moduleId, moduleName, query, caseSensitive, results) {
  const segs = getBlockTextSegments(block);
  const q = caseSensitive ? query : query.toLowerCase();
  for (const seg of segs) {
    const hay = caseSensitive ? seg.text : seg.text.toLowerCase();
    let off = 0;
    let idx;
    while ((idx = hay.indexOf(q, off)) !== -1) {
      results.push({
        moduleId,
        moduleName,
        blockId: block.id,
        blockType: block.type,
        fieldPath: seg.path,
        matchStart: idx,
        matchLength: query.length,
        snippet: makeSnippet(seg.text, idx, query.length),
      });
      off = idx + q.length;
    }
  }
  // Recurse into grid columns
  if (block.type === "grid") {
    for (const col of block.columns || []) {
      for (const child of col.blocks || []) {
        _searchBlockDeep(child, moduleId, moduleName, query, caseSensitive, results);
      }
    }
  }
}

// ── Replace helpers ──────────────────────────────────────────────────────────

/**
 * Replace ALL occurrences of `query` across all modules.
 * Returns { updatedModules: [{moduleId, blocks}], count }.
 */
export function replaceAllInModules(modules, query, replacement, caseSensitive) {
  if (!query) return { updatedModules: [], count: 0 };
  let totalCount = 0;
  const updatedModules = [];
  for (const mod of modules) {
    let blocks;
    try { blocks = JSON.parse(mod.blocks_json || "[]"); } catch { blocks = []; }
    const { blocks: newBlocks, count } = _replaceInBlockList(blocks, query, replacement, caseSensitive);
    if (count > 0) {
      updatedModules.push({ moduleId: mod.id, blocks: newBlocks });
      totalCount += count;
    }
  }
  return { updatedModules, count: totalCount };
}

/**
 * Replace all occurrences in a flat blocks array.
 * Returns { blocks: newBlocks, count }.
 */
export function replaceInBlocks(blocks, query, replacement, caseSensitive) {
  return _replaceInBlockList(blocks, query, replacement, caseSensitive);
}

function _replaceInBlockList(blocks, query, replacement, caseSensitive) {
  let count = 0;
  const newBlocks = blocks.map((block) => {
    const { block: newBlock, count: c } = _replaceInBlock(block, query, replacement, caseSensitive);
    count += c;
    return newBlock;
  });
  return { blocks: newBlocks, count };
}

function _replaceInBlock(block, query, replacement, caseSensitive) {
  const segs = getBlockTextSegments(block);
  let updated = block;
  let count = 0;
  const re = makeRe(query, caseSensitive);
  for (const seg of segs) {
    const matches = seg.text.match(re);
    if (matches) {
      count += matches.length;
      updated = deepSet(updated, seg.path, replaceAllText(seg.text, query, replacement, caseSensitive));
    }
  }
  // Recurse into grid columns
  if (block.type === "grid") {
    const newColumns = (block.columns || []).map((col) => ({
      ...col,
      blocks: (col.blocks || []).map((child) => {
        const { block: r, count: c } = _replaceInBlock(child, query, replacement, caseSensitive);
        count += c;
        return r;
      }),
    }));
    updated = { ...updated, columns: newColumns };
  }
  return { block: updated, count };
}

/**
 * Replace a single match (identified by blockId + fieldPath + matchStart).
 * Returns updated blocks array.
 */
export function replaceSingleMatch(blocks, match, replacement) {
  return blocks.map((block) => {
    if (block.id !== match.blockId) return block;
    return _replaceSingleInBlock(block, match, replacement);
  });
}

function _replaceSingleInBlock(block, match, replacement) {
  // Handle grid children
  if (block.type === "grid") {
    const newColumns = (block.columns || []).map((col) => ({
      ...col,
      blocks: (col.blocks || []).map((child) =>
        child.id === match.blockId ? _replaceSingleInBlock(child, match, replacement) : child
      ),
    }));
    return { ...block, columns: newColumns };
  }
  const segs = getBlockTextSegments(block);
  const seg = segs.find((s) => s.path === match.fieldPath);
  if (!seg) return block;
  const { text, path } = seg;
  const newText =
    text.slice(0, match.matchStart) + replacement + text.slice(match.matchStart + match.matchLength);
  return deepSet(block, path, newText);
}

// ── Block type label map ─────────────────────────────────────────────────────

const BLOCK_LABELS = {
  h1: "Heading 1", h2: "Heading 2", h3: "Heading 3",
  h4: "Heading 4", h5: "Heading 5", h6: "Heading 6",
  paragraph: "Paragraph", blockquote: "Quote", alert: "Alert",
  code: "Code", math: "Math", diagram: "Diagram",
  ul: "List", ol: "Numbered List", "task-list": "Task List",
  table: "Table", image: "Image", video: "Video",
  carousel: "Carousel", pdf: "PDF", grid: "Grid",
  "learning-objective": "Learning Objectives",
  quiz: "Quiz", "knowledge-check": "Knowledge Check",
  flashcard: "Flashcard", "fill-in-the-blank": "Fill in the Blank",
  matching: "Matching", hotspot: "Hotspot", categorization: "Categorization",
  branching: "Branching", "progress-marker": "Progress Marker",
  "course-nav": "Course Nav", "time-requirements": "Time Requirements",
};

export function getBlockLabel(type) {
  return BLOCK_LABELS[type] || type;
}
