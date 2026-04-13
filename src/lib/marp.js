export const DEFAULT_VOICEOVER_LANGUAGE = "en-US";
export const DEFAULT_VOICEOVER_PROVIDER = "kugelaudio-open";
export const DEFAULT_VOICEOVER_MODEL = "kugelaudio/kugelaudio-0-open";
export const DEFAULT_VOICEOVER_VOICE = "default";
export const DEFAULT_SUBTITLE_MODE = "timing";
export const DEFAULT_NARRATION_INTERCHANGE_FORMAT = "ssml";
export const DEFAULT_LOCALIZATION_PROVIDER = "google-translategemma";
export const DEFAULT_LOCALIZATION_RUNTIME = "ollama";
export const DEFAULT_LOCALIZATION_MODEL = "translategemma";
export const DEFAULT_SCORM_PROFILES = ["scorm-1.2", "scorm-2004-4th"];

export const MARP_METADATA_BLOCK_TYPES = new Set([
  "marp-slide-directive",
  "marp-bg-image",
  "marp-style",
  "marp-voiceover",
]);

const HEADING_TYPES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const VOICEOVER_BLOCK_TYPES = new Set(["marp-voiceover"]);

const makeSegmentId = () => `seg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const XML_ENTITY_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const escapeXml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => XML_ENTITY_MAP[character] || character);

const unescapeXml = (value = "") =>
  String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const sanitizeXmlComment = (value = "") => String(value || "").replace(/--+/g, "-").trim();

const stableHash = (value) => {
  const input = typeof value === "string" ? value : JSON.stringify(value);
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return `md_${(hash >>> 0).toString(16)}`;
};

const normalizeLocaleList = (value) => {
  const entries = Array.isArray(value)
    ? value
    : String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return [...new Set(entries.map((entry) => entry.trim()).filter(Boolean))];
};

const normalizeScormProfiles = (value) => {
  const entries = Array.isArray(value) ? value : [];
  const allowed = new Set(DEFAULT_SCORM_PROFILES);
  const normalized = [...new Set(entries.filter((entry) => allowed.has(entry)))];
  return normalized.length > 0 ? normalized : [...DEFAULT_SCORM_PROFILES];
};

const parseSsmlBreakTimeToMs = (value = "") => {
  const trimmed = String(value || "").trim().toLowerCase();
  if (!trimmed) return 0;

  if (trimmed.endsWith("ms")) {
    return normalizePauseDuration(trimmed.slice(0, -2));
  }

  if (trimmed.endsWith("s")) {
    const seconds = Number.parseFloat(trimmed.slice(0, -1));
    return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds * 1000) : 0;
  }

  return normalizePauseDuration(trimmed);
};

const buildSsmlSequenceLines = (segments = []) => {
  const lines = [];

  segments.forEach((segment) => {
    const text = String(segment?.text || "").trim();
    const pauseAfterMs = normalizePauseDuration(segment?.pauseAfterMs);

    if (text) {
      lines.push(`    <s>${escapeXml(text)}</s>`);
    }

    if (pauseAfterMs > 0) {
      lines.push(`    <break time="${pauseAfterMs}ms" />`);
    }
  });

  return lines;
};

export const createVoiceoverSegment = (overrides = {}) => ({
  id: makeSegmentId(),
  text: "",
  pauseAfterMs: 0,
  ...overrides,
});

export const createDefaultMarpVoiceoverBlock = (overrides = {}) => ({
  id: Date.now().toString(),
  type: "marp-voiceover",
  content: "",
  language: DEFAULT_VOICEOVER_LANGUAGE,
  sourceLocale: DEFAULT_VOICEOVER_LANGUAGE,
  provider: DEFAULT_VOICEOVER_PROVIDER,
  voice: DEFAULT_VOICEOVER_VOICE,
  model: DEFAULT_VOICEOVER_MODEL,
  subtitleMode: DEFAULT_SUBTITLE_MODE,
  interchangeFormat: DEFAULT_NARRATION_INTERCHANGE_FORMAT,
  ssml: "",
  targetLocales: [],
  autoLocalize: true,
  localizationProvider: DEFAULT_LOCALIZATION_PROVIDER,
  localizationRuntime: DEFAULT_LOCALIZATION_RUNTIME,
  localizationModel: DEFAULT_LOCALIZATION_MODEL,
  localizationApiUrl: "",
  autoScormPackaging: true,
  scormProfiles: [...DEFAULT_SCORM_PROFILES],
  useOllama: false,
  segments: [createVoiceoverSegment()],
  ...overrides,
});

const normalizePauseDuration = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const parseVoiceoverScript = (input = "") => {
  const script = String(input || "").replace(/\r\n/g, "\n").trim();
  if (!script) return [];

  const segments = [];
  const pauseRegex = /\[PAUSE:(\d+)\]/gi;
  let lastIndex = 0;
  let match;

  while ((match = pauseRegex.exec(script)) !== null) {
    const text = script.slice(lastIndex, match.index).trim();
    const pauseAfterMs = normalizePauseDuration(match[1]);

    if (text) {
      segments.push(createVoiceoverSegment({ text, pauseAfterMs }));
    } else if (segments.length > 0) {
      const prev = segments[segments.length - 1];
      prev.pauseAfterMs += pauseAfterMs;
    }

    lastIndex = pauseRegex.lastIndex;
  }

  const tail = script.slice(lastIndex).trim();
  if (tail) {
    segments.push(createVoiceoverSegment({ text: tail, pauseAfterMs: 0 }));
  }

  return segments;
};

export const voiceoverSsmlToScript = (input = "") => {
  const ssml = String(input || "").trim();
  if (!ssml) return "";

  const withPauses = ssml.replace(/<break\b[^>]*time=["']([^"']+)["'][^>]*\/?>/gi, (_match, time) => {
    const pauseAfterMs = parseSsmlBreakTimeToMs(time);
    return pauseAfterMs > 0 ? `\n[PAUSE:${pauseAfterMs}]\n` : "\n";
  });

  const withoutTags = withPauses
    .replace(/<\/s>/gi, " ")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/voice>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r\n/g, "\n");

  return unescapeXml(withoutTags)
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ ?\n ?/g, "\n")
    .trim();
};

export const parseVoiceoverSsml = (input = "") => parseVoiceoverScript(voiceoverSsmlToScript(input));

export const stringifyVoiceoverSegments = (segments = []) =>
  segments
    .map((segment) => {
      const text = String(segment?.text || "").trim();
      const pauseAfterMs = normalizePauseDuration(segment?.pauseAfterMs);
      if (!text) return "";
      return pauseAfterMs > 0 ? `${text}\n[PAUSE:${pauseAfterMs}]` : text;
    })
    .filter(Boolean)
    .join("\n\n");

export const normalizeVoiceoverSegments = (block = {}) => {
  const explicitSegments = Array.isArray(block.segments)
    ? block.segments
        .map((segment) => ({
          id: segment?.id || makeSegmentId(),
          text: String(segment?.text || "").trim(),
          pauseAfterMs: normalizePauseDuration(segment?.pauseAfterMs),
        }))
        .filter((segment) => segment.text)
    : [];

  if (explicitSegments.length > 0) {
    return explicitSegments;
  }

  if (block.ssml) {
    return parseVoiceoverSsml(block.ssml);
  }

  return parseVoiceoverScript(block.content || "");
};

export const voiceoverSegmentsToSsml = (segments = [], options = {}) => {
  const language = options.language || DEFAULT_VOICEOVER_LANGUAGE;
  const voice = options.voice || "";
  const sequenceLines = buildSsmlSequenceLines(segments);

  return [
    `<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${escapeXml(language)}">`,
    ...(voice && voice !== DEFAULT_VOICEOVER_VOICE ? [`  <voice name="${escapeXml(voice)}">`] : []),
    "  <p>",
    ...(sequenceLines.length > 0 ? sequenceLines : ["    <s></s>"]),
    "  </p>",
    ...(voice && voice !== DEFAULT_VOICEOVER_VOICE ? ["  </voice>"] : []),
    "</speak>",
  ].join("\n");
};

