import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import { blocksToMarpMarkdown } from "@/lib/exportUtils";

/**
 * Split blocks into slides.
 * Each `slide` block acts as a slide separator.
 * Blocks before the first separator are slide 1.
 * The `marp-frontmatter` block is extracted separately for settings.
 */
function splitBlocksIntoSlides(blocks) {
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
}

/**
 * Convert a list of blocks (within one slide) to markdown string.
 */
function slideBlocksToMarkdown(blocks) {
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
          return block.content;
        case "blockquote":
          return `> ${block.content}`;
        case "code":
          return block.content;
        case "ul":
          return block.content;
        case "ol":
          return block.content;
        case "task-list":
          return block.content;
        case "separator":
          // horizontal rule within a slide (not a slide break)
          return "---";
        case "image": {
          if (block.width || block.height) {
            const attrs = [`src="${block.content}"`];
            if (block.alt) attrs.push(`alt="${block.alt}"`);
            if (block.width) attrs.push(`width="${block.width}"`);
            if (block.height) attrs.push(`height="${block.height}"`);
            return `<img ${attrs.join(" ")} />`;
          }
          return `![${block.alt || ""}](${block.content})`;
        }
        case "link":
          return `[${block.content}](${block.url || ""})`;
        case "table":
          return block.content;
        case "math":
          return block.content;
        case "marp-slide-directive": {
          const directives = block.directives || [];
          return directives
            .filter((d) => d.key && d.value)
            .map((d) => `<!-- ${d.key}: ${d.value} -->`)
            .join("\n");
        }
        case "marp-bg-image": {
          if (!block.content) return "";
          let alt = block.position || "bg";
          if (block.opacity) alt += ` opacity:${block.opacity}`;
          return `![${alt}](${block.content})`;
        }
        case "marp-style": {
          return ""; // CSS handled separately
        }
        default:
          return block.content || "";
      }
    })
    .filter((s) => s !== "")
    .join("\n\n");
}

/**
 * Extract custom CSS from marp-style blocks.
 */
function extractCustomCss(blocks) {
  return blocks
    .filter((b) => b.type === "marp-style" && b.content)
    .map((b) => b.content)
    .join("\n");
}

/**
 * Get slide background image from marp-bg-image blocks in a slide.
 */
function getSlideBackground(slideBlocks) {
  const bgBlock = slideBlocks.find((b) => b.type === "marp-bg-image" && b.content);
  if (!bgBlock) return null;
  return { url: bgBlock.content, position: bgBlock.position || "bg", opacity: bgBlock.opacity };
}

/**
 * Get per-slide directives (e.g. _class, _backgroundColor, _color).
 */
function getSlideDirectives(slideBlocks) {
  const directives = {};
  for (const block of slideBlocks) {
    if (block.type === "marp-slide-directive") {
      for (const d of block.directives || []) {
        if (d.key && d.value) {
          // Strip leading underscore for use as a style/class identifier
          directives[d.key] = d.value;
        }
      }
    }
  }
  return directives;
}

