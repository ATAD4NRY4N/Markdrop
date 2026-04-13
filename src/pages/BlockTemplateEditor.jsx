import {
  DndContext,
} from "@dnd-kit/core";
import {
  ArrowLeft,
  Eye,
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
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { pageTransition } from "@/lib/animations";
import { createDefaultBlock, getBlockTypeLabel } from "@/lib/blockLibrary";
import {
  deleteBlockTemplate,
  getBlockTemplateBaseType,
  getBlockTemplateBaseTypeLabel,
  getBlockTemplateById,
  parseBlockTemplateBlocks,
  updateBlockTemplate,
} from "@/lib/blockTemplates";

const DEFAULT_BLOCK_THEME = {
  headingFont: "Inter",
  bodyFont: "Inter",
  primaryColor: "#7c3aed",
  accentColor: "#06b6d4",
  bgColor: "",
  displayOrientation: "landscape",
  displayResolution: "1366x768",
};

export default function BlockTemplateEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [template, setTemplate] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateBaseBlockType, setTemplateBaseBlockType] = useState("paragraph");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadTemplate = async () => {
      try {
        const data = await getBlockTemplateById(id);
        const baseBlockType = getBlockTemplateBaseType(data) || "paragraph";
        setTemplate(data);
        setBlocks(parseBlockTemplateBlocks({ ...data, base_block_type: baseBlockType }));
        setTemplateTitle(data.title || "");
        setTemplateDescription(data.description || "");
        setTemplateBaseBlockType(baseBlockType);
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
    const normalizedBlocks = blocks.length ? [blocks[0]] : [createDefaultBlock(templateBaseBlockType)];

    setSaving(true);
    const { success, data, error } = await updateBlockTemplate(id, {
      title: templateTitle.trim() || "Untitled Block Template",
      description: templateDescription,
      base_block_type: templateBaseBlockType,
      blocks_json: JSON.stringify(normalizedBlocks),
    });

    setSaving(false);

    if (!success) {
      toast.error(`Failed to save template: ${error}`);
      return;
    }

    setTemplate(data);
    setBlocks(normalizedBlocks);
    toast.success("Block template saved");
  }, [blocks, id, templateBaseBlockType, templateDescription, templateTitle]);

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

  const handleBlockUpdate = (blockId, updatedBlock) => {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block) => (block.id === blockId ? updatedBlock : block))
    );
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
        <DndContext>
          <AppSidebar
            readonlyStructure
            readonlyTitle="Single block variant"
            readonlyDescription="Block templates are locked to one standard block type. You can edit the content of this block, but not add or swap block types."
          />

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
                <span className="hidden md:inline text-xs text-muted-foreground/70 truncate">
                  {getBlockTemplateBaseTypeLabel({ base_block_type: templateBaseBlockType })}
                </span>
                {saving && <span className="text-xs text-muted-foreground/60 hidden sm:inline">saving…</span>}
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 px-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 w-[180px] bg-muted/50 p-1">
                    <TabsTrigger value="editor" className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Editor</span>
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
                      readonlyStructure
                    />
                  </div>
                )}

                {activeTab === "preview" && (
                  <div className="w-full h-full">
                    <Preview blocks={blocks} theme={DEFAULT_BLOCK_THEME} />
                  </div>
                )}
              </div>
            </div>
          </SidebarInset>
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
              <Label htmlFor="block-template-editor-base-type">Standard Block</Label>
              <Input
                id="block-template-editor-base-type"
                value={getBlockTypeLabel(templateBaseBlockType)}
                disabled
              />
              <p className="text-[11px] text-muted-foreground">
                This template is locked to a single {getBlockTypeLabel(templateBaseBlockType).toLowerCase()} block variant.
              </p>
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