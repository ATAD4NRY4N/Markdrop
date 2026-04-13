import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import {
  extractCustomCss,
  getSlideBackground,
  getSlideDirectives,
  slideBlocksToMarkdown,
  splitBlocksIntoSlides,
} from "@/lib/marp";

const MarpPreview = forwardRef(function MarpPreview(
  { blocks = [], controlledSlide = null },
  ref
) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef(null);

  // Expose the slide container element and goTo helper via ref for video export
  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    goTo: (n) => setCurrentSlide(Math.max(0, Math.min(slideGroups.length - 1, n))),
    get totalSlides() { return slideGroups.length; },
  }));

  const { frontmatter, slideGroups } = useMemo(() => splitBlocksIntoSlides(blocks), [blocks]);

  const customCss = useMemo(() => extractCustomCss(blocks), [blocks]);

  const totalSlides = slideGroups.length;

  const isWidescreen = !frontmatter || !frontmatter.size || frontmatter.size === "16:9";
  const aspectRatio = isWidescreen ? "16 / 9" : "4 / 3";

  const globalBg = frontmatter?.backgroundColor || "";
  const globalColor = frontmatter?.color || "";

  // When controlledSlide is provided (video export driving the preview), use it
  const activeSlide = controlledSlide !== null ? controlledSlide : currentSlide;

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
    // Keyboard navigation only applies when not externally controlled
    if (controlledSlide !== null) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(currentSlide + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(currentSlide - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSlide, goTo, controlledSlide]);

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

  const slideBlocks = slideGroups[activeSlide] || [];
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
            onClick={() => goTo(activeSlide - 1)}
            disabled={activeSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {activeSlide + 1} / {totalSlides}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goTo(activeSlide + 1)}
            disabled={activeSlide === totalSlides - 1}
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
                {directives._paginate === "skip" ? "" : activeSlide + 1}
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
                idx === activeSlide
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
});

export default MarpPreview;

export { splitBlocksIntoSlides, slideBlocksToMarkdown, extractCustomCss };
