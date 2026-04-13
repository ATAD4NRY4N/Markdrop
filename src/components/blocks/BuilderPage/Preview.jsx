import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  OctagonAlert,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import { useTheme } from "@/components/ThemeProvider";
import BranchingBlock from "@/components/blocks/BuilderPage/blocks/BranchingBlock";
import CarouselBlock from "@/components/blocks/BuilderPage/blocks/CarouselBlock";
import CategorizationBlock from "@/components/blocks/BuilderPage/blocks/CategorizationBlock";
import CourseNavBlock from "@/components/blocks/BuilderPage/blocks/CourseNavBlock";
import FillInTheBlankBlock from "@/components/blocks/BuilderPage/blocks/FillInTheBlankBlock";
import FlashcardBlock from "@/components/blocks/BuilderPage/blocks/FlashcardBlock";
import GridBlock from "@/components/blocks/BuilderPage/blocks/GridBlock";
import HotspotBlock from "@/components/blocks/BuilderPage/blocks/HotspotBlock";
import KnowledgeCheckBlock from "@/components/blocks/BuilderPage/blocks/KnowledgeCheckBlock";
import LearningObjectiveBlock from "@/components/blocks/BuilderPage/blocks/LearningObjectiveBlock";
import MatchingBlock from "@/components/blocks/BuilderPage/blocks/MatchingBlock";
import PdfBlock from "@/components/blocks/BuilderPage/blocks/PdfBlock";
import ProgressMarkerBlock from "@/components/blocks/BuilderPage/blocks/ProgressMarkerBlock";
import QuizBlock from "@/components/blocks/BuilderPage/blocks/QuizBlock";
import TimeRequirementsBlock from "@/components/blocks/BuilderPage/blocks/TimeRequirementsBlock";
import { Button } from "@/components/ui/button";
import {
  getCourseAspectRatio,
  getCourseCanvasLabel,
  getCourseCanvasSize,
  getCourseContentMaxWidth,
  isMarpPresentation,
} from "@/lib/courseDisplay";
import {
  extractCustomCss,
  getSlideBackground,
  getSlideDirectives,
  getRenderableSlideBlocks,
  getSlideTitle,
  MARP_METADATA_BLOCK_TYPES,
  splitBlocksIntoSlides,
} from "@/lib/marp";

function MermaidDiagram({ chart }) {
  const ref = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!ref.current || !chart || !chart.trim() || chart.trim().length < 5) {
      return;
    }

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

        if (ref.current) {
          ref.current.innerHTML = "";
          const { svg } = await mermaid.render(id, chart.trim());
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        }
      } catch (error) {
        console.error("Mermaid render error:", error, "Chart:", chart);
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-destructive text-sm p-4 rounded bg-destructive/10">Mermaid Error: ${error.message}</div>`;
        }
      }
    };

    renderDiagram();
  }, [chart, isDark]);

  return <div ref={ref} className="mermaid-diagram my-4 flex items-center justify-center" />;
}

