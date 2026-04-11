// ─── XML helpers ──────────────────────────────────────────────────────────────

function escXml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseBlocksJson(json) {
  try {
    return JSON.parse(json || "[]");
  } catch {
    return [];
  }
}

// ─── Segment extraction ───────────────────────────────────────────────────────

/**
 * Recursively extract translatable text segments from a block.
 *
 * @param {object} block      The block object (must have a `.type` and `.id`).
 * @param {string} outerBlockId  The block ID to use as the segment ID prefix (the
 *                               top-level block's ID, even when recursing into grids).
 * @param {string} pathPrefix    Dot-path prefix within the block (empty for root fields).
 * @param {Array}  [segs]        Accumulator – omit when calling from outside.
 * @returns {{ id: string, value: string, note: string }[]}
 */
function extractFieldsByType(block, outerBlockId, pathPrefix, segs = []) {
  // Helper: push a segment for one field
  const add = (subPath, value, note) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) return;
    const fullPath = pathPrefix ? `${pathPrefix}.${subPath}` : subPath;
    segs.push({ id: `${outerBlockId}__${fullPath}`, value: trimmed, note: note || subPath });
  };

  switch (block.type) {
    // ── Heading / text ──────────────────────────────────────────────────────
    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
      add("content", block.content, `Heading ${block.type.slice(1)}`);
      break;
    case "paragraph":
      add("content", block.content, "Paragraph text");
      break;
    case "blockquote":
      add("content", block.content, "Blockquote");
      break;
    case "alert":
      add("content", block.content, `Alert (${block.alertType || "note"})`);
      break;
    case "ul":
      add("content", block.content, "Bullet list — keep '- ' prefix per line");
      break;
    case "ol":
      add("content", block.content, "Ordered list — keep '1. ' prefix per line");
      break;
    case "task-list":
      add("content", block.content, "Task list — keep '- [ ] ' prefix per line");
      break;
    case "table":
      add("content", block.content, "Table (GFM markdown)");
      break;
    case "link":
      add("content", block.content, "Link display text");
      break;

    // ── Media ────────────────────────────────────────────────────────────────
    case "image":
      add("alt", block.alt, "Image alt text");
      break;
    case "video":
      add("title", block.title, "Video title");
      break;

    // ── Course navigation ─────────────────────────────────────────────────
    case "progress-marker":
      add("label", block.label, "Progress marker label");
      break;
    case "course-nav":
      add("prevLabel", block.prevLabel, "Previous button label");
      add("nextLabel", block.nextLabel, "Next button label");
      break;

    // ── Interactive eLearning ─────────────────────────────────────────────
    case "flashcard":
      add("front", block.front, "Flashcard front face");
      add("back", block.back, "Flashcard back face");
      break;

    case "learning-objective":
      (block.objectives || []).forEach((obj, i) =>
        add(`objectives.${i}`, obj, `Learning objective ${i + 1}`)
      );
      break;

    case "knowledge-check":
      add("prompt", block.prompt, "Question prompt");
      (block.options || []).forEach((opt, i) =>
        add(`options.${i}`, opt, `Answer option ${i + 1}`)
      );
      add("feedbackCorrect", block.feedbackCorrect, "Correct-answer feedback");
      add("feedbackIncorrect", block.feedbackIncorrect, "Incorrect-answer feedback");
      break;

    case "quiz":
      add("title", block.title, "Quiz title");
      (block.questions || []).forEach((q, qi) => {
        add(`questions.${qi}.prompt`, q.prompt, `Q${qi + 1} prompt`);
        if (!q.type || q.type === "mcq") {
          (q.options || []).forEach((opt, oi) =>
            add(`questions.${qi}.options.${oi}`, opt, `Q${qi + 1} option ${oi + 1}`)
          );
        } else if (q.type === "fitb") {
          (q.acceptedAnswers || []).forEach((ans, ai) =>
            add(`questions.${qi}.acceptedAnswers.${ai}`, ans, `Q${qi + 1} accepted answer ${ai + 1}`)
          );
        }
        add(`questions.${qi}.feedbackCorrect`, q.feedbackCorrect, `Q${qi + 1} correct feedback`);
        add(`questions.${qi}.feedbackIncorrect`, q.feedbackIncorrect, `Q${qi + 1} incorrect feedback`);
      });
      break;

    case "fill-in-the-blank":
      add("sentence", block.sentence, "Sentence — keep ___ per blank");
      (block.answers || []).forEach((ans, i) =>
        add(`answers.${i}`, ans, `Blank ${i + 1} correct answer`)
      );
      add("feedbackCorrect", block.feedbackCorrect, "Correct feedback");
      add("feedbackIncorrect", block.feedbackIncorrect, "Incorrect feedback");
      break;

    case "matching":
      add("prompt", block.prompt, "Activity prompt");
      (block.pairs || []).forEach((p, pi) => {
        add(`pairs.${pi}.term`, p.term, `Pair ${pi + 1} term`);
        add(`pairs.${pi}.definition`, p.definition, `Pair ${pi + 1} definition`);
      });
      break;

    case "hotspot":
      add("alt", block.alt, "Image alt text");
      (block.hotspots || []).forEach((hs, hi) => {
        add(`hotspots.${hi}.label`, hs.label, `Hotspot ${hi + 1} label`);
        add(`hotspots.${hi}.content`, hs.content, `Hotspot ${hi + 1} description`);
      });
      break;

    case "branching":
      add("prompt", block.prompt, "Scenario prompt");
      (block.choices || []).forEach((c, ci) =>
        add(`choices.${ci}.label`, c.label, `Choice ${ci + 1} label`)
      );
      break;

    case "categorization":
      add("prompt", block.prompt, "Categorization prompt");
      (block.categories || []).forEach((cat, ci) =>
        add(`categories.${ci}.label`, cat.label, `Category ${ci + 1} label`)
      );
      (block.items || []).forEach((item, ii) =>
        add(`items.${ii}.content`, item.content, `Item ${ii + 1} content`)
      );
      break;

    // ── Grid — recurse into nested blocks ────────────────────────────────
    case "grid":
      (block.columns || []).forEach((col, ci) => {
        if (!Array.isArray(col.blocks)) return;
        col.blocks.forEach((nb, bi) => {
          const nestedPrefix = pathPrefix
            ? `${pathPrefix}.columns.${ci}.blocks.${bi}`
            : `columns.${ci}.blocks.${bi}`;
          extractFieldsByType(nb, outerBlockId, nestedPrefix, segs);
        });
      });
      break;

    // Skip: code, math, diagram, separator, shield-badge, skill-icons,
    //        typing-svg, github-profile-cards, marp-*, time-requirements
    default:
      break;
  }

  return segs;
}

