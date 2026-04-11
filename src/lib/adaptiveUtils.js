/**
 * adaptiveUtils.js
 *
 * Pure utility functions for Adaptive Learning — no React, safe for any JS context
 * including SCORM SCO HTML pages (the functions are re-implemented inline in those).
 *
 * Adaptive config shape stored in courses.adaptive_config (JSON string):
 * {
 *   variants: [
 *     { id, name, description, required: boolean, moduleIds: string[] }
 *   ],
 *   checkpoints: [
 *     {
 *       id, blockId, moduleId,
 *       rules: [{ id, type: "score", operator: "gte"|"lt", threshold: 0-100, variantIds: [] }],
 *       fallbackVariantIds: []
 *     }
 *   ]
 * }
 */

// ── Parsing ────────────────────────────────────────────────────────────────

export function parseAdaptiveConfig(course) {
  try {
    const raw = course?.adaptive_config ?? '{"variants":[],"checkpoints":[]}';
    const parsed = typeof raw === "object" ? raw : JSON.parse(raw);
    return {
      variants: Array.isArray(parsed.variants) ? parsed.variants : [],
      checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints : [],
    };
  } catch {
    return { variants: [], checkpoints: [] };
  }
}

// ── Module classification ──────────────────────────────────────────────────

/** Set of all module IDs that belong to any variant (not core). */
export function getVariantModuleIdSet(variants) {
  const ids = new Set();
  for (const v of variants) {
    for (const id of v.moduleIds ?? []) ids.add(id);
  }
  return ids;
}

/** Returns the variant ID that owns a module, or null if it is a Core module. */
export function getModuleVariantId(moduleId, variants) {
  for (const v of variants) {
    if ((v.moduleIds ?? []).includes(moduleId)) return v.id;
  }
  return null;
}

/** Returns modules that are NOT assigned to any variant. */
export function getCoreModules(modules, variants) {
  const variantIds = getVariantModuleIdSet(variants);
  return modules.filter((m) => !variantIds.has(m.id));
}

/**
 * Returns modules that should be visible to a learner:
 *   Core  +  modules belonging to variants in unlockedVariantIds.
 */
export function getVisibleModules(modules, variants, unlockedVariantIds = []) {
  const variantIds = getVariantModuleIdSet(variants);
  const unlockedSet = new Set(unlockedVariantIds);

  const unlockedModuleIds = new Set();
  for (const v of variants) {
    if (unlockedSet.has(v.id)) {
      for (const id of v.moduleIds ?? []) unlockedModuleIds.add(id);
    }
  }

  return modules.filter((m) => !variantIds.has(m.id) || unlockedModuleIds.has(m.id));
}

// ── SCORM module metadata ──────────────────────────────────────────────────

/**
 * Build the flat module-metadata array embedded in every SCO page.
 * Each entry: { id, title, variantId: string|null, fileIndex: number (1-based) }
 */
export function buildModulesMeta(modules, variants) {
  return modules.map((m, i) => ({
    id: m.id,
    title: m.title ?? `Module ${i + 1}`,
    variantId: getModuleVariantId(m.id, variants),
    fileIndex: i + 1,
  }));
}

// ── Rule evaluation ────────────────────────────────────────────────────────

/**
 * Evaluate a checkpoint's rules against a score (0-100).
 * Returns the array of variant IDs to unlock.
 * First matching rule wins; fallback applies only when no rule matches.
 */
export function evaluateCheckpointRules(checkpoint, scorePercent) {
  const toUnlock = [];
  let anyMatched = false;

  for (const rule of checkpoint.rules ?? []) {
    let matches = false;
    if (rule.type === "score") {
      if (rule.operator === "gte" && scorePercent >= rule.threshold) matches = true;
      else if (rule.operator === "lt" && scorePercent < rule.threshold) matches = true;
    }
    if (matches) {
      anyMatched = true;
      for (const vid of rule.variantIds ?? []) {
        if (!toUnlock.includes(vid)) toUnlock.push(vid);
      }
      break; // first matching rule wins
    }
  }

  if (!anyMatched) {
    for (const vid of checkpoint.fallbackVariantIds ?? []) {
      if (!toUnlock.includes(vid)) toUnlock.push(vid);
    }
  }

  return toUnlock;
}

// ── Completion helpers ─────────────────────────────────────────────────────

export function getRequiredVariantIds(variants) {
  return variants.filter((v) => v.required).map((v) => v.id);
}

export function computeCompletionInfo(modules, variants, unlockedVariantIds = []) {
  const coreModules = getCoreModules(modules, variants);
  const unlockedSet = new Set(unlockedVariantIds);
  const unlockedRequired = variants.filter((v) => v.required && unlockedSet.has(v.id));
  const reqVariantModuleIds = new Set(unlockedRequired.flatMap((v) => v.moduleIds ?? []));
  const requiredModuleCount =
    coreModules.length + modules.filter((m) => reqVariantModuleIds.has(m.id)).length;

  return {
    coreCount: coreModules.length,
    variantCount: variants.length,
    unlockedCount: unlockedVariantIds.length,
    requiredModuleCount,
  };
}

// ── Block scanning ─────────────────────────────────────────────────────────

/**
 * Scan all modules for quiz/knowledge-check blocks — candidates for checkpoints.
 * Returns: [{ blockId, blockType, blockLabel, moduleId, moduleTitle }]
 */
export function getCheckpointableBlocks(modules) {
  const results = [];
  for (const mod of modules) {
    let blocks = [];
    try {
      blocks = JSON.parse(mod.blocks_json || "[]");
    } catch {
      continue;
    }
    for (const block of blocks) {
      if (block.type === "quiz" || block.type === "knowledge-check") {
        results.push({
          blockId: block.id,
          blockType: block.type,
          blockLabel:
            block.title ||
            block.prompt ||
            `(${block.type === "quiz" ? "Quiz" : "Knowledge Check"})`,
          moduleId: mod.id,
          moduleTitle: mod.title || `Module`,
        });
      }
    }
  }
  return results;
}
