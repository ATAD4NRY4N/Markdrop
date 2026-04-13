import { describe, expect, it } from "vitest";
import {
  buildCourseTemplateStructurePreview,
  filterBuiltInCourseTemplatesByCategory,
  getCourseTemplateStats,
  materializeCourseTemplateModules,
  materializeCourseTemplateSections,
  PRE_GENERATED_COURSE_TEMPLATES,
  searchBuiltInCourseTemplates,
} from "../preGeneratedCourseTemplates";

const getTemplate = (key) =>
  PRE_GENERATED_COURSE_TEMPLATES.find((template) => template.key === key);

describe("PRE_GENERATED_COURSE_TEMPLATES", () => {
  it("defines a non-empty built-in course template pack", () => {
    expect(PRE_GENERATED_COURSE_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    expect(PRE_GENERATED_COURSE_TEMPLATES.every((template) => template.modules.length >= 3)).toBe(true);
  });

  it("supports category filtering and search", () => {
    const narratedTemplates = filterBuiltInCourseTemplatesByCategory("narrated");
    const localizationMatches = searchBuiltInCourseTemplates("localization");

    expect(narratedTemplates.some((template) => template.key === "multilingual-launch-briefing")).toBe(true);
    expect(localizationMatches.some((template) => template.key === "multilingual-launch-briefing")).toBe(true);
  });

  it("materializes module blocks with narration defaults intact", () => {
    const narratedTemplate = getTemplate("multilingual-launch-briefing");
    const modules = materializeCourseTemplateModules(narratedTemplate);
    const topLevelIds = modules.flatMap((module) => module.blocks.map((block) => block.id));
    const narrationBlock = modules[0].blocks.find((block) => block.type === "marp-voiceover");

    expect(new Set(topLevelIds).size).toBe(topLevelIds.length);
    expect(narrationBlock.language).toBe("en-US");
    expect(narrationBlock.targetLocales).toEqual(["de-DE", "fr-FR", "es-ES"]);
    expect(narrationBlock.ssml).toContain("<speak");
  });

  it("maps section membership onto created module ids", () => {
    const template = getTemplate("product-onboarding-sprint");
    const createdModules = template.modules.map((module, index) => ({
      id: `module-${index + 1}`,
      key: module.key,
    }));
    const sections = materializeCourseTemplateSections(template, createdModules);

    expect(sections).toHaveLength(2);
    expect(sections[0].moduleIds).toEqual(["module-1", "module-2"]);
    expect(sections[1].moduleIds).toEqual(["module-3", "module-4"]);
  });

  it("builds course-aware preview text and stats", () => {
    const template = getTemplate("technical-skills-workshop");
    const stats = getCourseTemplateStats(template);
    const preview = buildCourseTemplateStructurePreview(template);

    expect(stats.moduleCount).toBe(4);
    expect(stats.blockCount).toBeGreaterThanOrEqual(8);
    expect(preview).toContain("Course: Technical Skills Workshop");
    expect(preview).toContain("Modules:");
    expect(preview).toContain("Decision Simulation");
  });
});