/**
 * Extract all translatable segments from a single block.
 * Exported for unit-testing.
 */
export function extractBlockSegments(block) {
  return extractFieldsByType(block, block.id, "", []);
}

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Build a XLIFF 1.2 XML string from a course and its modules.
 *
 * @param {object}   course      Course object with `.title`
 * @param {object[]} modules     Array of module objects with `.id`, `.title`, `.blocks_json`
 * @param {string}   sourceLang  BCP-47 source language tag (default "en")
 * @param {string}   targetLang  BCP-47 target language tag (default "xx" as placeholder)
 * @returns {string}  XLIFF XML
 */
export function exportToXliff(course, modules, sourceLang = "en", targetLang = "xx") {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
  ];

  for (const mod of modules) {
    const blocks = parseBlocksJson(mod.blocks_json);
    const segments = blocks.flatMap((b) => extractBlockSegments(b));
    if (segments.length === 0) continue;

    lines.push(
      `  <file original="${escXml(mod.id)}"`,
      `        source-language="${escXml(sourceLang)}"`,
      `        target-language="${escXml(targetLang)}"`,
      `        datatype="plaintext">`,
      `    <header>`,
      `      <note>Module: ${escXml(mod.title)} | Course: ${escXml(course.title)}</note>`,
      `    </header>`,
      `    <body>`,
    );

    for (const seg of segments) {
      lines.push(
        `      <trans-unit id="${escXml(seg.id)}">`,
        `        <source>${escXml(seg.value)}</source>`,
        `        <target/>`,
        `        <note>${escXml(seg.note)}</note>`,
        `      </trans-unit>`,
      );
    }

    lines.push(`    </body>`, `  </file>`);
  }

  lines.push(`</xliff>`);
  return lines.join("\n");
}