export const normalizeVoiceoverBlock = (block = {}) => {
  const sourceLocale = block.sourceLocale || block.language || DEFAULT_VOICEOVER_LANGUAGE;
  const contentSource = block.content || voiceoverSsmlToScript(block.ssml || "");
  const segments = normalizeVoiceoverSegments({ ...block, content: contentSource });
  const content = String(contentSource || stringifyVoiceoverSegments(segments)).trim();
  const targetLocales = normalizeLocaleList(block.targetLocales).filter((locale) => locale !== sourceLocale);
  const scormProfiles = normalizeScormProfiles(block.scormProfiles);
  const ssml = voiceoverSegmentsToSsml(segments, {
    language: sourceLocale,
    voice: block.voice || DEFAULT_VOICEOVER_VOICE,
  });

  return {
    ...createDefaultMarpVoiceoverBlock({ id: block.id }),
    ...block,
    content,
    language: sourceLocale,
    sourceLocale,
    provider: block.provider || DEFAULT_VOICEOVER_PROVIDER,
    voice: block.voice || DEFAULT_VOICEOVER_VOICE,
    model: block.model || DEFAULT_VOICEOVER_MODEL,
    subtitleMode: block.subtitleMode || DEFAULT_SUBTITLE_MODE,
    interchangeFormat: block.interchangeFormat || DEFAULT_NARRATION_INTERCHANGE_FORMAT,
    ssml,
    targetLocales,
    autoLocalize: block.autoLocalize !== false,
    localizationProvider: block.localizationProvider || DEFAULT_LOCALIZATION_PROVIDER,
    localizationRuntime: block.localizationRuntime || DEFAULT_LOCALIZATION_RUNTIME,
    localizationModel: block.localizationModel || DEFAULT_LOCALIZATION_MODEL,
    localizationApiUrl: block.localizationApiUrl || "",
    autoScormPackaging: block.autoScormPackaging !== false,
    scormProfiles,
    useOllama: !!block.useOllama,
    segments: segments.length > 0 ? segments : [createVoiceoverSegment()],
  };
};

