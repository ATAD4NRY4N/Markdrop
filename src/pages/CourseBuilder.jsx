import { BookOpen, Download, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CourseProvider, useCourse } from "@/context/CourseContext";
import { downloadScormPackage } from "@/lib/scormUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

function CourseList() {
  const navigate = useNavigate();
  const { courses, loading, fetchCourses, createCourse, deleteCourse } = useCourse();
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    const course = await createCourse(newTitle.trim());
    setCreating(false);
    if (course) {
      setNewTitle("");
      toast.success("Course created");
      navigate(`/course/${course.id}`);
    } else {
      toast.error("Failed to create course. Check Supabase config.");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const ok = await deleteCourse(id);
    if (ok) toast.success("Course deleted");
    else toast.error("Failed to delete course");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Course Builder</h1>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <Input
          placeholder="New course title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={creating || !newTitle.trim()}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="ml-1">Create</span>
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No courses yet. Create one above!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <button
                className="flex-1 text-left font-medium hover:text-primary transition-colors"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                {course.title}
                {course.description && (
                  <p className="text-sm text-muted-foreground font-normal mt-0.5 truncate">
                    {course.description}
                  </p>
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive ml-2"
                onClick={() => handleDelete(course.id, course.title)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseEditor({ courseId }) {
  const navigate = useNavigate();
  const {
    currentCourse,
    modules,
    loading,
    fetchCourse,
    fetchModules,
    updateCourse,
    createModule,
    updateModule,
    deleteModule,
  } = useCourse();

  const [activeModuleId, setActiveModuleId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [newModTitle, setNewModTitle] = useState("");
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourse(courseId);
    fetchModules(courseId);
  }, [courseId, fetchCourse, fetchModules]);

  useEffect(() => {
    if (currentCourse) {
      setCourseTitle(currentCourse.title || "");
      setCourseDesc(currentCourse.description || "");
    }
  }, [currentCourse]);

  useEffect(() => {
    if (modules.length > 0 && !activeModuleId) {
      setActiveModuleId(modules[0].id);
    }
  }, [modules, activeModuleId]);

  const activeModule = modules.find((m) => m.id === activeModuleId);

  const handleSaveCourse = async () => {
    setSaving(true);
    const ok = await updateCourse(courseId, { title: courseTitle, description: courseDesc });
    setSaving(false);
    if (ok) toast.success("Course saved");
    else toast.error("Save failed");
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModTitle.trim()) return;
    const mod = await createModule(courseId, newModTitle.trim());
    if (mod) {
      setNewModTitle("");
      setActiveModuleId(mod.id);
      toast.success("Module added");
    } else {
      toast.error("Failed to add module");
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Delete this module?")) return;
    const ok = await deleteModule(id);
    if (!ok) { toast.error("Failed to delete module"); return; }
    if (activeModuleId === id) {
      const remaining = modules.filter((m) => m.id !== id);
      setActiveModuleId(remaining[0]?.id || null);
    }
    toast.success("Module deleted");
  };

  const handleModuleContentChange = async (value) => {
    if (!activeModuleId) return;
    await updateModule(activeModuleId, { content: value });
  };

  const handleExportScorm = async () => {
    if (!currentCourse) return;
    setExporting(true);
    try {
      const courseData = {
        ...currentCourse,
        modules: modules.map((m, i) => ({
          id: m.id,
          title: m.title,
          content: typeof m.content === "string" ? m.content : JSON.stringify(m.content || []),
          order: m.order_index ?? i,
        })),
      };
      await downloadScormPackage(courseData);
      toast.success("SCORM package downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading && !currentCourse) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/course")}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Courses
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-sm truncate max-w-48">{currentCourse?.title || "…"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportScorm}
            disabled={exporting || modules.length === 0}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Export SCORM
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: course meta + module list */}
        <div className="w-64 shrink-0 border-r border-border flex flex-col overflow-hidden">
          <div className="p-4 space-y-3 border-b border-border">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                className="text-sm min-h-[60px] resize-none"
              />
            </div>
            <Button size="sm" className="w-full" onClick={handleSaveCourse} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Save Course
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Modules</p>
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  className={`group flex items-center justify-between rounded px-2 py-1.5 cursor-pointer text-sm transition-colors ${
                    activeModuleId === mod.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => setActiveModuleId(mod.id)}
                >
                  <span className="truncate flex-1">{mod.title}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-destructive ml-1 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModule(mod.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Separator className="my-2" />
              <form onSubmit={handleAddModule} className="flex gap-1">
                <Input
                  placeholder="Module title..."
                  value={newModTitle}
                  onChange={(e) => setNewModTitle(e.target.value)}
                  className="h-7 text-xs flex-1"
                />
                <Button type="submit" size="icon" className="h-7 w-7" disabled={!newModTitle.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main content: module editor */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeModule ? (
            <>
              <div className="px-4 py-2 border-b border-border flex items-center gap-2">
                <span className="font-medium text-sm">{activeModule.title}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Textarea
                  value={
                    typeof activeModule.content === "string"
                      ? activeModule.content
                      : JSON.stringify(activeModule.content || [], null, 2)
                  }
                  onChange={(e) => handleModuleContentChange(e.target.value)}
                  placeholder="Write your module content in Markdown..."
                  className="w-full min-h-[400px] resize-y font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Markdown content. This will be included in the SCORM export.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Select or create a module to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseBuilderInner() {
  const { id } = useParams();
  return id ? <CourseEditor courseId={id} /> : <CourseList />;
}

export default function CourseBuilder() {
  return (
    <CourseProvider>
      <CourseBuilderInner />
    </CourseProvider>
  );
}