// ─── Import / parse ───────────────────────────────────────────────────────────

/**
 * Parse a XLIFF XML string and extract all translated segments.
 *
 * @param {string} xmlString
 * @returns {{
 *   targetLang: string,
 *   moduleTranslations: Map<string, Map<string, string>>,
 *   segmentCounts: { moduleId: string, moduleLabel: string, total: number, translated: number }[]
 * }}
 */
export function parseXliff(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Invalid XLIFF XML: " + (parseError.textContent || "parse failed"));
  }

  /** @type {Map<string, Map<string, string>>} */
  const moduleTranslations = new Map();
  const segmentCounts = [];
  let targetLang = "";

  doc.querySelectorAll("file").forEach((fileEl) => {
    const moduleId = fileEl.getAttribute("original");
    if (!moduleId) return;

    if (!targetLang) {
      targetLang = fileEl.getAttribute("target-language") || "";
    }

    const noteEl = fileEl.querySelector("header note");
    const moduleLabel = noteEl?.textContent || moduleId;

    const unitMap = new Map();
    let total = 0;
    let translated = 0;

    fileEl.querySelectorAll("trans-unit").forEach((unit) => {
      const unitId = unit.getAttribute("id");
      // Prefer <target> element, fall back to empty
      const targetText = unit.querySelector("target")?.textContent?.trim() || "";
      total++;
      if (targetText) {
        translated++;
        unitMap.set(unitId, targetText);
      }
    });

    moduleTranslations.set(moduleId, unitMap);
    segmentCounts.push({ moduleId, moduleLabel, total, translated });
  });

  return { targetLang, moduleTranslations, segmentCounts };
}

// ─── Apply translations ───────────────────────────────────────────────────────

/**
 * Deep-set a value at a dot-separated path within an object.
 * Numeric path segments (e.g. "options.0") are treated as array indices.
 * Silently skips if the path does not exist.
 */
function applyDotPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = /^\d+$/.test(parts[i]) ? parseInt(parts[i], 10) : parts[i];
    if (cur == null || typeof cur !== "object") return;
    cur = cur[key];
  }
  const lastPart = parts[parts.length - 1];
  const lastKey = /^\d+$/.test(lastPart) ? parseInt(lastPart, 10) : lastPart;
  if (cur != null && typeof cur === "object") {
    cur[lastKey] = value;
  }
}

/**
 * Apply parsed XLIFF translations onto a copy of the modules array.
 * Returns a new array of module objects with updated `blocks_json`.
 * Modules not mentioned in the XLIFF are returned unchanged.
 *
 * @param {object[]} modules       Original module objects
 * @param {ReturnType<parseXliff>} parsedXliff  Result of parseXliff()
 * @returns {object[]}
 */
export function applyTranslationsToModules(modules, parsedXliff) {
  const { moduleTranslations } = parsedXliff;

  return modules.map((mod) => {
    const unitMap = moduleTranslations.get(mod.id);
    if (!unitMap || unitMap.size === 0) return mod;

    const blocks = parseBlocksJson(mod.blocks_json);
    // Deep-clone so we don't mutate the original
    const updated = JSON.parse(JSON.stringify(blocks));

    for (const [unitId, translatedText] of unitMap) {
      // trans-unit id format: {blockId}__{dotPath}
      const sepIdx = unitId.indexOf("__");
      if (sepIdx === -1) continue;
      const blockId = unitId.slice(0, sepIdx);
      const fieldPath = unitId.slice(sepIdx + 2);

      const block = updated.find((b) => b.id === blockId);
      if (!block) continue;

      applyDotPath(block, fieldPath, translatedText);
    }

    return { ...mod, blocks_json: JSON.stringify(updated) };
  });
}
