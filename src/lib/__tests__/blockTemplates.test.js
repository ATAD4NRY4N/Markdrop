import { describe, expect, it } from "vitest";
import {
  getBlockTemplateBaseType,
  getBlockTemplateBaseTypeLabel,
  parseBlockTemplateBlocks,
} from "../blockTemplates";

describe("blockTemplates", () => {
  it("normalizes a template to the block matching its base block type", () => {
    const blocks = parseBlockTemplateBlocks({
      base_block_type: "alert",
      blocks_json: JSON.stringify([
        { id: "p1", type: "paragraph", content: "Ignore me" },
        { id: "a1", type: "alert", content: "Use me", alertType: "note" },
      ]),
    });

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("alert");
    expect(blocks[0].content).toBe("Use me");
  });

  it("seeds a default block when a template has a base block type but no saved block yet", () => {
    const blocks = parseBlockTemplateBlocks({
      base_block_type: "quiz",
      blocks_json: "[]",
    });

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("quiz");
    expect(Array.isArray(blocks[0].questions)).toBe(true);
  });

  it("derives the base block type and label from existing saved content when needed", () => {
    const template = {
      blocks_json: JSON.stringify([{ id: "i1", type: "image", content: "" }]),
    };

    expect(getBlockTemplateBaseType(template)).toBe("image");
    expect(getBlockTemplateBaseTypeLabel(template)).toBe("Image");
  });
});