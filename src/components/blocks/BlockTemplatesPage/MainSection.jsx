import {
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { createDefaultBlock } from "@/lib/blockLibrary";
import {
  BLOCK_TEMPLATE_BASE_BLOCK_OPTIONS,
  buildBlockTemplateStructurePreview,
  createBlockTemplate,
  deleteBlockTemplate,
  getBlockTemplateBaseType,
  getBlockTemplateBaseTypeLabel,
  getBlockTemplateStats,
  getUserBlockTemplates,
  updateBlockTemplate,
} from "@/lib/blockTemplates";

const formatTemplateDate = (template) =>
  new Date(template.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });

export default function MainSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlockType, setSelectedBlockType] = useState("all");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateBaseBlockType, setTemplateBaseBlockType] = useState("paragraph");

  useEffect(() => {
    fetchTemplates();
  }, [user?.id]);

  const fetchTemplates = async () => {
    if (!user?.id) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await getUserBlockTemplates(user.id);
    setTemplates(data);
    setLoading(false);
  };

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesBlockType =
        selectedBlockType === "all" || getBlockTemplateBaseType(template) === selectedBlockType;
      const matchesQuery =
        !normalizedQuery ||
        [
          template.title,
          template.description,
          getBlockTemplateBaseTypeLabel(template),
          ...(template.tags || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesBlockType && matchesQuery;
    });
  }, [searchQuery, selectedBlockType, templates]);

  const openCreateDialog = () => {
    if (!user) {
      toast.error("Please log in to create block templates");
      return;
    }

    setEditingTemplate(null);
    setTemplateTitle("");
    setTemplateDescription("");
    setTemplateBaseBlockType("paragraph");
    setShowFormDialog(true);
  };

  const openEditDialog = (template) => {
    setEditingTemplate(template);
    setTemplateTitle(template.title || "");
    setTemplateDescription(template.description || "");
    setTemplateBaseBlockType(getBlockTemplateBaseType(template) || "paragraph");
    setShowFormDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!user?.id) {
      toast.error("Please log in to manage block templates");
      return;
    }

    if (!templateTitle.trim()) {
      toast.error("Please enter a template title");
      return;
    }

    setIsSaving(true);

    const payload = {
      title: templateTitle.trim(),
      description: templateDescription.trim(),
      base_block_type: templateBaseBlockType,
    };

    if (editingTemplate) {
      const { success, data, error } = await updateBlockTemplate(editingTemplate.id, payload);
      setIsSaving(false);

      if (!success) {
        toast.error(`Failed to update template: ${error}`);
        return;
      }

      setTemplates((currentTemplates) =>
        currentTemplates.map((template) => (template.id === data.id ? data : template))
      );
      setSelectedTemplate(data);
      setShowFormDialog(false);
      toast.success("Block template updated");
      return;
    }

    const { success, data, error } = await createBlockTemplate({
      ...payload,
      blocks_json: JSON.stringify([createDefaultBlock(templateBaseBlockType)]),
      user_id: user.id,
    });

    setIsSaving(false);

    if (!success) {
      toast.error(`Failed to create template: ${error}`);
      return;
    }

    setShowFormDialog(false);
    toast.success("Block template created");
    navigate(`/templates/blocks/${data.id}`);
  };

  const handleDeleteTemplate = async (template) => {
    if (!template?.id) return;
    if (!window.confirm(`Delete "${template.title}"? This cannot be undone.`)) {
      return;
    }

    const { success, error } = await deleteBlockTemplate(template.id);
    if (!success) {
      toast.error(`Failed to delete template: ${error}`);
      return;
    }

    setTemplates((currentTemplates) =>
      currentTemplates.filter((currentTemplate) => currentTemplate.id !== template.id)
    );
    setShowDetailsDialog(false);
    toast.success("Block template deleted");
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowDetailsDialog(true);
  };

  return (
    <>
      <div className="border-r border-b border-[#cecece] dark:border-[#16181d] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-auto h-auto px-2 py-1.5 sm:px-2.5 sm:py-2 border-l border-b border-[#cecece] dark:border-[#16181d] lg:flex items-center justify-center hidden">
          <span className="font-mono text-[0.55rem] sm:text-[0.65rem] md:text-xs text-black dark:text-white whitespace-nowrap">
            block-templates.md
          </span>
        </div>
      </div>

      <div className="border-b border-[#cecece] dark:border-[#16181d] overflow-y-auto">
        <div className="bg-background border-b sticky top-0 z-10 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Block Templates
                </h2>
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 font-mono text-xs border-border"
                >
                  {loading ? "..." : filteredTemplates.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage saved variants of a standard block. Each template is tied to one block type and appears under that block in the builder sidebar.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input
                  type="text"
                  placeholder="Search block templates..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={selectedBlockType} onValueChange={setSelectedBlockType}>
                <SelectTrigger className="h-9 w-[170px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TEMPLATE_BASE_BLOCK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button size="sm" className="h-9 gap-1.5" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading block templates...
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign in to manage block templates</h3>
              <p className="text-sm text-muted-foreground">
                Block templates are private block variants that appear under their matching standard block in the builder sidebar.
              </p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No block templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search or standard block filter."
                  : "Create a saved variant for a standard block, like a branded alert, a ready-made quiz, or a prefilled image block."}
              </p>
              <Button onClick={openCreateDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Block Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const stats = getBlockTemplateStats(template);

                return (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="group relative flex flex-col h-[250px] rounded-lg border bg-card hover:border-ring transition-colors cursor-pointer overflow-hidden"
                  >
                    <div className="h-24 w-full bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-8 w-8 text-muted-foreground/30" />
                    </div>

                    <div className="flex-1 p-4 flex flex-col min-h-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1.5 py-0.5 text-[10px] font-normal tracking-wide uppercase"
                        >
                          {getBlockTemplateBaseTypeLabel(template)}
                        </Badge>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {template.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {template.description || "No description provided."}
                      </p>

                      <p className="text-[11px] text-muted-foreground/80 mt-3">
                        Single {stats.baseBlockLabel.toLowerCase()} variant
                      </p>
                    </div>

                    <div className="h-12 px-4 flex items-center justify-between border-t shrink-0 mt-auto">
                      <span className="text-[10px] text-muted-foreground/70 font-mono">
                        {formatTemplateDate(template)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/templates/blocks/${template.id}`);
                        }}
                      >
                        Edit Block
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border-l border-b border-[#cecece] dark:border-[#16181d]" />

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Block Template" : "Create Block Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Update the metadata that appears in the sidebar and template library."
                : "Create a saved variant of a standard block, then edit the contents of that one block."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-template-title">Title</Label>
              <Input
                id="block-template-title"
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
                placeholder="e.g., Lesson opener with outcomes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="block-template-description">Description</Label>
              <Textarea
                id="block-template-description"
                value={templateDescription}
                onChange={(event) => setTemplateDescription(event.target.value)}
                placeholder="What makes this block variant reusable?"
                className="min-h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="block-template-base-type">Standard Block</Label>
              <Select
                value={templateBaseBlockType}
                onValueChange={setTemplateBaseBlockType}
                disabled={Boolean(editingTemplate)}
              >
                <SelectTrigger id="block-template-base-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TEMPLATE_BASE_BLOCK_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingTemplate && (
                <p className="text-[11px] text-muted-foreground">
                  Standard block type is fixed after creation so existing block content stays valid.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingTemplate ? (
                "Save Changes"
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col">
          {selectedTemplate && (
            <>
              <DialogHeader className="shrink-0">
                <DialogTitle className="text-xl">{selectedTemplate.title}</DialogTitle>
                <DialogDescription>{selectedTemplate.description || "No description provided."}</DialogDescription>
                <p className="text-xs text-muted-foreground mt-2">
                  {getBlockTemplateBaseTypeLabel(selectedTemplate)} • single block variant • Added {formatTemplateDate(selectedTemplate)}
                </p>
              </DialogHeader>

              <ScrollArea className="flex-1 -mr-4 pr-4 mt-4">
                <div className="space-y-4 py-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5" />
                      Block Preview
                    </h4>
                    <div className="rounded-md border p-4 bg-muted">
                      <pre className="text-[11px] leading-relaxed font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                        {buildBlockTemplateStructurePreview(selectedTemplate)}
                      </pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="shrink-0 gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    openEditDialog(selectedTemplate);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Details
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    navigate(`/templates/blocks/${selectedTemplate.id}`);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Edit Block
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => handleDeleteTemplate(selectedTemplate)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}