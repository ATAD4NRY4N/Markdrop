import { ChevronLeft, ChevronRight, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  getCourseCanvasSize,
  getLearnerDeviceLabel,
  getLearnerDeviceSize,
  getPreviewFitScale,
} from "@/lib/courseDisplay";
import { buildPreviewHtml } from "@/lib/scormUtils";

export default function CoursePreview({ open, onOpenChange, course, modules, theme }) {
  const iframeRef = useRef(null);
  const viewportRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [devicePreset, setDevicePreset] = useState("desktop");

  const frameSize = useMemo(
    () => getLearnerDeviceSize(devicePreset, theme || {}),
    [devicePreset, theme]
  );
  const canvasSize = useMemo(() => getCourseCanvasSize(theme || {}), [theme]);
  const [viewportSize, setViewportSize] = useState(frameSize);
  const dialogWidth = useMemo(() => {
    const chromePadding = devicePreset === "desktop" ? 104 : 72;
    return `${frameSize.width + chromePadding}px`;
  }, [devicePreset, frameSize.width]);
  const previewScale = useMemo(
    () => getPreviewFitScale(viewportSize, canvasSize),
    [viewportSize, canvasSize]
  );

  const loadModule = useCallback(
    (index) => {
      if (!iframeRef.current || !modules || !modules[index]) return;
      const html = buildPreviewHtml(modules[index], course?.title, theme);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      // Revoke after a tick
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    [modules, course, theme]
  );

  useEffect(() => {
    if (open && modules?.length) {
      setActiveIndex(0);
      // Wait for dialog to render before loading
      const t = setTimeout(() => loadModule(0), 100);
      return () => clearTimeout(t);
    }
  }, [open, loadModule, modules]);

  useEffect(() => {
    if (open) loadModule(activeIndex);
  }, [activeIndex, open, loadModule]);

  useEffect(() => {
    setViewportSize({ width: frameSize.width, height: frameSize.height });
  }, [frameSize.width, frameSize.height]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setViewportSize({ width, height });
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [frameSize.width, frameSize.height]);

  const goTo = (i) => {
    if (!modules) return;
    const clamped = Math.max(0, Math.min(modules.length - 1, i));
    setActiveIndex(clamped);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-none"
        style={{ width: dialogWidth, maxWidth: "calc(100vw - 2rem)" }}
      >
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-sm">
                Learner Preview — {course?.title || "Course"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Simulates the learner experience. SCORM API calls are suppressed.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={devicePreset}
                onValueChange={(value) => value && setDevicePreset(value)}
                variant="outline"
                size="sm"
                className="hidden md:flex"
              >
                <ToggleGroupItem value="desktop" aria-label="Desktop preview" className="gap-1.5 px-2">
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="text-xs">Web</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="tablet" aria-label="Tablet preview" className="gap-1.5 px-2">
                  <Tablet className="h-3.5 w-3.5" />
                  <span className="text-xs">Tablet</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="mobile-16-9"
                  aria-label="Mobile 16:9 preview"
                  className="gap-1.5 px-2"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="text-xs">16:9</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="mobile-9-16"
                  aria-label="Mobile 9:16 preview"
                  className="gap-1.5 px-2"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="text-xs">9:16</span>
                </ToggleGroupItem>
              </ToggleGroup>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => goTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                title="Previous module"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums min-w-[60px] text-center">
                {activeIndex + 1} / {modules?.length ?? 0}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => goTo(activeIndex + 1)}
                disabled={!modules || activeIndex >= modules.length - 1}
                title="Next module"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => loadModule(activeIndex)}
                title="Reload"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Module tab strip */}
          {modules && modules.length > 1 && (
            <div className="flex gap-1 overflow-x-auto mt-2 pb-0.5">
              {modules.map((mod, i) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`shrink-0 px-2.5 py-1 rounded text-xs transition-colors ${
                    i === activeIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {mod.title || `Module ${i + 1}`}
                </button>
              ))}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/5 p-4">
          <div className="flex min-h-full items-start justify-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {getLearnerDeviceLabel(devicePreset)} {" "}
                · {frameSize.width} x {frameSize.height}
              </p>
              <div
                ref={viewportRef}
                className="overflow-hidden rounded-[28px] border border-border/50 bg-background shadow-xl"
                style={{
                  width: `${frameSize.width}px`,
                  maxWidth: "100%",
                  minWidth: `${Math.min(frameSize.width, 280)}px`,
                  aspectRatio: `${frameSize.width} / ${frameSize.height}`,
                  position: "relative",
                }}
              >
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    transform: `translate(-50%, -50%) scale(${previewScale})`,
                    transformOrigin: "center center",
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    title="Course Preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="border-0 bg-background"
                    style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
