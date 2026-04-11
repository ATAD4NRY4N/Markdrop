import { ChevronLeft, ChevronRight, GraduationCap, MessageSquare, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ReviewPanel from "@/components/review/ReviewPanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getUserCourseRole } from "@/lib/reviewStorage";
import { buildPreviewHtml } from "@/lib/scormUtils";
import { getCourseById, getCourseModules } from "@/lib/storage";

export default function ReviewerView() {
  const { courseId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [role, setRole] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReview, setShowReview] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?next=/review/${courseId}`);
      return;
    }

    const init = async () => {
      try {
        const [courseData, modulesData, userRole] = await Promise.all([
          getCourseById(courseId),
          getCourseModules(courseId),
          getUserCourseRole(courseId, user.id),
        ]);

        if (!userRole) {
          toast.error("You don't have access to this course");
          navigate("/courses");
          return;
        }

        setCourse(courseData);
        setModules(modulesData);
        setRole(userRole);
      } catch {
        toast.error("Course not found");
        navigate("/courses");
      } finally {
        setDataLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, courseId]);

  const theme = (() => {
    try {
      return JSON.parse(course?.theme_json || "{}");
    } catch {
      return {};
    }
  })();

  const loadModule = useCallback(
    (index) => {
      if (!iframeRef.current || !modules[index]) return;
      const html = buildPreviewHtml(modules[index], course?.title, theme);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    [modules, course, theme]
  );

  useEffect(() => {
    if (!dataLoading && modules.length) {
      const t = setTimeout(() => loadModule(activeIndex), 100);
      return () => clearTimeout(t);
    }
  }, [dataLoading, loadModule, activeIndex, modules.length]);

  const goTo = (i) => {
    const clamped = Math.max(0, Math.min(modules.length - 1, i));
    setActiveIndex(clamped);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2 text-muted-foreground">
          <GraduationCap className="h-8 w-8 mx-auto animate-pulse" />
          <p className="text-sm">Loading course…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <header className="flex items-center gap-3 px-4 h-14 border-b shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{course?.title}</span>
          {role && role !== "owner" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-medium capitalize shrink-0">
              {role}
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            title="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums min-w-[60px] text-center">
            {activeIndex + 1} / {modules.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex >= modules.length - 1}
            title="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => loadModule(activeIndex)}
            title="Reload preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant={showReview ? "default" : "outline"}
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setShowReview((v) => !v)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Comments</span>
        </Button>
      </header>

      {/* Module tab strip */}
      {modules.length > 1 && (
        <div className="flex gap-1 overflow-x-auto px-4 py-2 border-b shrink-0">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => goTo(i)}
              className={`shrink-0 px-3 py-1 rounded text-xs transition-colors ${
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

      {/* Learner preview iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          title="Course Preview"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
        />
      </div>

      {/* Review panel (Sheet) */}
      <ReviewPanel
        open={showReview}
        onOpenChange={setShowReview}
        courseId={courseId}
        modules={modules}
        isOwner={role === "owner"}
      />
    </div>
  );
}
