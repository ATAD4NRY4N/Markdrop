import { ChevronLeft, ChevronRight, Maximize2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildPreviewHtml } from "@/lib/scormUtils";

export default function CoursePreview({ open, onOpenChange, course, modules, theme }) {
  const iframeRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const goTo = (i) => {
    if (!modules) return;
    const clamped = Math.max(0, Math.min(modules.length - 1, i));
    setActiveIndex(clamped);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
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

        <div className="flex-1 overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Course Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
