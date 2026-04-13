import { arrayMove } from "@dnd-kit/sortable";
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
import {
  ArrowLeft,
  Eye,
  FileText,
  GraduationCap,
  Moon,
  Pencil,
  Save,
  Sun,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AppSidebar from "@/components/blocks/BuilderPage/AppSidebar";
import Editor from "@/components/blocks/BuilderPage/Editor";
import Preview from "@/components/blocks/BuilderPage/Preview";
import Raw from "@/components/blocks/BuilderPage/Raw";
import Navbar from "@/components/blocks/Navbar/Navbar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { pageTransition } from "@/lib/animations";
import {
  BLOCK_TEMPLATE_CATEGORY_OPTIONS,
  deleteBlockTemplate,
  getBlockTemplateById,
  parseBlockTemplateBlocks,
  updateBlockTemplate,
} from "@/lib/blockTemplates";
import { createDefaultMarpVoiceoverBlock } from "@/lib/marp";

const DEFAULT_BLOCK_THEME = {
  headingFont: "Inter",
  bodyFont: "Inter",
  primaryColor: "#7c3aed",
  accentColor: "#06b6d4",
  bgColor: "",
  displayOrientation: "landscape",
  displayResolution: "1366x768",
};

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
    branching: { prompt: "", choices: [{ id: "c1", label: "" }, { id: "c2", label: "" }] },
    "marp-voiceover": createDefaultMarpVoiceoverBlock({ id: Date.now().toString() }),
  };

  return { ...base, ...(extras[blockType] || {}) };
}