export const serializeVoiceoverComment = (block = {}) => {
  const normalized = normalizeVoiceoverBlock(block);
  const script = normalized.content || stringifyVoiceoverSegments(normalized.segments);
  const trimmed = String(script || "").trim();
  if (!trimmed) return "";
  return `<!--\n${trimmed}\n-->`;
};

export const extractVoiceoverBlocks = (slideBlocks = []) =>
  slideBlocks.filter((block) => VOICEOVER_BLOCK_TYPES.has(block?.type));

export const getRenderableSlideBlocks = (slideBlocks = []) =>
  slideBlocks.filter((block) => !MARP_METADATA_BLOCK_TYPES.has(block?.type));

export const getSlideTitle = (slideBlocks = [], slideIndex = 0) => {
  const heading = getRenderableSlideBlocks(slideBlocks).find(
    (block) => HEADING_TYPES.has(block?.type) && String(block?.content || "").trim()
  );
  return heading?.content?.trim() || `Slide ${slideIndex + 1}`;
};

/**
 * Convert a single block (non-MARP-specific) to its markdown representation.
 */
export const blockToMarkdown = (block) => {
  switch (block.type) {
    case "h1":
      return `# ${block.content}`;
    case "h2":
      return `## ${block.content}`;
    case "h3":
      return `### ${block.content}`;
    case "h4":
      return `#### ${block.content}`;
    case "h5":
      return `##### ${block.content}`;
    case "h6":
      return `###### ${block.content}`;
    case "paragraph":
      return block.content;
    case "grid": {
      const rawCols = block.columns || [];
      const columns = rawCols.map((col) => {
        if (Array.isArray(col.blocks)) return col;
        const nestedBlock =
          col.type === "image"
            ? { type: "image", content: col.content || "", alt: "" }
            : { type: "paragraph", content: col.content || "" };
        return { blocks: [nestedBlock] };
      });

      const prefix = {
        h1: "# ",
        h2: "## ",
        h3: "### ",
        h4: "#### ",
        h5: "##### ",
        h6: "###### ",
      };

      const getCellText = (col) =>
        (col.blocks || [])
          .map((nestedBlock) => {
            if (nestedBlock.type === "separator") return "---";
            if (nestedBlock.type === "image") {
              return `![${nestedBlock.alt || ""}](${nestedBlock.content || ""})`;
            }
            if (nestedBlock.type === "alert") {
              return `> [!${(nestedBlock.alertType || "note").toUpperCase()}]\n> ${nestedBlock.content || ""}`;
            }
            return (prefix[nestedBlock.type] || "") + (nestedBlock.content || "");
          })
          .join("\n\n");

      const colWidth = `${Math.floor(100 / Math.max(columns.length, 1))}%`;
      const cells = columns
        .map(
          (col) =>
            `<div style="width:${colWidth};display:inline-block;vertical-align:top;padding-right:12px">${getCellText(col).replace(/\n\n/g, "<br><br>")}</div>`
        )
        .join("");

      return `<div style="display:flex;flex-wrap:wrap">${cells}</div>\n\n`;
    }
    case "blockquote":
      return `> ${block.content}`;
    case "alert": {
      const alertType = (block.alertType || "note").toUpperCase();
      const content = block.content || "";
      const lines = content.split("\n");
      const quotedLines = lines.map((line) => `> ${line}`).join("\n");
      return `> [!${alertType}]\n${quotedLines}`;
    }
    case "code":
    case "html":
    case "math":
    case "diagram":
    case "ul":
    case "ol":
    case "task-list":
      return block.content;
    case "separator":
      return "---";
    case "image": {
      const align = block.align || "left";
      let imageMarkdown;
      if (block.width || block.height) {
        const attrs = [`src="${block.content}"`];
        if (block.alt) attrs.push(`alt="${block.alt}"`);
        if (block.width) attrs.push(`width="${block.width}"`);
        if (block.height) attrs.push(`height="${block.height}"`);
        imageMarkdown = `<img ${attrs.join(" ")} />`;
      } else {
        imageMarkdown = `![${block.alt || ""}](${block.content})`;
      }
      if (align === "center") return `<p align="center">\n\n${imageMarkdown}\n\n</p>`;
      if (align === "right") return `<p align="right">\n\n${imageMarkdown}\n\n</p>`;
      return imageMarkdown;
    }
    case "link":
      return `[${block.content}](${block.url || ""})`;
    case "table":
      return block.content;
    case "marp-voiceover":
      return "";
    default:
      return block.content || "";
  }
};

