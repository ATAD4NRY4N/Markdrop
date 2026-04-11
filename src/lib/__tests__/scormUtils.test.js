/**
 * scormUtils.test.js
 *
 * Tests for the client-side SCORM package generation utility.
 * Covers: HTML escaping, block→HTML conversion (all eLearning types),
 * SCORM 1.2 / 2004 manifest generation, preview HTML, ZIP export API.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import JSZip from "jszip";
import {
  _escHtml,
  _blockToHtml,
  _generateManifest12,
  _generateManifest2004,
  buildPreviewHtml,
  exportToScorm12,
  exportToScorm2004,
} from "../scormUtils";

// ── helpers ──────────────────────────────────────────────────────────────────

const makeCourse = (overrides = {}) => ({
  id: "abc12345-0000-0000-0000-000000000001",
  title: "Test Course",
  description: "",
  scorm_version: "1.2",
  pass_threshold: 80,
  max_attempts: 0,
  ...overrides,
});

const makeModule = (overrides = {}) => ({
  id: "mod-001",
  course_id: "abc12345-0000-0000-0000-000000000001",
  title: "Module 1",
  order: 0,
  blocks_json: "[]",
  ...overrides,
});

// ── escHtml ───────────────────────────────────────────────────────────────────

describe("_escHtml", () => {
  it("escapes & < > \" '", () => {
    expect(_escHtml('a & b < c > d " e \' f')).toBe(
      "a &amp; b &lt; c &gt; d &quot; e &#039; f"
    );
  });

  it("handles non-string input by converting to string first", () => {
    expect(_escHtml(42)).toBe("42");
    expect(_escHtml(null)).toBe("null");
  });

  it("returns an empty string unchanged", () => {
    expect(_escHtml("")).toBe("");
  });
});

// ── blockToHtml ───────────────────────────────────────────────────────────────

describe("_blockToHtml — heading blocks", () => {
  it.each(["h1", "h2", "h3", "h4", "h5", "h6"])("renders %s tag", (type) => {
    const n = type[1];
    const html = _blockToHtml({ type, content: "Title" });
    expect(html).toBe(`<h${n}>Title</h${n}>`);
  });

  it("escapes heading content", () => {
    const html = _blockToHtml({ type: "h1", content: "<b>Bold</b>" });
    expect(html).toBe("<h1>&lt;b&gt;Bold&lt;/b&gt;</h1>");
  });
});

describe("_blockToHtml — basic block types", () => {
  it("paragraph renders <p>", () => {
    const html = _blockToHtml({ type: "paragraph", content: "Hello world" });
    expect(html).toContain("<p>");
    expect(html).toContain("Hello world");
  });

  it("separator renders <hr/>", () => {
    expect(_blockToHtml({ type: "separator" })).toBe("<hr/>");
  });

  it("link renders <a>", () => {
    const html = _blockToHtml({ type: "link", content: "Click me", url: "https://example.com" });
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("Click me");
  });

  it("blockquote renders <blockquote>", () => {
    const html = _blockToHtml({ type: "blockquote", content: "Quote text" });
    expect(html).toContain("<blockquote>");
    expect(html).toContain("Quote text");
  });

  it("image renders <img> with src and alt", () => {
    const html = _blockToHtml({
      type: "image",
      content: "https://example.com/img.png",
      alt: "An image",
    });
    expect(html).toContain('src="https://example.com/img.png"');
    expect(html).toContain('alt="An image"');
  });

  it("image escapes src and alt", () => {
    const html = _blockToHtml({
      type: "image",
      content: 'path?a=1&b=<2>',
      alt: '"quoted"',
    });
    expect(html).toContain("&amp;");
    expect(html).toContain("&lt;");
    expect(html).toContain("&quot;");
  });

  it("unknown block falls back to paragraph", () => {
    const html = _blockToHtml({ type: "unknown-xyz", content: "Fallback" });
    expect(html).toContain("Fallback");
  });
});

describe("_blockToHtml — eLearning blocks", () => {
  it("learning-objective renders objectives list", () => {
    const html = _blockToHtml({
      type: "learning-objective",
      objectives: ["Understand X", "Apply Y"],
    });
    expect(html).toContain("🎯 Learning Objectives");
    expect(html).toContain("<li>Understand X</li>");
    expect(html).toContain("<li>Apply Y</li>");
  });

  it("learning-objective with empty objectives returns empty string", () => {
    const html = _blockToHtml({ type: "learning-objective", objectives: [] });
    expect(html).toBe("");
  });

  it("learning-objective escapes objectives content", () => {
    const html = _blockToHtml({
      type: "learning-objective",
      objectives: ["<script>alert(1)</script>"],
    });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("progress-marker renders label", () => {
    const html = _blockToHtml({ type: "progress-marker", label: "Section Complete" });
    expect(html).toContain("🚩");
    expect(html).toContain("Section Complete");
  });

  it("progress-marker defaults to 'Checkpoint'", () => {
    const html = _blockToHtml({ type: "progress-marker" });
    expect(html).toContain("Checkpoint");
  });

  it("course-nav renders prev/next buttons", () => {
    const html = _blockToHtml({
      type: "course-nav",
      prevLabel: "← Back",
      nextLabel: "Forward →",
    });
    expect(html).toContain("← Back");
    expect(html).toContain("Forward →");
    expect(html).toContain("prevModule()");
    expect(html).toContain("nextModule()");
  });

  it("course-nav locked adds data-locked attribute", () => {
    const html = _blockToHtml({ type: "course-nav", locked: true });
    expect(html).toContain('data-locked="true"');
  });

  it("flashcard renders front and back", () => {
    const html = _blockToHtml({ type: "flashcard", front: "Q: What is 2+2?", back: "A: 4" });
    expect(html).toContain("Q: What is 2+2?");
    expect(html).toContain("A: 4");
    expect(html).toContain("flipCard(");
  });

  it("branching renders prompt and choice buttons", () => {
    const html = _blockToHtml({
      type: "branching",
      prompt: "Which path?",
      choices: [
        { label: "Path A", targetLabel: "module-a" },
        { label: "Path B", targetLabel: "module-b" },
      ],
    });
    expect(html).toContain("Which path?");
    expect(html).toContain("Path A");
    expect(html).toContain("Path B");
    expect(html).toContain("branchChoice(");
  });

  it("knowledge-check renders prompt and options", () => {
    const html = _blockToHtml({
      type: "knowledge-check",
      prompt: "What is React?",
      options: ["A library", "A framework", "A language"],
      correctIndex: 0,
    });
    expect(html).toContain("What is React?");
    expect(html).toContain("A library");
    expect(html).toContain("A framework");
    expect(html).toContain("kcAnswer(");
  });

  it("quiz block renders MCQ questions", () => {
    const html = _blockToHtml({
      type: "quiz",
      title: "Chapter Quiz",
      passThreshold: 70,
      questions: [
        {
          type: "mcq",
          prompt: "What is JSX?",
          options: ["HTML", "JavaScript XML", "CSS"],
          correctIndex: 1,
          points: 1,
          feedbackCorrect: "Well done!",
          feedbackIncorrect: "Try again.",
        },
      ],
    });
    expect(html).toContain("Chapter Quiz");
    expect(html).toContain("What is JSX?");
    expect(html).toContain("JavaScript XML");
    expect(html).toContain('type="radio"');
    expect(html).toContain("submitQuiz(");
    expect(html).toContain('"Well done!"');
  });

  it("quiz block renders True/False questions", () => {
    const html = _blockToHtml({
      type: "quiz",
      questions: [{ type: "tf", prompt: "React is a library.", correctTF: "True", points: 1 }],
    });
    expect(html).toContain("React is a library.");
    expect(html).toContain("True");
    expect(html).toContain("False");
  });

  it("quiz block renders Fill in the Blank questions", () => {
    const html = _blockToHtml({
      type: "quiz",
      questions: [
        {
          type: "fitb",
          prompt: "Complete: React is a ___.",
          acceptedAnswers: ["library"],
          points: 1,
        },
      ],
    });
    expect(html).toContain("Complete: React is a ___.");
    expect(html).toContain('type="text"');
    expect(html).toContain("fitb-input");
  });

  it("quiz block escapes title content", () => {
    const html = _blockToHtml({ type: "quiz", title: "<b>Quiz</b>", questions: [] });
    expect(html).toContain("&lt;b&gt;Quiz&lt;/b&gt;");
    expect(html).not.toContain("<b>Quiz</b>");
  });

  it("time-requirements block renders required minutes", () => {
    const html = _blockToHtml({ type: "time-requirements", requiredMinutes: 5, showProgress: true });
    expect(html).toContain("5 minute");
    expect(html).toContain("time-requirement");
    expect(html).toContain("setInterval");
  });

  it("time-requirements block defaults to 2 minutes", () => {
    const html = _blockToHtml({ type: "time-requirements" });
    expect(html).toContain("2 minute");
  });

  it("time-requirements block hides on completed when configured", () => {
    const html = _blockToHtml({ type: "time-requirements", requiredMinutes: 1, hideOnCompleted: true });
    expect(html).toContain("true"); // hideOnCompleted in script
  });

  it("categorization block renders prompt and categories (checklist mode)", () => {
    const html = _blockToHtml({
      type: "categorization",
      prompt: "Sort these items:",
      mode: "checklist",
      categories: [
        { id: "c1", label: "Plants" },
        { id: "c2", label: "Animals" },
      ],
      items: [
        { id: "i1", content: "Oak tree", categoryId: "c1" },
        { id: "i2", content: "Eagle", categoryId: "c2" },
      ],
    });
    expect(html).toContain("Sort these items:");
    expect(html).toContain("Plants");
    expect(html).toContain("Animals");
    expect(html).toContain("Oak tree");
    expect(html).toContain("Eagle");
    expect(html).toContain("submitCategorization(");
    expect(html).toContain('type="radio"');
  });

  it("categorization block renders drag-drop zones", () => {
    const html = _blockToHtml({
      type: "categorization",
      mode: "dragdrop",
      categories: [{ id: "c1", label: "Category A" }, { id: "c2", label: "Category B" }],
      items: [{ id: "i1", content: "Item 1", categoryId: "c1" }],
    });
    expect(html).toContain("cat-zone");
    expect(html).toContain("cat-pill");
    expect(html).toContain("catZoneClick(");
  });

  it("categorization block escapes content", () => {
    const html = _blockToHtml({
      type: "categorization",
      prompt: "<script>xss</script>",
      mode: "checklist",
      categories: [{ id: "c1", label: "<b>Cat</b>" }],
      items: [],
    });
    expect(html).not.toContain("<script>xss</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;Cat&lt;/b&gt;");
  });
});

// ── generateManifest12 ────────────────────────────────────────────────────────

describe("_generateManifest12", () => {
  const course = makeCourse();
  const modules = [makeModule({ title: "Intro" }), makeModule({ id: "mod-002", title: "Deep Dive", order: 1 })];

  let manifest;
  beforeEach(() => {
    manifest = _generateManifest12(course, modules);
  });

  it("starts with XML declaration", () => {
    expect(manifest.startsWith('<?xml version="1.0"')).toBe(true);
  });

  it("contains ADL SCORM 1.2 schema", () => {
    expect(manifest).toContain("<schema>ADL SCORM</schema>");
    expect(manifest).toContain("<schemaversion>1.2</schemaversion>");
  });

  it("contains organisation title", () => {
    expect(manifest).toContain("<title>Test Course</title>");
  });

  it("contains one item per module", () => {
    expect(manifest).toContain("<title>Intro</title>");
    expect(manifest).toContain("<title>Deep Dive</title>");
  });

  it("references module HTML files as resources", () => {
    expect(manifest).toContain("module_1/index.html");
    expect(manifest).toContain("module_2/index.html");
  });

  it("marks resources as SCO type", () => {
    expect(manifest).toContain('adlcp:scormtype="sco"');
  });

  it("course id is used in the manifest identifier", () => {
    // id = 'abc12345-0000-0000-0000-000000000001' → stripped → 'abc123450000000000000000'
    expect(manifest).toContain("COURSEFORGE_abc12345000000");
  });

  it("escapes course title in XML", () => {
    const manifest2 = _generateManifest12(
      makeCourse({ title: "A & B <Course>" }),
      [makeModule()]
    );
    expect(manifest2).toContain("A &amp; B &lt;Course&gt;");
    expect(manifest2).not.toContain("<Course>");
  });
});

// ── generateManifest2004 ──────────────────────────────────────────────────────

describe("_generateManifest2004", () => {
  const course = makeCourse({ title: "SCORM 2004 Course" });
  const modules = [makeModule({ title: "Unit 1" }), makeModule({ id: "mod-002", title: "Unit 2", order: 1 })];

  let manifest;
  beforeEach(() => {
    manifest = _generateManifest2004(course, modules);
  });

  it("declares SCORM 2004 4th Edition schema", () => {
    expect(manifest).toContain("<schema>ADL SCORM</schema>");
    expect(manifest).toContain("<schemaversion>2004 4th Edition</schemaversion>");
  });

  it("includes imsss namespace declaration", () => {
    expect(manifest).toContain("xmlns:imsss=");
  });

  it("includes sequencing elements per item", () => {
    expect(manifest).toContain("<imsss:sequencing>");
    expect(manifest).toContain("<imsss:deliveryControls");
  });

  it("marks resources as SCORM type (camelCase)", () => {
    expect(manifest).toContain('adlcp:scormType="sco"');
  });

  it("contains one item per module", () => {
    expect(manifest).toContain("<title>Unit 1</title>");
    expect(manifest).toContain("<title>Unit 2</title>");
  });
});

// ── buildPreviewHtml ──────────────────────────────────────────────────────────

describe("buildPreviewHtml", () => {
  it("returns a complete HTML document", () => {
    const html = buildPreviewHtml(makeModule(), "My Course");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  it("includes the module title and course title in <title>", () => {
    const html = buildPreviewHtml(makeModule({ title: "Intro Module" }), "My Course");
    expect(html).toContain("Intro Module");
    expect(html).toContain("My Course");
  });

  it("includes the SCORM runtime shim", () => {
    const html = buildPreviewHtml(makeModule(), "Course");
    expect(html).toContain("findAPI");
    expect(html).toContain("initSCORM");
    expect(html).toContain("LMSInitialize");
  });

  it("includes the quiz engine JS", () => {
    const html = buildPreviewHtml(makeModule(), "Course");
    expect(html).toContain("submitQuiz");
    expect(html).toContain("kcAnswer");
    expect(html).toContain("flipCard");
  });

  it("renders blocks inside .sco-wrapper", () => {
    const mod = makeModule({
      blocks_json: JSON.stringify([{ type: "h1", content: "Welcome!" }]),
    });
    const html = buildPreviewHtml(mod, "Course");
    expect(html).toContain('<div class="sco-wrapper">');
    expect(html).toContain("<h1>Welcome!</h1>");
  });

  it("defaults courseTitle to 'Preview' when not provided", () => {
    const html = buildPreviewHtml(makeModule());
    expect(html).toContain("Preview");
  });

  it("handles malformed blocks_json gracefully", () => {
    const mod = makeModule({ blocks_json: "not-json{{{" });
    expect(() => buildPreviewHtml(mod, "Course")).not.toThrow();
  });
});

// ── exportToScorm12 / exportToScorm2004 ───────────────────────────────────────

describe("exportToScorm12 and exportToScorm2004", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exportToScorm12 throws when modules array is empty", async () => {
    await expect(exportToScorm12(makeCourse(), [])).rejects.toThrow("No modules to export");
  });

  it("exportToScorm2004 throws when modules array is empty", async () => {
    await expect(exportToScorm2004(makeCourse(), [])).rejects.toThrow("No modules to export");
  });

  it("exportToScorm12 creates a blob URL and triggers download", async () => {
    // Restore to a clean state so jsdom's own createElement works
    vi.restoreAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/fake");
    global.URL.revokeObjectURL = vi.fn();

    const course = makeCourse({ id: "abc12345-1234-1234-1234-123456789012" });
    const modules = [makeModule({ title: "Intro" })];

    const filename = await exportToScorm12(course, modules);
    expect(global.URL.createObjectURL).toHaveBeenCalledOnce();
    expect(filename).toMatch(/scorm12/);
  });

  it("exportToScorm2004 filename contains scorm2004", async () => {
    vi.restoreAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/fake");
    global.URL.revokeObjectURL = vi.fn();

    const course = makeCourse({ id: "abc12345-1234-1234-1234-123456789012" });
    const modules = [makeModule({ title: "Unit 1" })];

    const filename = await exportToScorm2004(course, modules);
    expect(filename).toMatch(/scorm2004/);
  });

  it("exportToScorm12 ZIP contains imsmanifest.xml", async () => {
    vi.restoreAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:fake");
    global.URL.revokeObjectURL = vi.fn();

    const course = makeCourse({ id: "abc12345-0000-0000-0000-000000000099" });
    const modules = [
      makeModule({ title: "Module A" }),
      makeModule({ id: "mod-002", title: "Module B", order: 1 }),
    ];

    // Intercept JSZip.generateAsync to inspect the zip contents
    let capturedFiles = null;
    const originalGenerateAsync = JSZip.prototype.generateAsync;
    JSZip.prototype.generateAsync = async function (opts) {
      capturedFiles = Object.keys(this.files);
      return originalGenerateAsync.call(this, opts);
    };

    await exportToScorm12(course, modules);

    expect(capturedFiles).toContain("imsmanifest.xml");
    expect(capturedFiles).toContain("module_1/index.html");
    expect(capturedFiles).toContain("module_2/index.html");

    JSZip.prototype.generateAsync = originalGenerateAsync;
  });

  it("exportToScorm12 with navBar=bottom includes nav bar HTML in module pages", async () => {
    vi.restoreAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:fake");
    global.URL.revokeObjectURL = vi.fn();

    const course = makeCourse({ id: "abc12345-0000-0000-0000-000000000099" });
    const modules = [
      makeModule({ title: "Module A" }),
      makeModule({ id: "mod-002", title: "Module B", order: 1 }),
    ];

    let capturedContents = {};
    const originalGenerateAsync = JSZip.prototype.generateAsync;
    const originalFile = JSZip.prototype.file;
    const fileMap = {};
    JSZip.prototype.file = function (name, content) {
      if (content !== undefined) { fileMap[name] = content; return this; }
      return originalFile.call(this, name);
    };
    JSZip.prototype.generateAsync = async function (opts) {
      capturedContents = { ...fileMap };
      return originalGenerateAsync.call(this, opts);
    };

    await exportToScorm12(course, modules, { navBar: { position: "bottom" } });

    expect(capturedContents["module_1/index.html"]).toContain("slide-nav-bar");
    expect(capturedContents["module_1/index.html"]).toContain("1 / 2");
    expect(capturedContents["module_2/index.html"]).toContain("2 / 2");

    JSZip.prototype.generateAsync = originalGenerateAsync;
    JSZip.prototype.file = originalFile;
  });

  it("exportToScorm12 with navBar=none does not include nav bar", async () => {
    vi.restoreAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:fake");
    global.URL.revokeObjectURL = vi.fn();

    const course = makeCourse({ id: "abc12345-0000-0000-0000-000000000099" });
    const modules = [makeModule({ title: "Module A" })];

    let capturedContents = {};
    const originalGenerateAsync = JSZip.prototype.generateAsync;
    const originalFile = JSZip.prototype.file;
    const fileMap = {};
    JSZip.prototype.file = function (name, content) {
      if (content !== undefined) { fileMap[name] = content; return this; }
      return originalFile.call(this, name);
    };
    JSZip.prototype.generateAsync = async function (opts) {
      capturedContents = { ...fileMap };
      return originalGenerateAsync.call(this, opts);
    };

    await exportToScorm12(course, modules, { navBar: { position: "none" } });

    // The nav bar HTML element should not be present (CSS classes can still exist in stylesheet)
    expect(capturedContents["module_1/index.html"]).not.toContain('<nav class="slide-nav-bar');

    JSZip.prototype.generateAsync = originalGenerateAsync;
    JSZip.prototype.file = originalFile;
  });
});
