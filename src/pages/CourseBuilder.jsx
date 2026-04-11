import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  BookOpen,
  CheckSquare,
  Clipboard,
  Eye,
  FileDown,
  GitBranch,
  Globe,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Moon,
  Package,
  Pencil,
  FileText,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
  Target,
  Type,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AppSidebar from "@/components/blocks/BuilderPage/AppSidebar";
import Editor from "@/components/blocks/BuilderPage/Editor";
import Preview from "@/components/blocks/BuilderPage/Preview";
import Raw from "@/components/blocks/BuilderPage/Raw";
import AdaptivePanel from "@/components/blocks/CourseBuilderPage/AdaptivePanel";
import CollaboratorsDialog from "@/components/blocks/CourseBuilderPage/CollaboratorsDialog";
import CoursePreview from "@/components/blocks/CourseBuilderPage/CoursePreview";
import CourseStructurePanel from "@/components/blocks/CourseBuilderPage/CourseStructurePanel";
import ScormExportDialog from "@/components/blocks/CourseBuilderPage/ScormExportDialog";
import XliffDialog from "@/components/blocks/CourseBuilderPage/XliffDialog";
import ReviewPanel from "@/components/review/ReviewPanel";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { CourseProvider, useCourse } from "@/context/CourseContext";
import {
  copyBlocksToClipboard,
  getClipboardCount,
  pasteBlocksFromClipboard,
  setInAppClipboard,
} from "@/lib/clipboard";