export const splitBlocksIntoSlides = (blocks = []) => {
  let frontmatter = null;
  const slideGroups = [];
  let current = [];

  for (const block of blocks) {
    if (block.type === "marp-frontmatter") {
      frontmatter = block;
      continue;
    }

    if (block.type === "slide") {
      slideGroups.push(current);
      current = [];
    } else {
      current.push(block);
    }
  }

  if (current.length > 0 || slideGroups.length > 0) {
    slideGroups.push(current);
  }

  return { frontmatter, slideGroups };
};

export const slideBlocksToMarkdown = (blocks = []) =>
  getRenderableSlideBlocks(blocks)
    .map((block) => blockToMarkdown(block))
    .filter((value) => value !== "")
    .join("\n\n");

export const extractCustomCss = (blocks = []) =>
  blocks
    .filter((block) => block.type === "marp-style" && block.content)
    .map((block) => block.content)
    .join("\n");

export const getSlideBackground = (slideBlocks = []) => {
  const bgBlock = slideBlocks.find((block) => block.type === "marp-bg-image" && block.content);
  if (!bgBlock) return null;
  return {
    url: bgBlock.content,
    position: bgBlock.position || "bg",
    opacity: bgBlock.opacity,
  };
};

export const getSlideDirectives = (slideBlocks = []) => {
  const directives = {};
  for (const block of slideBlocks) {
    if (block.type === "marp-slide-directive") {
      for (const directive of block.directives || []) {
        if (directive.key && directive.value) {
          directives[directive.key] = directive.value;
        }
      }
    }
  }
  return directives;
};

export const buildNarrationSsmlDocument = (blocks = [], options = {}) => {
  const transcriptManifest = buildMarpTranscriptManifest(blocks, options);
  const narratedSlides = transcriptManifest.slides.filter((slide) => slide.transcript?.segments?.length > 0);

  if (narratedSlides.length === 0) {
    return "";
  }

  const documentLines = [
    `<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${escapeXml(transcriptManifest.metadata.defaultLanguage)}">`,
  ];

  narratedSlides.forEach((slide) => {
    documentLines.push(`  <!-- Slide ${slide.index + 1}: ${sanitizeXmlComment(slide.title)} -->`);

    if (slide.voice?.voiceId && slide.voice.voiceId !== DEFAULT_VOICEOVER_VOICE) {
      documentLines.push(`  <voice name="${escapeXml(slide.voice.voiceId)}">`);
    }

    documentLines.push("  <p>");
    const sequenceLines = buildSsmlSequenceLines(slide.transcript.segments || []);
    documentLines.push(...(sequenceLines.length > 0 ? sequenceLines : ["    <s></s>"]));
    documentLines.push("  </p>");

    if (slide.voice?.voiceId && slide.voice.voiceId !== DEFAULT_VOICEOVER_VOICE) {
      documentLines.push("  </voice>");
    }
  });

  documentLines.push("</speak>");
  return documentLines.join("\n");
};

/**
 * Convert blocks (MARP mode) to a valid MARP markdown string.
 */
