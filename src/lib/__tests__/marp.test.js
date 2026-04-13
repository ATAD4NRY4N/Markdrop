import { describe, expect, it } from "vitest";
import {
  blocksToMarpMarkdown,
  buildMarpArtifactBundle,
  buildMarpBackgroundTaskManifest,
  buildNarrationSsmlDocument,
  normalizeVoiceoverBlock,
  parseVoiceoverScript,
  parseVoiceoverSsml,
  slideBlocksToMarkdown,
  voiceoverSegmentsToSsml,
} from "../marp";

describe("parseVoiceoverScript", () => {
  it("converts pause directives into segment timing metadata", () => {
    const segments = parseVoiceoverScript(`Intro line.\n[PAUSE:1200]\nSecond line.`);

    expect(segments).toHaveLength(2);
    expect(segments[0].text).toBe("Intro line.");
    expect(segments[0].pauseAfterMs).toBe(1200);
    expect(segments[1].text).toBe("Second line.");
    expect(segments[1].pauseAfterMs).toBe(0);
  });
});

describe("parseVoiceoverSsml", () => {
  it("converts SSML break tags into segment timing metadata", () => {
    const segments = parseVoiceoverSsml(`
      <speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <p>
          <s>Hello there.</s>
          <break time="1.5s" />
          <s>Second sentence.</s>
        </p>
      </speak>
    `);

    expect(segments).toHaveLength(2);
    expect(segments[0].text).toBe("Hello there.");
    expect(segments[0].pauseAfterMs).toBe(1500);
    expect(segments[1].text).toBe("Second sentence.");
  });
});

describe("slideBlocksToMarkdown", () => {
  it("omits non-rendered voiceover metadata from slide content", () => {
    const markdown = slideBlocksToMarkdown([
      { type: "h1", content: "Intro" },
      { type: "marp-voiceover", content: "Narration only" },
      { type: "paragraph", content: "Visible content" },
    ]);

    expect(markdown).toContain("# Intro");
    expect(markdown).toContain("Visible content");
    expect(markdown).not.toContain("Narration only");
  });
});

describe("normalizeVoiceoverBlock", () => {
  it("backfills provider, model, and parsed segments from the raw script", () => {
    const block = normalizeVoiceoverBlock({
      id: "voice-1",
      type: "marp-voiceover",
      content: "Hello world.\n[PAUSE:800]\nNext sentence.",
      voice: "warm",
    });

    expect(block.provider).toBe("kugelaudio-open");
    expect(block.model).toBe("kugelaudio/kugelaudio-0-open");
    expect(block.segments).toHaveLength(2);
    expect(block.segments[0].pauseAfterMs).toBe(800);
    expect(block.ssml).toContain("<speak");
    expect(block.interchangeFormat).toBe("ssml");
  });
});

describe("Marp narration artifacts", () => {
  const blocks = [
    { id: "frontmatter", type: "marp-frontmatter", theme: "default", size: "16:9" },
    { id: "title", type: "h1", content: "Intro" },
    {
      id: "voice-1",
      type: "marp-voiceover",
      content: "Welcome.\n[PAUSE:1000]\nLet us begin.",
      language: "en-US",
      voice: "warm",
      targetLocales: ["fr-FR", "de-DE"],
      localizationRuntime: "ollama",
      localizationModel: "translategemma",
    },
    { id: "body", type: "paragraph", content: "Slide body content" },
    { id: "slide-2", type: "slide" },
    { id: "title-2", type: "h2", content: "Second Slide" },
    {
      id: "voice-2",
      type: "marp-voiceover",
      content: "Primary narration",
    },
    {
      id: "voice-3",
      type: "marp-voiceover",
      content: "Duplicate narration",
    },
  ];

  it("serializes voiceover blocks as HTML comments in Marp markdown", () => {
    const markdown = blocksToMarpMarkdown(blocks);

    expect(markdown).toContain("<!--");
    expect(markdown).toContain("Welcome.");
    expect(markdown).toContain("[PAUSE:1000]");
    expect(markdown).toContain("Primary narration");
  });

  it("builds a transcript manifest and emits duplicate warnings", () => {
    const bundle = buildMarpArtifactBundle(blocks, { title: "Narrated Deck" });

    expect(bundle.presentationMarkdown).toContain("# Intro");
    expect(bundle.narrationSsml).toContain("<speak");
    expect(bundle.narrationSsml).toContain("Slide 1: Intro");
    expect(bundle.transcriptManifest.metadata.title).toBe("Narrated Deck");
    expect(bundle.transcriptManifest.slides).toHaveLength(2);
    expect(bundle.transcriptManifest.slides[0].transcript.segments).toHaveLength(2);
    expect(bundle.transcriptManifest.slides[0].voice.voiceId).toBe("warm");
    expect(bundle.transcriptManifest.slides[0].localization.targetLocales).toEqual(["fr-FR", "de-DE"]);
    expect(bundle.warnings).toHaveLength(1);
    expect(bundle.warnings[0]).toContain("Slide 2 contains 2 voiceover blocks");
    expect(bundle.backgroundTaskManifest.tasks.some((task) => task.kind === "localization")).toBe(true);
    expect(bundle.backgroundTaskManifest.tasks.some((task) => task.kind === "scorm-packaging")).toBe(true);
  });

  it("exports SSML from parsed segments", () => {
    const ssml = voiceoverSegmentsToSsml(
      [
        { id: "seg-1", text: "Hello world.", pauseAfterMs: 500 },
        { id: "seg-2", text: "Next sentence.", pauseAfterMs: 0 },
      ],
      { language: "en-US", voice: "warm" }
    );

    expect(ssml).toContain("<voice name=\"warm\"");
    expect(ssml).toContain("<break time=\"500ms\"");
  });

  it("builds module-level background tasks from narration metadata", () => {
    const transcriptManifest = buildMarpArtifactBundle(blocks, { title: "Narrated Deck" }).transcriptManifest;
    const backgroundTasks = buildMarpBackgroundTaskManifest(blocks, { title: "Narrated Deck" }, transcriptManifest);
    const narrationSsml = buildNarrationSsmlDocument(blocks, { title: "Narrated Deck" });

    expect(backgroundTasks.tasks.filter((task) => task.kind === "localization")).toHaveLength(2);
    expect(backgroundTasks.tasks.filter((task) => task.kind === "scorm-packaging")).not.toHaveLength(0);
    expect(narrationSsml).toContain("<speak");
  });
});