// ---------------------------------------------------------------------------
// Inner component (needs CourseProvider above it)
// ---------------------------------------------------------------------------
function CourseBuilderInner() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    course,
    modules,
    activeModuleId,
    isSaving,
    loadCourse,
    initNewCourse,
    saveCourse,
    saveActiveModuleBlocks,
    getActiveModuleBlocks,
    setActiveModuleBlocksLocal,
  } = useCourse();

  const [activeTab, setActiveTab] = useState("editor");
  const [blocks, setBlocks] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [showScormDialog, setShowScormDialog] = useState(false);
  const [showXliffDialog, setShowXliffDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [showAdaptivePanel, setShowAdaptivePanel] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Per-course theme (persisted in course.theme_json)
  const DEFAULT_THEME = {
    headingFont: "Inter",
    bodyFont: "Inter",
    primaryColor: "#7c3aed",
    accentColor: "#06b6d4",
    bgColor: "",
  };
  const [courseTheme, setCourseTheme] = useState(DEFAULT_THEME);

  // Reactive clipboard count — updated whenever the user copies something so
  // the toolbar badge and paste-after buttons re-render appropriately.
  const [clipboardCount, setClipboardCount] = useState(0);

  // Sync local blocks from active module whenever activeModuleId changes
  useEffect(() => {
    const loaded = getActiveModuleBlocks();
    setBlocks(loaded);
    setHistory([loaded]);
    setHistoryIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleId]);

  // Also sync when blocks_json of the active module changes externally
  // (e.g. paste-into-module triggered from the sidebar for the active module)
  const activeModuleBlocksJson = modules.find((m) => m.id === activeModuleId)?.blocks_json;
  useEffect(() => {
    if (!activeModuleId) return;
    try {
      const loaded = JSON.parse(activeModuleBlocksJson || "[]");
      setBlocks(loaded);
    } catch {
      setBlocks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleBlocksJson]);

  // Sync course title/description to local state
  useEffect(() => {
    if (course) {
      setCourseTitle(course.title || "");
      setCourseDescription(course.description || "");
      try {
        const parsed = JSON.parse(course.theme_json || "{}");
        setCourseTheme({ ...DEFAULT_THEME, ...parsed });
      } catch {
        setCourseTheme(DEFAULT_THEME);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

  // Initialize on mount
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const init = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      if (id) {
        try {
          await loadCourse(id);
          toast.success("Course loaded");
        } catch {
          toast.error("Course not found");
          navigate("/course");
        }
      } else {
        await initNewCourse(user.id);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const saveToHistory = useCallback(
    (newBlocks) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newBlocks);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setBlocks(prev);
      setActiveModuleBlocksLocal(prev);
    }
  }, [historyIndex, history, setActiveModuleBlocksLocal]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setBlocks(next);
      setActiveModuleBlocksLocal(next);
    }
  }, [historyIndex, history, setActiveModuleBlocksLocal]);

  const applyBlocks = useCallback(
    (newBlocks, pushHistory = true) => {
      setBlocks(newBlocks);
      setActiveModuleBlocksLocal(newBlocks);
      if (pushHistory) saveToHistory(newBlocks);
    },
    [setActiveModuleBlocksLocal, saveToHistory]
  );

  const handleSave = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to save");
      return;
    }
    try {
      await saveActiveModuleBlocks(blocks);
      toast.success("Module saved");
    } catch (err) {
      toast.error("Save failed");
      console.error(err);
    }
  }, [user, blocks, saveActiveModuleBlocks]);

  const handleSaveSettings = async () => {
    try {
      await saveCourse({
        title: courseTitle.trim() || "Untitled Course",
        description: courseDescription,
        theme_json: JSON.stringify(courseTheme),
      });
      setShowSettingsDialog(false);
      toast.success("Course settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  // Copy/paste helpers
  const handleCopyBlock = useCallback(
    async (blockId) => {
      const block = blocks.find((b) => b.id === blockId);
      if (block) {
        const success = await copyBlocksToClipboard([block]);
        if (success) {
          setClipboardCount(getClipboardCount());
          toast.success("Block copied to clipboard");
        } else {
          toast.error("Failed to copy block");
        }
      }
    },
    [blocks]
  );

  const handleCopyModule = useCallback(async () => {
    if (!blocks.length) {
      toast.error("No blocks to copy");
      return;
    }
    await copyBlocksToClipboard(blocks);
    setClipboardCount(getClipboardCount());
    toast.success(`${blocks.length} block${blocks.length !== 1 ? "s" : ""} copied`);
  }, [blocks]);

  const handlePasteAfterBlock = useCallback(
    async (blockId) => {
      const pastedBlocks = await pasteBlocksFromClipboard();
      if (!pastedBlocks?.length) {
        toast.error("Nothing to paste");
        return;
      }
      const idx = blocks.findIndex((b) => b.id === blockId);
      const newBlocks =
        idx === -1
          ? [...blocks, ...pastedBlocks]
          : [...blocks.slice(0, idx + 1), ...pastedBlocks, ...blocks.slice(idx + 1)];
      applyBlocks(newBlocks);
      toast.success(`${pastedBlocks.length} block${pastedBlocks.length !== 1 ? "s" : ""} pasted`);
    },
    [blocks, applyBlocks]
  );

  const handlePasteBlock = useCallback(async () => {
    const pastedBlocks = await pasteBlocksFromClipboard();
    if (pastedBlocks && pastedBlocks.length > 0) {
      applyBlocks([...blocks, ...pastedBlocks]);
      toast.success("Block(s) pasted");
    }
  }, [blocks, applyBlocks]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger if user is intensely typing in input/textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePasteBlock();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo, handleSave, handlePasteBlock]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // DnD handlers
  const handleDragStart = (event) => setActiveId(event.active.id);
  // biome-ignore lint/suspicious/noEmptyBlockStatements: required by DndContext API; onDragOver is needed to enable drop targets
  const handleDragOver = () => {};

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActiveId(null);
    if (!over || over.id === "sidebar") return;

    if (over && active.id !== over.id && blocks.find((b) => b.id === active.id)) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        applyBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
      return;
    }

    if (over) {
      const isExistingBlock = blocks.find((b) => b.id === active.id);
      if (!isExistingBlock) {
        const newBlock = buildDefaultBlock(active.id);
        let newBlocks;
        if (over.id === "editor-dropzone" || !blocks.find((b) => b.id === over.id)) {
          newBlocks = [...blocks, newBlock];
        } else {
          const overIndex = blocks.findIndex((b) => b.id === over.id);
          newBlocks = [...blocks.slice(0, overIndex + 1), newBlock, ...blocks.slice(overIndex + 1)];
        }
        applyBlocks(newBlocks);
      }
    }
  };

  const handleBlockUpdate = (blockId, updatedBlock) => {
    const newBlocks = blocks.map((b) => (b.id === blockId ? updatedBlock : b));
    setBlocks(newBlocks);
    setActiveModuleBlocksLocal(newBlocks);
  };

  const handleBlockDelete = (blockId) => {
    const newBlocks = blocks.filter((b) => b.id !== blockId);
    applyBlocks(newBlocks);
    toast.success("Block deleted");
  };

  const handleBlocksChange = (newBlocks) => applyBlocks(newBlocks);

  const handleBlockAdd = (afterBlockId = null, customBlock = null) => {
    const newBlock = customBlock || { id: Date.now().toString(), type: "paragraph", content: "" };
    if (!newBlock.id) newBlock.id = Date.now().toString();

    let newBlocks;
    if (afterBlockId) {
      const afterIndex = blocks.findIndex((b) => b.id === afterBlockId);
      newBlocks =
        afterIndex !== -1
          ? [...blocks.slice(0, afterIndex + 1), newBlock, ...blocks.slice(afterIndex + 1)]
          : [...blocks, newBlock];
    } else {
      newBlocks = [...blocks, newBlock];
    }
    applyBlocks(newBlocks);
  };

  const activeModule = modules.find((m) => m.id === activeModuleId);

  const getBlockLabel = (blockType) => {
    const labels = {
      h1: "Heading 1",
      h2: "Heading 2",
      h3: "Heading 3",
      paragraph: "Paragraph",
      "learning-objective": "Learning Objectives",
      quiz: "Quiz",
      "knowledge-check": "Knowledge Check",
      flashcard: "Flashcard",
      "progress-marker": "Progress Marker",
      "course-nav": "Course Navigation",
      branching: "Branching Scenario",
      "time-requirements": "Time Requirement",
      categorization: "Categorization",
    };
    return labels[blockType] || blockType;
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <AppSidebar onBlockAdd={handleBlockAdd} />

        <SidebarInset>
          {/* Header */}
          <motion.header
            className="flex h-16 shrink-0 items-center px-3 sm:px-4 border-b relative gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 hidden sm:block" />

            {/* Left: course + module name */}
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
              <button
                type="button"
                onClick={() => setShowSettingsDialog(true)}
                className="text-sm font-medium truncate hover:underline max-w-[140px]"
                title="Edit course settings"
              >
                {course?.title || "Untitled Course"}
              </button>
              {activeModule && (
                <>
                  <span className="text-muted-foreground/50 text-xs">/</span>
                  <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                    {activeModule.title}
                  </span>
                </>
              )}
              {isSaving && (
                <span className="text-xs text-muted-foreground/60 hidden sm:inline">saving…</span>
              )}
            </div>

            {/* Center: tabs */}
            <div className="absolute left-1/2 -translate-x-1/2 px-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-[240px] bg-muted/50 p-1">
                  <TabsTrigger
                    value="editor"
                    className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Editor</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="raw"
                    className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Raw</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 flex-1 justify-end">
              <TooltipProvider>
                {/* Clipboard indicator badge */}
                {clipboardCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 gap-1 text-xs text-muted-foreground hidden sm:flex"
                        onClick={handlePasteBlock}
                      >
                        <Clipboard className="h-3.5 w-3.5" />
                        <span>{clipboardCount}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Paste {clipboardCount} block{clipboardCount !== 1 ? "s" : ""} at end (Ctrl+V)
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 hidden md:flex"
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save module (Ctrl+S)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 hidden sm:flex"
                      onClick={() => setShowPreviewDialog(true)}
                      disabled={!modules.length}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden lg:inline">Learner Preview</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview as learner</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 hidden sm:flex"
                      onClick={() => setShowAdaptivePanel(true)}
                      disabled={!modules.length}
                    >
                      <GitBranch className="h-4 w-4" />
                      <span className="hidden lg:inline">Adaptive</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configure adaptive learning paths</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 hidden sm:flex"
                      onClick={() => setShowReviewPanel(true)}
                      disabled={!course?.id}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden lg:inline">Review</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open review comments</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 hidden sm:flex"
                      onClick={() => setShowCollaboratorsDialog(true)}
                      disabled={!course?.id}
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden lg:inline">Team</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Manage team access</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowXliffDialog(true)}
                      disabled={!modules.length}
                    >
                      <Globe className="h-4 w-4" />
                      <span className="hidden lg:inline">Translate</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export / import XLIFF for translation</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowScormDialog(true)}
                      disabled={!modules.length}
                    >
                      <Package className="h-4 w-4" />
                      <span className="hidden sm:inline">Export SCORM</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download SCORM ZIP package</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2" onClick={toggleTheme}>
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle theme</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.header>

          {/* Content */}
          <motion.div
            className="flex flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Course structure panel */}
              <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                <CourseStructurePanel className="h-full" />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Module editor panel */}
              <ResizablePanel defaultSize={78}>
                <div className="h-[calc(100vh-4rem)] p-4">
                  {!activeModuleId ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">
                          Select or add a module to start editing
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-xl border bg-card shadow-sm overflow-hidden">
                      {activeTab === "editor" && (
                        <Editor
                          blocks={blocks}
                          onBlockUpdate={handleBlockUpdate}
                          onBlockDelete={handleBlockDelete}
                          onBlockAdd={handleBlockAdd}
                          onBlockCopy={handleCopyBlock}
                          onPasteAfter={
                            clipboardCount > 0 ? handlePasteAfterBlock : undefined
                          }
                        />
                      )}
                      {activeTab === "raw" && (
                        <div className="w-full h-full">
                          <Raw blocks={blocks} onBlocksChange={setBlocks} />
                        </div>
                      )}
                      {activeTab === "preview" && <Preview blocks={blocks} theme={courseTheme} />}
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </motion.div>
        </SidebarInset>

        {/* DragOverlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-background border border-border rounded-md px-3 py-2 shadow-lg cursor-grabbing min-w-[160px]">
              <span className="text-xs font-medium">{getBlockLabel(activeId)}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Dialogs */}
      <ScormExportDialog
        open={showScormDialog}
        onOpenChange={setShowScormDialog}
        course={course}
        modules={modules}
      />

      <XliffDialog
        open={showXliffDialog}
        onOpenChange={setShowXliffDialog}
        course={course}
        modules={modules}
      />

      <AdaptivePanel open={showAdaptivePanel} onOpenChange={setShowAdaptivePanel} />

      <CollaboratorsDialog
        open={showCollaboratorsDialog}
        onOpenChange={setShowCollaboratorsDialog}
        courseId={course?.id}
      />

      <ReviewPanel
        open={showReviewPanel}
        onOpenChange={setShowReviewPanel}
        courseId={course?.id}
        modules={modules}
        isOwner={true}
      />

      <CoursePreview
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        course={course}
        modules={modules}
        theme={courseTheme}
      />

      {/* Course Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-violet-500" />
              Course Settings
            </DialogTitle>
            <DialogDescription>Update course details and appearance.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-1">
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1 text-xs">General</TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1 text-xs">Appearance</TabsTrigger>
            </TabsList>

            {/* ── General tab ─────────────────────────────────────────── */}
            <TabsContent value="general" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="My Course"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="What will learners learn?"
                  className="resize-none min-h-[80px]"
                />
              </div>
            </TabsContent>

            {/* ── Appearance tab ──────────────────────────────────────── */}
            <TabsContent value="appearance" className="space-y-4 pt-3">
              {/* Font selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Heading Font</Label>
                  <Select
                    value={courseTheme.headingFont}
                    onValueChange={(v) => setCourseTheme((t) => ({ ...t, headingFont: v }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Inter", "Playfair Display", "Montserrat", "Lora", "Raleway", "Poppins"].map((f) => (
                        <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Body Font</Label>
                  <Select
                    value={courseTheme.bodyFont}
                    onValueChange={(v) => setCourseTheme((t) => ({ ...t, bodyFont: v }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Inter", "Source Serif 4", "Merriweather", "Nunito", "Open Sans", "Roboto"].map((f) => (
                        <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Primary Color</Label>
                  <div className="flex items-center gap-2 border rounded-md px-2 h-8">
                    <input
                      type="color"
                      value={courseTheme.primaryColor}
                      onChange={(e) => setCourseTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                      className="h-5 w-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{courseTheme.primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Accent Color</Label>
                  <div className="flex items-center gap-2 border rounded-md px-2 h-8">
                    <input
                      type="color"
                      value={courseTheme.accentColor}
                      onChange={(e) => setCourseTheme((t) => ({ ...t, accentColor: e.target.value }))}
                      className="h-5 w-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{courseTheme.accentColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Background</Label>
                  <div className="flex items-center gap-2 border rounded-md px-2 h-8">
                    <input
                      type="color"
                      value={courseTheme.bgColor || "#ffffff"}
                      onChange={(e) => setCourseTheme((t) => ({ ...t, bgColor: e.target.value }))}
                      className="h-5 w-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{courseTheme.bgColor || "default"}</span>
                  </div>
                </div>
              </div>

              {/* Live preview swatch */}
              <div
                className="rounded-md border p-3 text-sm overflow-hidden"
                style={{
                  backgroundColor: courseTheme.bgColor || undefined,
                  fontFamily: courseTheme.bodyFont + ", sans-serif",
                }}
              >
                <p
                  className="font-bold text-base mb-1"
                  style={{
                    color: courseTheme.primaryColor,
                    fontFamily: courseTheme.headingFont + ", sans-serif",
                  }}
                >
                  Preview Heading
                </p>
                <p className="text-xs text-muted-foreground">
                  Body text in {courseTheme.bodyFont}. The{" "}
                  <span style={{ color: courseTheme.accentColor }} className="font-medium">
                    accent colour
                  </span>{" "}
                  is used for highlights and interactive elements.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

// Default block factory (shared defaults)
function buildDefaultBlock(blockType) {
  const base = { id: Date.now().toString(), type: blockType, content: "" };
  const extras = {
    h1: { content: "Heading 1" },
    h2: { content: "Heading 2" },
    h3: { content: "Heading 3" },
    paragraph: { content: "" },
    "learning-objective": { objectives: ["Learners will be able to…"] },
    quiz: {
      title: "",
      passThreshold: 80,
      maxAttempts: 0,
      questions: [
        {
          id: `q${Date.now()}`,
          type: "mcq",
          prompt: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          feedbackCorrect: "",
          feedbackIncorrect: "",
          points: 1,
        },
      ],
    },
    "knowledge-check": { prompt: "", options: ["", "", ""], correctIndex: 0 },
    flashcard: { front: "", back: "" },
    "progress-marker": { label: "Progress checkpoint" },
    "course-nav": { prevLabel: "← Previous", nextLabel: "Next →", locked: false },
    branching: {
      prompt: "",
      choices: [
        { id: "c1", label: "" },
        { id: "c2", label: "" },
      ],
    },
  };
  return { ...base, ...(extras[blockType] || {}) };
}

// ---------------------------------------------------------------------------
// Export wrapped in CourseProvider
// ---------------------------------------------------------------------------
export default function CourseBuilder() {
  return (
    <CourseProvider>
      <CourseBuilderInner />
    </CourseProvider>
  );
}