export const blocksToMarpMarkdown = (blocks = []) => {
  if (!blocks.length) return "";

  const parts = [];

  for (const block of blocks) {
    switch (block.type) {
      case "marp-frontmatter": {
        const lines = ["---", "marp: true"];
        if (block.theme) lines.push(`theme: ${block.theme}`);
        if (block.size) lines.push(`size: '${block.size}'`);
        if (block.paginate) lines.push("paginate: true");
        if (block.header) lines.push(`header: '${block.header}'`);
        if (block.footer) lines.push(`footer: '${block.footer}'`);
        if (block.backgroundColor) lines.push(`backgroundColor: '${block.backgroundColor}'`);
        if (block.color) lines.push(`color: '${block.color}'`);
        lines.push("---");
        parts.push(lines.join("\n"));
        break;
      }
      case "slide":
        parts.push("---");
        break;
      case "marp-slide-directive": {
        const comments = (block.directives || [])
          .filter((directive) => directive.key && directive.value)
          .map((directive) => `<!-- ${directive.key}: ${directive.value} -->`);
        if (comments.length > 0) parts.push(comments.join("\n"));
        break;
      }
      case "marp-bg-image": {
        if (!block.content) break;
        let alt = block.position || "bg";
        if (block.opacity) alt += ` opacity:${block.opacity}`;
        parts.push(`![${alt}](${block.content})`);
        break;
      }
      case "marp-style":
        if (block.content) parts.push(`<style>\n${block.content}\n</style>`);
        break;
      case "marp-voiceover": {
        const comment = serializeVoiceoverComment(block);
        if (comment) parts.push(comment);
        break;
      }
      default:
        parts.push(blockToMarkdown(block));
        break;
    }
  }

  return parts.filter(Boolean).join("\n\n");
};

export const buildMarpTranscriptManifest = (blocks = [], options = {}) => {
  const title = options.title || "Untitled Presentation";
  const { slideGroups } = splitBlocksIntoSlides(blocks);
  const slideEntries = [];
  const warnings = [];

  slideGroups.forEach((slideBlocks, index) => {
    const voiceoverBlocks = extractVoiceoverBlocks(slideBlocks);
    const primaryVoiceover = voiceoverBlocks[0] ? normalizeVoiceoverBlock(voiceoverBlocks[0]) : null;

    if (voiceoverBlocks.length > 1) {
      warnings.push(`Slide ${index + 1} contains ${voiceoverBlocks.length} voiceover blocks; only the first will be rendered.`);
    }

    const segments = primaryVoiceover
      ? normalizeVoiceoverSegments(primaryVoiceover)
      : [];
    const sourceHash = primaryVoiceover
      ? stableHash({
          slide: index,
          content: primaryVoiceover.content,
          ssml: primaryVoiceover.ssml,
          language: primaryVoiceover.sourceLocale,
          voice: primaryVoiceover.voice,
          model: primaryVoiceover.model,
          targetLocales: primaryVoiceover.targetLocales,
          scormProfiles: primaryVoiceover.scormProfiles,
        })
      : null;

    slideEntries.push({
      index,
      title: getSlideTitle(slideBlocks, index),
      language: primaryVoiceover?.sourceLocale || options.language || DEFAULT_VOICEOVER_LANGUAGE,
      sourceHash,
      voice: primaryVoiceover
        ? {
            provider: primaryVoiceover.provider,
            voiceId: primaryVoiceover.voice,
            model: primaryVoiceover.model,
            subtitleMode: primaryVoiceover.subtitleMode,
            useOllama: primaryVoiceover.useOllama,
          }
        : null,
      localization: primaryVoiceover
        ? {
            enabled: primaryVoiceover.autoLocalize && primaryVoiceover.targetLocales.length > 0,
            sourceLocale: primaryVoiceover.sourceLocale,
            targetLocales: primaryVoiceover.targetLocales,
            provider: primaryVoiceover.localizationProvider,
            runtime: primaryVoiceover.localizationRuntime,
            model: primaryVoiceover.localizationModel,
            apiUrl: primaryVoiceover.localizationApiUrl || null,
          }
        : null,
      packaging: primaryVoiceover
        ? {
            scorm: {
              enabled: primaryVoiceover.autoScormPackaging,
              profiles: primaryVoiceover.scormProfiles,
            },
          }
        : null,
      transcript: primaryVoiceover
        ? {
            content: primaryVoiceover.content,
            ssml: primaryVoiceover.ssml,
            interchangeFormat: primaryVoiceover.interchangeFormat,
            segments,
            pauseDurationMs: segments.reduce(
              (total, segment) => total + normalizePauseDuration(segment.pauseAfterMs),
              0
            ),
          }
        : null,
    });
  });

  const defaultLanguage =
    options.language ||
    slideEntries.find((slide) => slide.transcript)?.language ||
    DEFAULT_VOICEOVER_LANGUAGE;
  const firstVoice = slideEntries.find((slide) => slide.voice)?.voice;

  return {
    version: "1.0",
    metadata: {
      title,
      generatedAt: new Date().toISOString(),
      defaultLanguage,
      workflow: "marp-narration-pipeline",
      subtitleStrategy: DEFAULT_SUBTITLE_MODE,
      localizationDefaults: {
        provider: DEFAULT_LOCALIZATION_PROVIDER,
        runtime: DEFAULT_LOCALIZATION_RUNTIME,
        model: DEFAULT_LOCALIZATION_MODEL,
      },
      packagingDefaults: {
        scormProfiles: [...DEFAULT_SCORM_PROFILES],
      },
      defaultVoice: {
        provider: firstVoice?.provider || DEFAULT_VOICEOVER_PROVIDER,
        voiceId: firstVoice?.voiceId || options.voice || DEFAULT_VOICEOVER_VOICE,
        model: firstVoice?.model || options.model || DEFAULT_VOICEOVER_MODEL,
      },
    },
    slides: slideEntries,
    warnings,
  };
};

