export const copyBlocksToClipboard = async (blocks) => {
  try {
    const data = JSON.stringify({ type: "markdrop-blocks", blocks });
    await navigator.clipboard.writeText(data);
    return true;
  } catch (err) {
    console.error("Failed to copy blocks:", err);
    return false;
  }
};

export const pasteBlocksFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    const data = JSON.parse(text);
    if (data.type === "markdrop-blocks" && Array.isArray(data.blocks)) {
      // Generate new IDs for pasted blocks to avoid conflicts
      return data.blocks.map(block => ({
        ...block,
        id: crypto.randomUUID()
      }));
    }
  } catch (err) {
    // Not valid JSON or not our format
    console.error("Failed to paste blocks:", err);
  }
  return null;
};