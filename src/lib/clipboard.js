// ── In-app clipboard (module-level singleton) ─────────────────────────────
// Provides a same-session fallback when the browser Clipboard API is
// unavailable (e.g. non-secure context, denied permissions) and enables
// synchronous clipboard checks for reactive UI.
let _inAppClipboard = null;

export const setInAppClipboard = (blocks) => {
  _inAppClipboard = blocks?.length ? blocks.map((b) => ({ ...b })) : null;
};

export const getInAppClipboard = () => _inAppClipboard;

/** Synchronous — safe to call inside render to conditionally show paste UI */
export const clipboardHasContent = () =>
  _inAppClipboard !== null && _inAppClipboard.length > 0;

export const getClipboardCount = () => (_inAppClipboard ? _inAppClipboard.length : 0);

// ── Helpers ────────────────────────────────────────────────────────────────
const freshIds = (blocks) =>
  blocks.map((block) => ({ ...block, id: crypto.randomUUID() }));

// ── Copy ───────────────────────────────────────────────────────────────────
/**
 * Copy blocks to both the system clipboard and the in-app store.
 * Always returns true (in-app copy always succeeds).
 */
export const copyBlocksToClipboard = async (blocks) => {
  setInAppClipboard(blocks);
  try {
    const data = JSON.stringify({ type: "markdrop-blocks", blocks });
    await navigator.clipboard.writeText(data);
  } catch {
    // System clipboard unavailable — in-app clipboard still works for same session
  }
  return true;
};

// ── Paste ──────────────────────────────────────────────────────────────────
/**
 * Returns fresh copies of clipboard blocks (new IDs) or null.
 * Tries the system clipboard first (supports cross-tab / cross-course paste),
 * then falls back to the in-app store.
 */
export const pasteBlocksFromClipboard = async () => {
  // 1. System clipboard — works cross-session and cross-course in separate tabs
  try {
    const text = await navigator.clipboard.readText();
    const data = JSON.parse(text);
    if (data.type === "markdrop-blocks" && Array.isArray(data.blocks) && data.blocks.length > 0) {
      return freshIds(data.blocks);
    }
  } catch {
    // Clipboard API denied, not our format, or not valid JSON — fall through
  }

  // 2. In-app store — same browser session fallback
  if (_inAppClipboard?.length) {
    return freshIds(_inAppClipboard);
  }

  return null;
};