export default function MarpPreview({ blocks = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef(null);

  const { frontmatter, slideGroups } = useMemo(() => splitBlocksIntoSlides(blocks), [blocks]);

  const customCss = useMemo(() => extractCustomCss(blocks), [blocks]);

  const totalSlides = slideGroups.length;

  const isWidescreen = !frontmatter || !frontmatter.size || frontmatter.size === "16:9";
  const aspectRatio = isWidescreen ? "16 / 9" : "4 / 3";

  const globalBg = frontmatter?.backgroundColor || "";
  const globalColor = frontmatter?.color || "";

  // Keep currentSlide in range when blocks change
  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(totalSlides - 1);
    }
  }, [totalSlides, currentSlide]);

  const goTo = useCallback(
    (n) => setCurrentSlide(Math.max(0, Math.min(totalSlides - 1, n))),
    [totalSlides]
  );

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(currentSlide + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(currentSlide - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSlide, goTo]);

  if (blocks.length === 0) {
    return (
      <div className="absolute inset-4 flex items-center justify-center border-2 border-dashed rounded-lg border-muted-foreground/20">
        <p className="text-center text-sm text-muted-foreground px-4">
          No slides yet. Add a MARP Frontmatter block and some content to get started.
        </p>
      </div>
    );
  }

  if (totalSlides === 0) {
    return (
      <div className="absolute inset-4 flex items-center justify-center border-2 border-dashed rounded-lg border-muted-foreground/20">
        <p className="text-center text-sm text-muted-foreground px-4">
          Add content blocks below the MARP Frontmatter to create slides.
        </p>
      </div>
    );
  }

  const slideBlocks = slideGroups[currentSlide] || [];
  const slideMarkdown = slideBlocksToMarkdown(slideBlocks);
  const bg = getSlideBackground(slideBlocks);
  const directives = getSlideDirectives(slideBlocks);

  const slideStyle = {
    aspectRatio,
    backgroundColor: directives._backgroundColor || globalBg || "white",
    color: directives._color || globalColor || "#1a1a1a",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div className="w-full h-full flex flex-col" ref={containerRef}>
      {/* Slide navigation header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/10 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goTo(currentSlide - 1)}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {currentSlide + 1} / {totalSlides}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goTo(currentSlide + 1)}
            disabled={currentSlide === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {frontmatter && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-mono">
            <span>theme: {frontmatter.theme || "default"}</span>
            <span>·</span>
            <span>{frontmatter.size || "16:9"}</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Open in fullscreen (export to HTML for best experience)"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Slide preview area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/5">
        {/* Inject custom CSS scoped to the slide */}
        {customCss && (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: CSS injection intentional for MARP preview
          <style dangerouslySetInnerHTML={{ __html: customCss }} />
        )}

        <div
          className="w-full max-w-3xl shadow-xl rounded-sm overflow-hidden border border-border/30"
          style={slideStyle}
        >
          {/* Background image layer */}
          {bg && bg.url && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${bg.url})`,
                backgroundSize:
                  bg.position === "bg fit" || bg.position === "bg contain" ? "contain" : "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition:
                  bg.position === "bg left" || bg.position?.startsWith("bg left")
                    ? "left center"
                    : bg.position === "bg right" || bg.position?.startsWith("bg right")
                      ? "right center"
                      : bg.position === "bg top"
                        ? "top center"
                        : bg.position === "bg bottom"
                          ? "bottom center"
                          : "center",
                opacity: bg.opacity ? Number(bg.opacity) : 1,
              }}
            />
          )}

          {/* Slide content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-14 py-10">
            {/* Header */}
            {(directives._header || frontmatter?.header) && (
              <div
                className="absolute top-4 left-14 right-14 text-xs opacity-70"
                style={{ color: directives._color || globalColor || undefined }}
              >
                {directives._header || frontmatter.header}
              </div>
            )}

            {/* Markdown content */}
            <div
              className="prose max-w-none leading-relaxed"
              style={{ color: directives._color || globalColor || undefined }}
            >
              <ReactMarkdown
                remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                skipHtml={false}
              >
                {slideMarkdown}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            {(directives._footer || frontmatter?.footer) && (
              <div
                className="absolute bottom-4 left-14 right-14 text-xs opacity-70"
                style={{ color: directives._color || globalColor || undefined }}
              >
                {directives._footer || frontmatter.footer}
              </div>
            )}

            {/* Page number */}
            {(frontmatter?.paginate ||
              directives._paginate === "true" ||
              directives._paginate === "skip") && (
              <div
                className="absolute bottom-4 right-6 text-xs opacity-50 tabular-nums"
                style={{ color: directives._color || globalColor || undefined }}
              >
                {directives._paginate === "skip" ? "" : currentSlide + 1}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide strip / thumbnails */}
      {totalSlides > 1 && (
        <div className="shrink-0 border-t bg-muted/5 px-4 py-2 flex gap-2 overflow-x-auto">
          {slideGroups.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              className={`shrink-0 w-16 h-10 rounded border text-[9px] font-medium transition-all ${
                idx === currentSlide
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/40"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Re-export for use in export utilities
export { splitBlocksIntoSlides, slideBlocksToMarkdown, extractCustomCss };
