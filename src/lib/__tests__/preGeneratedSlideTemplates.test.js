import { describe, expect, it } from "vitest";
import {
  materializeTemplateBlocks,
  PRE_GENERATED_SLIDE_TEMPLATES,
} from "../preGeneratedSlideTemplates";

describe("PRE_GENERATED_SLIDE_TEMPLATES", () => {
  it("defines a non-empty built-in template pack", () => {
    expect(PRE_GENERATED_SLIDE_TEMPLATES.length).toBeGreaterThanOrEqual(10);
  });

  it("materializes unique top-level ids for inserted blocks", () => {
    const firstTemplate = PRE_GENERATED_SLIDE_TEMPLATES[0];
    const blocks = materializeTemplateBlocks(firstTemplate.blocks);
    const ids = blocks.map((block) => block.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("assigns ids to nested grid blocks and hotspot markers", () => {
    const hotspotTemplate = PRE_GENERATED_SLIDE_TEMPLATES.find((template) => template.key === "hotspot-explorer");
    const narratedTemplate = PRE_GENERATED_SLIDE_TEMPLATES.find((template) => template.key === "narrated-explainer");

    const hotspotBlocks = materializeTemplateBlocks(hotspotTemplate.blocks);
    const hotspotBlock = hotspotBlocks.find((block) => block.type === "hotspot");
    expect(hotspotBlock.hotspots.every((hotspot) => hotspot.id)).toBe(true);

    const narratedBlocks = materializeTemplateBlocks(narratedTemplate.blocks);
    const gridBlock = narratedBlocks.find((block) => block.type === "grid");
    expect(gridBlock.columns.every((column) => column.id)).toBe(true);
    expect(gridBlock.columns.every((column) => column.blocks.every((block) => block.id))).toBe(true);
  });

  it("materializes narration templates with voiceover defaults", () => {
    const narratedTemplate = PRE_GENERATED_SLIDE_TEMPLATES.find((template) => template.key === "narrated-explainer");
    const narratedBlocks = materializeTemplateBlocks(narratedTemplate.blocks);
    const narrationBlock = narratedBlocks.find((block) => block.type === "marp-voiceover");

    expect(narrationBlock.language).toBe("en-US");
    expect(narrationBlock.targetLocales).toEqual(["de-DE", "fr-FR"]);
    expect(narrationBlock.ssml).toContain("<speak");
  });
});