export default function BlockTemplateEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const [template, setTemplate] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("general");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadTemplate = async () => {
      try {
        const data = await getBlockTemplateById(id);
        setTemplate(data);
        setBlocks(parseBlockTemplateBlocks(data));
        setTemplateTitle(data.title || "");
        setTemplateDescription(data.description || "");
        setTemplateCategory(data.category || "general");
      } catch (error) {
        console.error(error);
        toast.error("Block template not found");
        navigate("/templates/blocks");
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id, navigate, user]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const { success, data, error } = await updateBlockTemplate(id, {
      title: templateTitle.trim() || "Untitled Block Template",
      description: templateDescription,
      category: templateCategory,
      blocks_json: JSON.stringify(blocks),
    });

    setSaving(false);

    if (!success) {
      toast.error(`Failed to save template: ${error}`);
      return;
    }

    setTemplate(data);
    toast.success("Block template saved");
  }, [blocks, id, templateCategory, templateDescription, templateTitle]);

  const handleDelete = async () => {
    if (!template?.id) return;
    if (!window.confirm(`Delete "${template.title}"? This cannot be undone.`)) {
      return;
    }

    const { success, error } = await deleteBlockTemplate(template.id);
    if (!success) {
      toast.error(`Failed to delete template: ${error}`);
      return;
    }

    toast.success("Block template deleted");
    navigate("/templates/blocks");
  };

  const handleDragStart = (event) => setActiveId(event.active.id);
  // biome-ignore lint/suspicious/noEmptyBlockStatements: required by DnD drop zones
  const handleDragOver = () => {};

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActiveId(null);

    if (!over || over.id === "sidebar") return;

    if (over && active.id !== over.id && blocks.find((block) => block.id === active.id)) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
      return;
    }

    if (over && !blocks.find((block) => block.id === active.id)) {
      const newBlock = buildDefaultBlock(active.id);
      const overIndex = blocks.findIndex((block) => block.id === over.id);

      if (over.id === "editor-dropzone" || overIndex === -1) {
        setBlocks((currentBlocks) => [...currentBlocks, newBlock]);
      } else {
        setBlocks((currentBlocks) => [
          ...currentBlocks.slice(0, overIndex + 1),
          newBlock,
          ...currentBlocks.slice(overIndex + 1),
        ]);
      }
    }
  };

  const handleBlockUpdate = (blockId, updatedBlock) => {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block) => (block.id === blockId ? updatedBlock : block))
    );
  };

  const handleBlockDelete = (blockId) => {
    setBlocks((currentBlocks) => currentBlocks.filter((block) => block.id !== blockId));
  };

  const handleBlockAdd = (afterBlockId = null, customBlock = null) => {
    const newBlock = customBlock || { id: Date.now().toString(), type: "paragraph", content: "" };
    if (!newBlock.id) newBlock.id = Date.now().toString();

    setBlocks((currentBlocks) => {
      if (!afterBlockId) {
        return [...currentBlocks, newBlock];
      }

      const afterIndex = currentBlocks.findIndex((block) => block.id === afterBlockId);
      if (afterIndex === -1) {
        return [...currentBlocks, newBlock];
      }

      return [
        ...currentBlocks.slice(0, afterIndex + 1),
        newBlock,
        ...currentBlocks.slice(afterIndex + 1),
      ];
    });
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen flex flex-col" {...pageTransition}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Loading block template...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="min-h-screen flex flex-col bg-background" {...pageTransition}>
      <Navbar />

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
            <header className="flex h-16 shrink-0 items-center px-4 border-b relative gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 hidden sm:block" />

              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <Button variant="ghost" size="sm" className="gap-1 px-2" onClick={() => navigate("/templates/blocks") }>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                <button
                  type="button"
                  onClick={() => setShowSettingsDialog(true)}
                  className="text-sm font-medium truncate hover:underline max-w-[280px]"
                  title="Edit block template settings"
                >
                  {templateTitle || template?.title || "Untitled Block Template"}
                </button>
                {saving && <span className="text-xs text-muted-foreground/60 hidden sm:inline">saving…</span>}
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 px-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 w-[240px] bg-muted/50 p-1">
                    <TabsTrigger value="editor" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Editor</span>
                    </TabsTrigger>
                    <TabsTrigger value="raw" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Raw</span>
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Preview</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-2 flex-1 justify-end">
                <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex" onClick={() => setShowSettingsDialog(true)}>
                  <Pencil className="h-4 w-4" />
                  Details
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button size="sm" className="gap-1.5" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
                <Button variant="ghost" size="sm" className="px-2" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-hidden p-4">
              <div className="w-full h-[calc(100vh-8rem)] rounded-xl border bg-card shadow-sm overflow-hidden">
                {activeTab === "editor" && (
                  <div className="w-full h-full">
                    <Editor
                      blocks={blocks}
                      onBlockUpdate={handleBlockUpdate}
                      onBlockDelete={handleBlockDelete}
                      onBlockAdd={handleBlockAdd}
                    />
                  </div>
                )}

                {activeTab === "preview" && (
                  <div className="w-full h-full">
                    <Preview blocks={blocks} theme={DEFAULT_BLOCK_THEME} />
                  </div>
                )}

                {activeTab === "raw" && (
                  <div className="w-full h-full">
                    <Raw blocks={blocks} onBlocksChange={setBlocks} />
                  </div>
                )}
              </div>
            </div>
          </SidebarInset>

          <DragOverlay>
            {activeId ? (
              <div className="bg-background border border-border rounded-md px-3 py-2 shadow-lg cursor-grabbing min-w-[160px]">
                <span className="text-xs font-medium">{activeId}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </SidebarProvider>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Block Template Settings</DialogTitle>
            <DialogDescription>
              Update the metadata that appears in the block template library and builder sidebar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-template-editor-title">Title</Label>
              <Input
                id="block-template-editor-title"
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="block-template-editor-description">Description</Label>
              <Textarea
                id="block-template-editor-description"
                value={templateDescription}
                onChange={(event) => setTemplateDescription(event.target.value)}
                className="min-h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="block-template-editor-category">Category</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger id="block-template-editor-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TEMPLATE_CATEGORY_OPTIONS.filter((category) => category.value !== "all").map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Close
            </Button>
            <Button onClick={handleSave}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}