const blocksToMarkdown = (blocks) => {
  return blocks
    .map((block) => {
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
          return block.content.trim();
        case "blockquote":
          return `> ${block.content}`;
        case "alert": {
          const alertType = (block.alertType || "note").toUpperCase();
          const content = block.content || "";
          return `<div class="alert alert-${block.alertType || "note"}" data-alert-type="${alertType}">\n\n${content}\n\n</div>`;
        }
        case "code":
          return block.content;
        case "math":
          return block.content;
        case "diagram":
          return block.content;
        case "ul":
          return block.content;
        case "ol":
          return block.content;
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

          if (align === "center") {
            return `<p align="center">\n\n${imageMarkdown}\n\n</p>`;
          } else if (align === "right") {
            return `<p align="right">\n\n${imageMarkdown}\n\n</p>`;
          }
          return imageMarkdown;
        }
        case "video": {
          const align = block.align || "left";
          const title = block.title || "";
          const videoTag = `<video src="${block.content}" controls class="max-w-full h-auto rounded"></video>`;
          const content = title ? `<h3>${title}</h3>\n${videoTag}` : videoTag;

          if (align === "center") {
            return `<div align="center">\n\n${content}\n\n</div>`;
          } else if (align === "right") {
            return `<div align="right">\n\n${content}\n\n</div>`;
          }
          return `<div align="left">\n\n${content}\n\n</div>`;
        }
        case "link":
          return `[${block.content}](${block.url || ""})`;
        case "table":
          return block.content;
        case "marp-voiceover":
          return "";
        case "shield-badge": {
          const badges = block.badges || [];
          const align = block.align || "left";

          if (badges.length === 0) return "";

          const badgesMarkdown = badges
            .filter((badge) => {
              if (badge.type === "custom") {
                return badge.label && badge.message;
              } else {
                const githubBadges = [
                  "stars",
                  "forks",
                  "issues",
                  "license",
                  "last-commit",
                  "repo-size",
                  "languages",
                  "contributors",
                  "pull-requests",
                ];
                const socialBadges = [
                  "twitter",
                  "youtube",
                  "discord",
                  "twitch",
                  "instagram",
                  "linkedin",
                  "github-followers",
                  "reddit",
                ];
                const devMetrics = [
                  "npm-downloads",
                  "npm-version",
                  "pypi-downloads",
                  "pypi-version",
                  "codecov",
                  "coveralls",
                  "travis-ci",
                  "github-actions",
                  "docker-pulls",
                  "docker-stars",
                ];
                const docPlatforms = [
                  "gitbook",
                  "notion",
                  "confluence",
                  "docusaurus",
                  "mkdocs",
                  "sphinx",
                ];

                const needsRepo =
                  githubBadges.includes(badge.type) ||
                  ["codecov", "coveralls", "travis-ci", "github-actions"].includes(badge.type);
                const needsPackage =
                  devMetrics.includes(badge.type) &&
                  !["codecov", "coveralls", "travis-ci", "github-actions"].includes(badge.type);
                const needsUsername = socialBadges.includes(badge.type);

                return (
                  (needsRepo && badge.username && badge.repo) ||
                  (needsPackage && badge.package) ||
                  (needsUsername && badge.username) ||
                  (docPlatforms.includes(badge.type) && badge.label)
                );
              }
            })
            .map((badge) => {
              const baseUrl = "https://img.shields.io";

              if (badge.type === "custom") {
                const label = badge.label;
                const message = badge.message;
                const color = badge.color || "blue";
                let url = `${baseUrl}/badge/${encodeURIComponent(
                  label
                )}-${encodeURIComponent(message)}-${color}`;
                const params = [];
                if (badge.style && badge.style !== "flat") {
                  params.push(`style=${badge.style}`);
                }
                if (badge.logo) {
                  params.push(`logo=${encodeURIComponent(badge.logo)}`);
                }
                if (params.length > 0) {
                  url += `?${params.join("&")}`;
                }
                return `![${label}](${url})`;
              } else {
                const { type, username, repo, label, package: pkg } = badge;

                switch (type) {
                  case "stars":
                    return `![${label}](${baseUrl}/github/stars/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "forks":
                    return `![${label}](${baseUrl}/github/forks/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "issues":
                    return `![${label}](${baseUrl}/github/issues/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "license":
                    return `![${label}](${baseUrl}/github/license/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "last-commit":
                    return `![${label}](${baseUrl}/github/last-commit/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "repo-size":
                    return `![${label}](${baseUrl}/github/repo-size/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "languages":
                    return `![${label}](${baseUrl}/github/languages/top/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "contributors":
                    return `![${label}](${baseUrl}/github/contributors/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "pull-requests":
                    return `![${label}](${baseUrl}/github/issues-pr/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "gitbook":
                    return `![${label}](${baseUrl}/static/v1?label=${encodeURIComponent(
                      label
                    )}&message=GitBook&color=3884FF&logo=gitbook&logoColor=white&style=flat-square)`;
                  case "notion":
                    return `![${label}](${baseUrl}/static/v1?label=${encodeURIComponent(
                      label
                    )}&message=Notion&color=000000&logo=notion&logoColor=white&style=flat-square)`;
                  case "confluence":
                    return `![${label}](${baseUrl}/static/v1?label=${encodeURIComponent(
                      label
                    )}&message=Confluence&color=172B4D&logo=confluence&logoColor=white&style=flat-square)`;
                  case "docusaurus":
                    return `![${label}](${baseUrl}/static/v1?label=${encodeURIComponent(
                      label
                    )}&message=Docusaurus&color=2E8555&logo=docusaurus&logoColor=white&style=flat-square)`;
                  case "mkdocs":
                    return `![${label}](${baseUrl}/static/v1?label=${encodeURIComponent(
                      label
                    )}&message=MkDocs&color=000000&logo=markdown&logoColor=white&style=flat-square)`;
                  case "sphinx":
                    return `![${label}](${baseUrl}/static/v1?label=${encodeURIComponent(
                      label
                    )}&message=Sphinx&color=4B8B3B&logo=sphinx&logoColor=white&style=flat-square)`;
                  case "twitter":
                    return `![${label}](${baseUrl}/twitter/follow/${username}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=twitter&logoColor=white)`;
                  case "youtube":
                    return `![${label}](${baseUrl}/youtube/channel/subscribers/${username}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=youtube&logoColor=red)`;
                  case "discord":
                    return `![${label}](${baseUrl}/discord/${username}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=discord&logoColor=white)`;
                  case "twitch":
                    return `![${label}](${baseUrl}/twitch/status/${username}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=twitch&logoColor=white)`;
                  case "instagram":
                    return `![${label}](${baseUrl}/instagram/followers/${username}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=instagram&logoColor=white)`;
                  case "linkedin":
                    return `![${label}](${baseUrl}/linkedin/followers/${username}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=linkedin&logoColor=white)`;
                  case "github-followers":
                    return `![${label}](${baseUrl}/github/followers/${username}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github&logoColor=white)`;
                  case "reddit":
                    return `![${label}](${baseUrl}/reddit/user-karma/${username}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=reddit&logoColor=white)`;
                  case "npm-downloads":
                    return `![${label}](${baseUrl}/npm/dm/${pkg}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=npm&logoColor=white)`;
                  case "npm-version":
                    return `![${label}](${baseUrl}/npm/v/${pkg}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=npm&logoColor=white)`;
                  case "pypi-downloads":
                    return `![${label}](${baseUrl}/pypi/dm/${pkg}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=pypi&logoColor=white)`;
                  case "pypi-version":
                    return `![${label}](${baseUrl}/pypi/v/${pkg}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=pypi&logoColor=white)`;
                  case "codecov":
                    return `![${label}](${baseUrl}/codecov/c/github/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=codecov&logoColor=white)`;
                  case "coveralls":
                    return `![${label}](${baseUrl}/coveralls/github/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=coveralls&logoColor=white)`;
                  case "travis-ci":
                    return `![${label}](${baseUrl}/travis-ci/${username}/${repo}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=travis-ci&logoColor=white)`;
                  case "github-actions":
                    return `![${label}](${baseUrl}/github/workflows/status/${username}/${repo}/main?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=github-actions&logoColor=white)`;
                  case "docker-pulls":
                    return `![${label}](${baseUrl}/docker/pulls/${pkg}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=docker&logoColor=white)`;
                  case "docker-stars":
                    return `![${label}](${baseUrl}/docker/stars/${pkg}?style=flat-square&label=${encodeURIComponent(
                      label
                    )}&logo=docker&logoColor=white)`;

                  default:
                    return "";
                }
              }
            })
            .filter(Boolean)
            .join(" ");

          if (align === "center") {
            return `<div align="center">\n\n${badgesMarkdown}\n\n</div>`;
          } else if (align === "right") {
            return `<div align="right">\n\n${badgesMarkdown}\n\n</div>`;
          }
          return badgesMarkdown;
        }
        case "skill-icons": {
          const icons = block.icons || "js,html,css";
          const align = block.align || "left";
          let url = `https://skillicons.dev/icons?i=${icons}`;
          if (block.theme && block.theme !== "dark") {
            url += `&theme=${block.theme}`;
          }
          if (block.perLine && block.perLine !== "15") {
            url += `&perline=${block.perLine}`;
          }
          const markdown = `![Skill Icons](${url})`;

          if (align === "center") {
            return `<div align="center">\n\n${markdown}\n\n</div>`;
          } else if (align === "right") {
            return `<div align="right">\n\n${markdown}\n\n</div>`;
          }
          return markdown;
        }
        case "typing-svg": {
          const lines = block.lines || ["Hi there! I'm a developer 👋"];
          const font = block.font || "Fira Code";
          const size = block.size || "28";
          const duration = block.duration || "3000";
          const pause = block.pause || "1000";
          const color = block.color || "00FFB3";
          const center = block.center !== false;
          const vCenter = block.vCenter !== false;
          const width = block.width || "900";
          const height = block.height || "80";

          const baseUrl = "https://readme-typing-svg.herokuapp.com";
          const params = new URLSearchParams();

          params.append("font", font);
          params.append("size", size);
          params.append("duration", duration);
          params.append("pause", pause);
          params.append("color", color.replace("#", ""));
          params.append("center", center.toString());
          params.append("vCenter", vCenter.toString());
          params.append("width", width);
          params.append("height", height);

          const filteredLines = lines.filter((line) => line.trim() !== "");
          if (filteredLines.length > 0) {
            params.append("lines", filteredLines.join(";"));
          }

          const typingSvgUrl = `${baseUrl}?${params.toString()}`;
          return `![Typing SVG](${typingSvgUrl})`;
        }
        case "github-profile-cards": {
          const username = block.username || "";
          const cards = block.cards || [];
          const align = block.align || "left";

          if (!username.trim() || cards.length === 0) {
            return "";
          }

          const baseUrl = "http://github-profile-summary-cards.vercel.app/api/cards";

          const cardMarkdown = cards
            .map((card) => {
              let url = `${baseUrl}/${card.cardType}?username=${username}&theme=${card.theme}`;

              if (card.cardType === "productive-time") {
                url += `&utcOffset=${card.utcOffset}`;
              }

              if (card.height || card.width) {
                const attributes = [];
                if (card.height) attributes.push(`height="${card.height}"`);
                if (card.width) attributes.push(`width="${card.width}"`);
                return `<img ${attributes.join(" ")} src="${url}" />`;
              }

              return `![GitHub ${card.cardType}](${url})`;
            })
            .join(" ");

          if (align === "center") {
            return `<div align="center">\n\n  ${cardMarkdown}\n\n</div>`;
          } else if (align === "right") {
            return `<div align="right">\n\n  ${cardMarkdown}\n\n</div>`;
          } else if (align === "left") {
            return `<div align="left">\n\n  ${cardMarkdown}\n\n</div>`;
          }

          return cardMarkdown;
        }
        // eLearning blocks are rendered as React components — return empty string as fallback
        case "learning-objective":
        case "quiz":
        case "knowledge-check":
        case "flashcard":
        case "progress-marker":
        case "course-nav":
        case "branching":
        case "time-requirements":
        case "categorization":
        case "grid":
        case "carousel":
        case "pdf":
        case "fill-in-the-blank":
        case "matching":
        case "hotspot":
          return "";
        default:
          return block.content;
      }
    })
    .join("\n\n");
};

// Animation motion variants for the live Preview
const MOTION_VARIANTS = {
  none: {},
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
};

// eLearning block types that render as interactive React components in preview
const ELEARNING_TYPES = new Set([
  "grid",
  "learning-objective",
  "quiz",
  "knowledge-check",
  "flashcard",
  "progress-marker",
  "course-nav",
  "branching",
  "time-requirements",
  "categorization",
  "carousel",
  "pdf",
  "fill-in-the-blank",
  "matching",
  "hotspot",
]);

const ELEARNING_COMPONENTS = {
  grid: GridBlock,
  "learning-objective": LearningObjectiveBlock,
  quiz: QuizBlock,
  "knowledge-check": KnowledgeCheckBlock,
  flashcard: FlashcardBlock,
  "progress-marker": ProgressMarkerBlock,
  "course-nav": CourseNavBlock,
  branching: BranchingBlock,
  "time-requirements": TimeRequirementsBlock,
  categorization: CategorizationBlock,
  carousel: CarouselBlock,
  pdf: PdfBlock,
  "fill-in-the-blank": FillInTheBlankBlock,
  matching: MatchingBlock,
  hotspot: HotspotBlock,
};

// Render a single block's markdown within an optionally animated wrapper
function AnimatedBlockPreview({ block, mdComponents }) {
  const anim = block.animation || { type: "none" };
  const variant = MOTION_VARIANTS[anim.type] || MOTION_VARIANTS.none;

  // eLearning blocks render their own interactive React components
  if (ELEARNING_TYPES.has(block.type)) {
    const BlockComponent = ELEARNING_COMPONENTS[block.type];
    // Display-only blocks get null so they render in read-only / rendered mode.
    // Interactive blocks (quiz, flashcard, etc.) get a noop so they can track
    // internal state without crashes.
    const DISPLAY_ONLY = new Set(["grid", "carousel", "pdf"]);
    const updateFn = DISPLAY_ONLY.has(block.type) ? null : () => {};
    const content = (
      <div className="my-2">
        <BlockComponent block={block} onUpdate={updateFn} />
      </div>
    );
    if (anim.type === "none" || !variant.initial) return <div>{content}</div>;
    return (
      <motion.div
        initial={variant.initial}
        whileInView={variant.animate}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: anim.duration ?? 0.5, delay: anim.delay ?? 0, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    );
  }

  const blockMd = blocksToMarkdown([block]);

  const content = (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
      <ReactMarkdown
        remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        skipHtml={false}
        components={mdComponents}
      >
        {blockMd}
      </ReactMarkdown>
    </div>
  );

  if (anim.type === "none" || !variant.initial) {
    return <div>{content}</div>;
  }

  return (
    <motion.div
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: anim.duration ?? 0.5,
        delay: anim.delay ?? 0,
        ease: "easeOut",
      }}
    >
      {content}
    </motion.div>
  );
}

// Build a <style> block that injects Google Fonts and CSS custom properties
// for the current course theme.
function buildThemeStyle(theme) {
  if (!theme) return "";
  const fonts = new Set();
  if (theme.headingFont && theme.headingFont !== "Inter") fonts.add(theme.headingFont);
  if (theme.bodyFont && theme.bodyFont !== "Inter") fonts.add(theme.bodyFont);

  const fontImport = fonts.size
    ? `@import url('https://fonts.googleapis.com/css2?${[...fonts]
        .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600;700`)
        .join("&")}&display=swap');`
    : "";

  return `
    ${fontImport}
    .course-preview-root {
      ${theme.bodyFont ? `--preview-body-font: "${theme.bodyFont}", sans-serif;` : ""}
      ${theme.headingFont ? `--preview-heading-font: "${theme.headingFont}", sans-serif;` : ""}
      ${theme.primaryColor ? `--preview-primary: ${theme.primaryColor};` : ""}
      ${theme.accentColor ? `--preview-accent: ${theme.accentColor};` : ""}
      ${theme.bgColor ? `--preview-bg: ${theme.bgColor};` : ""}
    }
    .course-preview-root {
      font-family: var(--preview-body-font, inherit);
      ${theme.bgColor ? "background-color: var(--preview-bg);" : ""}
    }
    .course-preview-root h1,
    .course-preview-root h2,
    .course-preview-root h3,
    .course-preview-root h4,
    .course-preview-root h5,
    .course-preview-root h6 {
      font-family: var(--preview-heading-font, inherit);
      color: var(--preview-primary, inherit);
    }
    .course-preview-root a {
      color: var(--preview-accent, inherit);
    }
  `.trim();
}

const PREVIEW_HIDDEN_BLOCK_TYPES = new Set(["marp-frontmatter", "slide", ...MARP_METADATA_BLOCK_TYPES]);

function buildSlideBackgroundStyle(background) {
  if (!background?.url) return null;

  const position = background.position || "bg";
  let backgroundPosition = "center";
  let backgroundSize = "cover";

  if (position.includes("fit") || position.includes("contain")) {
    backgroundSize = "contain";
  }

  if (position.startsWith("bg left")) {
    backgroundPosition = "left center";
  } else if (position.startsWith("bg right")) {
    backgroundPosition = "right center";
  } else if (position === "bg top") {
    backgroundPosition = "top center";
  } else if (position === "bg bottom") {
    backgroundPosition = "bottom center";
  }

  return {
    backgroundImage: `url(${background.url})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition,
    backgroundSize,
    opacity: background.opacity ? Number(background.opacity) : 1,
  };
}

function SlideBlockPreview({
  slideBlocks,
  slideIndex,
  totalSlides,
  frontmatter,
  contentMaxWidth,
  courseAspectRatio,
  mdComponents,
  theme,
}) {
  const directives = getSlideDirectives(slideBlocks);
  const background = getSlideBackground(slideBlocks);
  const renderableBlocks = getRenderableSlideBlocks(slideBlocks);
  const textColor = directives._color || frontmatter?.color || undefined;
  const backgroundColor =
    directives._backgroundColor || frontmatter?.backgroundColor || theme?.bgColor || "#ffffff";
  const showPageNumber =
    frontmatter?.paginate || directives._paginate === "true" || directives._paginate === "skip";
  const pageNumber = directives._paginate === "skip" ? "" : `${slideIndex + 1}`;
  const backgroundStyle = buildSlideBackgroundStyle(background);
  const slideTitle = getSlideTitle(slideBlocks, slideIndex);

  return (
    <div
      className="course-preview-root relative w-full overflow-hidden rounded-[28px] border border-border/40 bg-background shadow-xl"
      style={{
        aspectRatio: frontmatter?.size === "4:3" ? "4 / 3" : courseAspectRatio,
        backgroundColor,
      }}
    >
      {backgroundStyle && <div className="absolute inset-0" style={backgroundStyle} />}

      <div className="relative z-10 h-full overflow-auto">
        <div
          className="absolute left-6 right-6 top-4 text-xs opacity-70 sm:left-10 sm:right-10"
          style={textColor ? { color: textColor } : undefined}
        >
          {directives._header || frontmatter?.header || slideTitle}
        </div>

        <div
          className="px-6 pb-12 pt-12 sm:px-10 sm:pb-14 sm:pt-14"
          style={textColor ? { color: textColor, "--preview-primary": textColor } : undefined}
        >
          <div className="mx-auto w-full" style={{ maxWidth: `${contentMaxWidth}px` }}>
            {renderableBlocks.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border/40 bg-background/70 px-6 text-center text-sm text-muted-foreground">
                This slide is empty. Add content blocks after the slide break.
              </div>
            ) : (
              renderableBlocks.map((block) => (
                <AnimatedBlockPreview key={block.id} block={block} mdComponents={mdComponents} />
              ))
            )}
          </div>
        </div>

        {(directives._footer || frontmatter?.footer || (showPageNumber && pageNumber)) && (
          <div
            className="absolute bottom-4 left-6 right-6 flex items-center justify-between gap-4 text-xs opacity-70 sm:left-10 sm:right-10"
            style={textColor ? { color: textColor } : undefined}
          >
            <span>{directives._footer || frontmatter?.footer || ""}</span>
            <span className="tabular-nums">{showPageNumber ? pageNumber : ""}</span>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-background/10 to-transparent" />
    </div>
  );
}

export default function Preview({ blocks = [], theme }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const displaySettings = useMemo(() => theme || {}, [theme]);
  const themeStyle = buildThemeStyle(theme);
  const isSlideDeck = useMemo(() => isMarpPresentation(blocks), [blocks]);
  const customCss = useMemo(() => extractCustomCss(blocks), [blocks]);
  const { frontmatter, slideGroups } = useMemo(() => splitBlocksIntoSlides(blocks), [blocks]);
  const courseCanvasSize = useMemo(() => getCourseCanvasSize(displaySettings), [displaySettings]);
  const courseAspectRatio = useMemo(() => getCourseAspectRatio(displaySettings), [displaySettings]);
  const contentMaxWidth = useMemo(() => getCourseContentMaxWidth(displaySettings), [displaySettings]);
  const previewBlocks = useMemo(
    () => blocks.filter((block) => !PREVIEW_HIDDEN_BLOCK_TYPES.has(block.type)),
    [blocks]
  );

  useEffect(() => {
    if (!slideGroups.length) {
      setActiveSlide(0);
      return;
    }

    if (activeSlide >= slideGroups.length) {
      setActiveSlide(slideGroups.length - 1);
    }
  }, [activeSlide, slideGroups.length]);

  // Shared markdown component overrides — defined once, passed to each per-block renderer
  const mdComponents = {
    h1: ({ ...props }) => (
      <h1 className="text-3xl font-semibold mt-6 mb-4 pb-2 border-b border-border" {...props} />
    ),
    h2: ({ ...props }) => (
      <h2 className="text-2xl font-semibold mt-6 mb-4 pb-2 border-b border-border" {...props} />
    ),
    h3: ({ ...props }) => <h3 className="text-xl font-semibold mt-6 mb-2" {...props} />,
    h4: ({ ...props }) => <h4 className="text-lg font-semibold mt-6 mb-2" {...props} />,
    h5: ({ ...props }) => <h5 className="text-base font-semibold mt-6 mb-2" {...props} />,
    h6: ({ ...props }) => (
      <h6 className="text-sm font-semibold mt-6 mb-2 text-muted-foreground" {...props} />
    ),
    p: ({ ...props }) => <p className="text-base leading-7 mb-4" {...props} />,
    ul: ({ ...props }) => <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />,
    li: ({ ...props }) => <li className="text-base" {...props} />,
    strong: ({ ...props }) => <strong className="font-bold" {...props} />,
    em: ({ ...props }) => <em className="italic" {...props} />,
    del: ({ ...props }) => <del className="line-through" {...props} />,
    a: ({ href, ...props }) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:underline inline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    br: () => <br className="my-2" />,
    code: ({ inline, className, children, ...props }) => {
      if (className?.includes("language-math")) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return inline ? (
        <code
          className="bg-muted px-1.5 py-0 rounded text-sm font-mono align-text-bottom inline-block"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className={`block bg-transparent p-0 text-sm font-mono whitespace-pre-wrap ${className || ""}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => {
      let lang = "";
      const child = Array.isArray(children) ? children[0] : children;
      lang = child?.props?.className?.match(/language-([a-z0-9+#]+)/i)?.[1] || "";

      if (lang === "math") {
        return (
          <div className="my-6 overflow-x-auto">
            <pre className="text-center" {...props}>
              {children}
            </pre>
          </div>
        );
      }

      if (lang === "mermaid") {
        let code = "";
        if (typeof child?.props?.children === "string") {
          code = child.props.children;
        } else if (Array.isArray(child?.props?.children)) {
          code = child.props.children[0] || "";
        }
        if (code && typeof code === "string" && code.trim()) {
          return <MermaidDiagram chart={code.trim()} />;
        }
        return null;
      }

      const labelMap = {
        js: "JS",
        javascript: "JS",
        ts: "TS",
        typescript: "TS",
        html: "HTML5",
        css: "CSS",
      };
      const label = labelMap[lang?.toLowerCase?.()] || (lang ? lang.toUpperCase() : "");
      const colorMap = {
        js: "bg-yellow-400 text-black",
        javascript: "bg-yellow-400 text-black",
        html: "bg-orange-500 text-white",
        css: "bg-blue-500 text-white",
        ts: "bg-blue-600 text-white",
        typescript: "bg-blue-600 text-white",
      };
      const color = colorMap[lang?.toLowerCase?.()] || "bg-muted text-muted-foreground";
      return (
        <div className="relative my-4">
          {label ? (
            <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded ${color}`}>
              {label}
            </span>
          ) : null}
          <pre
            className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap"
            {...props}
          >
            {children}
          </pre>
        </div>
      );
    },
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-border pl-4 my-4 text-muted-foreground" {...props} />
    ),
    hr: ({ ...props }) => <hr className="my-8 border-border border-t-4" {...props} />,
    img: ({ src, alt, ...props }) => {
      if (!src) return null;
      return (
        <img
          src={src}
          alt={alt || ""}
          className="max-w-full h-auto rounded my-4 mx-auto block"
          {...props}
        />
      );
    },
    video: ({ src, ...props }) => {
      if (!src) return null;
      return (
        <div className="my-4">
          <video src={src} controls className="max-w-full h-auto rounded" {...props} />
        </div>
      );
    },
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="border-collapse border border-border" {...props} />
      </div>
    ),
    thead: ({ ...props }) => <thead className="bg-muted" {...props} />,
    tbody: ({ ...props }) => <tbody {...props} />,
    tr: ({ ...props }) => <tr className="border-b border-border" {...props} />,
    th: ({ ...props }) => (
      <th className="border border-border px-4 py-2 text-left font-semibold" {...props} />
    ),
    td: ({ ...props }) => <td className="border border-border px-4 py-2" {...props} />,
    div: ({ className, children, ...props }) => {
      if (className?.includes("alert")) {
        const alertType = props["data-alert-type"] || "NOTE";
        const alertTypeClass =
          className
            .split(" ")
            .find((c) => c.startsWith("alert-"))
            ?.replace("alert-", "") || "note";

        const alertConfig = {
          note: { icon: Info, borderColor: "border-blue-500", iconColor: "text-blue-500" },
          tip: { icon: Lightbulb, borderColor: "border-green-500", iconColor: "text-green-500" },
          important: {
            icon: AlertCircle,
            borderColor: "border-purple-500",
            iconColor: "text-purple-500",
          },
          warning: {
            icon: AlertTriangle,
            borderColor: "border-yellow-500",
            iconColor: "text-yellow-600 dark:text-yellow-500",
          },
          caution: {
            icon: OctagonAlert,
            borderColor: "border-red-500",
            iconColor: "text-red-500",
          },
          success: {
            icon: BadgeCheck,
            borderColor: "border-emerald-500",
            iconColor: "text-emerald-600 dark:text-emerald-400",
          },
        };

        const config = alertConfig[alertTypeClass] || alertConfig.note;
        const Icon = config.icon;

        return (
          <div className={`border-l-4 p-4 my-4 ${config.borderColor}`} {...props}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
              <span className={`font-semibold text-sm ${config.iconColor}`}>{alertType}</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-0 [&>p]:leading-normal">
              {children}
            </div>
          </div>
        );
      }
      return (
        <div className={className} {...props}>
          {children}
        </div>
      );
    },
  };

  const frameStyle = {
    width: "100%",
    maxWidth: `${Math.min(courseCanvasSize.width, 1600)}px`,
    aspectRatio: courseAspectRatio,
  };

  return (
    <div className="flex h-full w-full flex-col rounded-lg transition-colors relative">
      {themeStyle && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: themeStyle }}
        />
      )}
      {customCss && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: customCss }}
        />
      )}
      {blocks.length === 0 ? (
        <div className="absolute inset-4 flex items-center justify-center border-2 border-dashed rounded-lg border-muted-foreground/20">
          <p className="text-center text-sm text-muted-foreground px-4">
            No content to preview yet. Add some blocks in the editor!
          </p>
        </div>
      ) : (
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b bg-muted/10 px-4 py-2 text-xs text-muted-foreground">
            <span>{getCourseCanvasLabel(displaySettings)}</span>
            {isSlideDeck && slideGroups.length > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setActiveSlide((currentSlide) => Math.max(0, currentSlide - 1))}
                  disabled={activeSlide === 0}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[88px] text-center font-medium tabular-nums">
                  {activeSlide + 1} / {slideGroups.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    setActiveSlide((currentSlide) =>
                      Math.min(slideGroups.length - 1, currentSlide + 1)
                    )
                  }
                  disabled={activeSlide >= slideGroups.length - 1}
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>

          <div className="h-full overflow-auto bg-muted/5 p-4">
            <div className="flex min-h-full items-start justify-center">
              {isSlideDeck ? (
                slideGroups.length > 0 ? (
                  <div style={frameStyle}>
                    <SlideBlockPreview
                      slideBlocks={slideGroups[activeSlide] || []}
                      slideIndex={activeSlide}
                      totalSlides={slideGroups.length}
                      frontmatter={frontmatter}
                      contentMaxWidth={Math.min(contentMaxWidth, courseCanvasSize.width - 96)}
                      courseAspectRatio={frontmatter?.size === "4:3" ? "4 / 3" : courseAspectRatio}
                      mdComponents={mdComponents}
                      theme={theme}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[320px] w-full max-w-3xl items-center justify-center rounded-[28px] border border-dashed border-muted-foreground/20 bg-background px-6 text-center text-sm text-muted-foreground">
                    Add content blocks after the MARP Frontmatter or insert Slide Break blocks to build the deck preview.
                  </div>
                )
              ) : previewBlocks.length > 0 ? (
                <div
                  className="course-preview-root w-full overflow-hidden rounded-[28px] border border-border/40 bg-background shadow-xl"
                  style={frameStyle}
                >
                  <div className="h-full overflow-auto px-4 py-5 sm:px-8 sm:py-6">
                    <div className="mx-auto w-full" style={{ maxWidth: `${contentMaxWidth}px` }}>
                      {previewBlocks.map((block) => (
                        <AnimatedBlockPreview key={block.id} block={block} mdComponents={mdComponents} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[320px] w-full max-w-3xl items-center justify-center rounded-[28px] border border-dashed border-muted-foreground/20 bg-background px-6 text-center text-sm text-muted-foreground">
                  No renderable preview content yet. Add blocks below the course settings or slide metadata.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