export const buildMarpBackgroundTaskManifest = (blocks = [], options = {}, transcriptManifest = null) => {
  const manifest = transcriptManifest || buildMarpTranscriptManifest(blocks, options);
  const tasks = [];
  const sourceHash = stableHash(manifest.slides.map((slide) => ({
    index: slide.index,
    sourceHash: slide.sourceHash,
    language: slide.language,
  })));

  const localizationDefaults = manifest.slides.find((slide) => slide.localization)?.localization || {
    sourceLocale: manifest.metadata.defaultLanguage,
    provider: DEFAULT_LOCALIZATION_PROVIDER,
    runtime: DEFAULT_LOCALIZATION_RUNTIME,
    model: DEFAULT_LOCALIZATION_MODEL,
    apiUrl: null,
  };

  const targetLocales = [...new Set(
    manifest.slides.flatMap((slide) => slide.localization?.targetLocales || [])
  )];

  targetLocales.forEach((targetLocale) => {
    tasks.push({
      id: `localize-${targetLocale}`,
      kind: "localization",
      scope: "module",
      detectedState: "missing-or-stale",
      sourceHash,
      sourceLocale: localizationDefaults.sourceLocale || manifest.metadata.defaultLanguage,
      targetLocale,
      provider: localizationDefaults.provider,
      runtime: localizationDefaults.runtime,
      model: localizationDefaults.model,
      apiUrl: localizationDefaults.apiUrl,
      interchangeFormat: DEFAULT_NARRATION_INTERCHANGE_FORMAT,
      inputArtifact: "narration.ssml",
    });
  });

  const scormProfiles = [...new Set(
    manifest.slides.flatMap((slide) => slide.packaging?.scorm?.enabled ? slide.packaging.scorm.profiles : [])
  )];
  const packagingLocales = [...new Set([manifest.metadata.defaultLanguage, ...targetLocales])];

  scormProfiles.forEach((profile) => {
    packagingLocales.forEach((locale) => {
      tasks.push({
        id: `package-${profile}-${locale}`,
        kind: "scorm-packaging",
        scope: "module",
        detectedState: "missing-or-stale",
        sourceHash,
        locale,
        profile,
        inputArtifact: "presentation.md",
      });
    });
  });

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    sourceHash,
    defaults: {
      localization: {
        provider: localizationDefaults.provider,
        runtime: localizationDefaults.runtime,
        model: localizationDefaults.model,
      },
      packaging: {
        scormProfiles,
      },
    },
    tasks,
  };
};

export const buildMarpArtifactBundle = (blocks = [], options = {}) => {
  const presentationMarkdown = blocksToMarpMarkdown(blocks);
  const transcriptManifest = buildMarpTranscriptManifest(blocks, options);
  const narrationSsml = buildNarrationSsmlDocument(blocks, options);
  const backgroundTaskManifest = buildMarpBackgroundTaskManifest(blocks, options, transcriptManifest);
  return {
    presentationMarkdown,
    transcriptManifest,
    narrationSsml,
    backgroundTaskManifest,
    warnings: transcriptManifest.warnings || [],
  };
};