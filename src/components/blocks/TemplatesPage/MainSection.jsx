import { Eye, FileText, Filter, Loader2, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  buildCourseTemplateStructurePreview,
  getCourseTemplateStats,
} from "@/lib/preGeneratedCourseTemplates";
import { duplicateCourse } from "@/lib/storage";
import {
  createTemplate,
  deleteTemplateWithCourse,
  ensureTemplateCourse,
  getAllTemplates,
  getTemplatesByCategory,
  instantiateBuiltInTemplateCourse,
  searchTemplates,
  TEMPLATE_CATEGORY_OPTIONS,
  updateTemplate,
} from "@/lib/templates";

const formatTemplateDate = (template) => {
  if (template?.is_builtin) return "Built-in";

  return new Date(template.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
};

const getTemplateStatsLabel = (template) => {
  if (Array.isArray(template?.modules) && template.modules.length > 0) {
    const stats = getCourseTemplateStats(template);
    const parts = [`${stats.moduleCount} modules`, `${stats.blockCount} blocks`];
    if (stats.narrationCount > 0) {
      parts.push(`${stats.narrationCount} narration block${stats.narrationCount === 1 ? "" : "s"}`);
    }
    return parts.join(" • ");
  }

  try {
    const blocks = JSON.parse(template?.content || "[]");
    if (Array.isArray(blocks) && blocks.length > 0) {
      return `${blocks.length} block${blocks.length === 1 ? "" : "s"}`;
    }
  } catch {
    return null;
  }

  return null;
};

const buildLegacyStructurePreview = (template) => {
  try {
    const blocks = JSON.parse(template.content);
    return blocks
      .map((block) => {
        if (block.type.startsWith("h")) {
          const level = block.type.slice(1);
          return `${"#".repeat(level)} ${block.content}`;
        }
        if (block.type === "paragraph") return block.content;
        if (block.type === "blockquote") return `> ${block.content}`;
        if (block.type === "code") return `\`\`\`\n${block.content}\n\`\`\``;
        if (block.type === "separator") return "---";
        return `[${block.type}] ${block.content || ""}`;
      })
      .join("\n\n");
  } catch {
    return "Preview content unavailable.";
  }
};

const buildTemplateStructurePreview = (template) => {
  if (Array.isArray(template?.modules) && template.modules.length > 0) {
    return buildCourseTemplateStructurePreview(template);
  }

  return buildLegacyStructurePreview(template);
};

const getCategoryLabel = (value) =>
  TEMPLATE_CATEGORY_OPTIONS.find((category) => category.value === value)?.label || value;

export default function MainSection({ onTemplatesChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("onboarding");
  const [templateImages, setTemplateImages] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const categories = TEMPLATE_CATEGORY_OPTIONS;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: needed
  useEffect(() => {
    fetchTemplates();
  }, [category, debouncedSearch]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      let data;

      if (debouncedSearch.trim()) {
        data = await searchTemplates(debouncedSearch);
        if (category !== "all") {
          data = data.filter((t) => t.category === category);
        }
      } else if (category === "all") {
        data = await getAllTemplates();
      } else {
        data = await getTemplatesByCategory(category);
      }

      setTemplates(data);
      if (onTemplatesChange) {
        onTemplatesChange(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = () => {
    if (!user) {
      toast.error("Please log in to create templates");
      return;
    }
    setEditingTemplate(null);
    setTemplateTitle("");
    setTemplateDescription("");
    setTemplateCategory("onboarding");
    setTemplateImages([]);
    setShowCreateDialog(true);
  };

  const openEditMetadataDialog = (template) => {
    setEditingTemplate(template);
    setTemplateTitle(template.title || "");
    setTemplateDescription(template.description || "");
    setTemplateCategory(template.category || "onboarding");
    setTemplateImages(template.images || []);
    setShowCreateDialog(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingImages(true);
    const toastId = toast.loading(`Processing ${files.length} image(s)...`);

    for (const file of files) {
      try {
        const compressedImage = await compressImage(file, 800, 0.7);
        setTemplateImages((prev) => [...prev, compressedImage]);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setIsUploadingImages(false);
    toast.dismiss(toastId);
    toast.success(`${files.length} image(s) added`);
  };

  const compressImage = (file, maxWidth, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setTemplateImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateTemplate = async () => {
    if (!templateTitle.trim()) {
      toast.error("Please enter a template title");
      return;
    }

    setIsCreating(true);
    try {
      const metadataPayload = {
        title: templateTitle.trim(),
        description: templateDescription,
        category: templateCategory,
        thumbnail: templateImages[0] || null,
        images: templateImages,
      };

      const result = editingTemplate
        ? await updateTemplate(editingTemplate.id, {
            ...metadataPayload,
            tags: editingTemplate.tags || [],
          })
        : await createTemplate({
            ...metadataPayload,
            content: "[]",
            tags: [],
            user_id: user.id,
          });

      if (result.success) {
        toast.success(editingTemplate ? "Template updated successfully!" : "Template created successfully!");
        setShowCreateDialog(false);
        setEditingTemplate(null);
        setTemplateTitle("");
        setTemplateDescription("");
        setTemplateCategory("onboarding");
        setTemplateImages([]);
        await fetchTemplates();
        if (selectedTemplate?.id === result.data?.id) {
          setSelectedTemplate(result.data);
        }
      } else {
        toast.error(`Failed to ${editingTemplate ? "update" : "create"} template: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(`Failed to ${editingTemplate ? "update" : "create"} template`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (!template?.id) return;
    if (!window.confirm(`Delete "${template.title}"? This cannot be undone.`)) {
      return;
    }

    const { success, error } = await deleteTemplateWithCourse(template);
    if (!success) {
      toast.error(`Failed to delete template: ${error}`);
      return;
    }

    setShowDetailsDialog(false);
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
    }
    await fetchTemplates();
    toast.success("Template deleted");
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowDetailsDialog(true);
  };

  const handleEditTemplate = async (template) => {
    if (template.course_id) {
      navigate(`/course/${template.course_id}`);
      return;
    }
    // Template predates companion-course linking — create one now
    const loadingToast = toast.loading("Setting up template editor…");
    const { success, courseId, error } = await ensureTemplateCourse(
      template.id,
      template.title,
      user.id,
    );
    toast.dismiss(loadingToast);
    if (success) {
      navigate(`/course/${courseId}`);
    } else {
      toast.error(`Failed to open template editor: ${error}`);
    }
  };

  const handleUseTemplate = async (template) => {
    if (!user) {
      toast.error("Please log in to use templates");
      navigate("/login");
      return;
    }

    let loadingToast;

    try {
      if (template.is_builtin) {
        loadingToast = toast.loading("Creating course from built-in template…");
        const newCourse = await instantiateBuiltInTemplateCourse(template, user.id);
        toast.dismiss(loadingToast);
        navigate(`/course/${newCourse.id}`);
        toast.success(`Template applied: ${template.title}`);
      } else if (template.course_id) {
        // Duplicate the companion course into a new draft for this user
        loadingToast = toast.loading("Applying template…");
        const newCourse = await duplicateCourse(template.course_id, user.id);
        toast.dismiss(loadingToast);
        navigate(`/course/${newCourse.id}`);
        toast.success(`Template applied: ${template.title}`);
      } else {
        // Legacy path: template only has a flat content blob
        const blocks = JSON.parse(template.content || "[]");
        localStorage.setItem("markdown-blocks", JSON.stringify(blocks));
        navigate("/course");
        toast.success(`Using template: ${template.title}`);
      }
    } catch (error) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      console.error("Error using template:", error);
      toast.error("Failed to apply template");
    }
  };

  return (
    <>
      <div className="border-r border-b border-[#cecece] dark:border-[#16181d] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-auto h-auto px-2 py-1.5 sm:px-2.5 sm:py-2 border-l border-b border-[#cecece] dark:border-[#16181d] lg:flex items-center justify-center hidden">
          <span className="font-mono text-[0.55rem] sm:text-[0.65rem] md:text-xs text-black dark:text-white whitespace-nowrap">
            templates.md
          </span>
        </div>
      </div>

      <div className="border-b border-[#cecece] dark:border-[#16181d] overflow-y-auto">
        <div className="bg-background border-b sticky top-0 z-10 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Template Library
                </h2>
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 font-mono text-xs border-border"
                >
                  {loading ? "..." : templates.length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Pre-generated course starters and reusable layouts for onboarding, technical training, narration, and compliance.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input
                  type="text"
                  placeholder="Search course templates..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    style={{cursor:"pointer"}}
                    className="h-9 w-9 shrink-0 border-border bg-background text-muted-foreground hover:text-foreground hover:scale-108"
                    title="Filter Categories"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Category</h4>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {categories.find((c) => c.value === category)?.label}
                      </span>
                    </div>
                    <Separator />
                    <RadioGroup value={category} onValueChange={setCategory} className="gap-1">
                      {categories.map((cat) => (
                        <Label
                          key={cat.value}
                          htmlFor={cat.value}
                          className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer transition-colors group"
                        >
                          <RadioGroupItem value={cat.value} id={cat.value} />
                          <span className="text-sm font-normal group-hover:text-foreground transition-colors">
                            {cat.label}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </PopoverContent>
              </Popover>

              <Button style={{cursor:"pointer"}} size="sm" className="h-9 gap-1.5 hover:scale-105" onClick={handleAddTemplate}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading templates...</div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Create a custom template or switch filters to explore built-in course starters"}
              </p>
              {!searchQuery && user && (
                <Button onClick={handleAddTemplate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group relative flex flex-col h-[280px] rounded-lg border bg-card hover:border-ring transition-colors cursor-pointer overflow-hidden"
                >
                  {/* Preview Image */}
                  {template.images && template.images.length > 0 ? (
                    <div className="h-32 w-full overflow-hidden bg-muted shrink-0">
                      <img
                        src={template.images[0]}
                        alt={template.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}

                  <div className="flex-1 p-4 flex flex-col min-h-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1.5 py-0.5 text-[10px] font-normal tracking-wide uppercase"
                        >
                          {getCategoryLabel(template.category)}
                        </Badge>
                        {template.is_builtin && (
                          <Badge
                            variant="outline"
                            className="rounded-sm px-1.5 py-0.5 text-[10px] font-normal tracking-wide uppercase"
                          >
                            Built-in
                          </Badge>
                        )}
                      </div>
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

                    {getTemplateStatsLabel(template) && (
                      <p className="text-[11px] text-muted-foreground/80 mt-3 line-clamp-2">
                        {getTemplateStatsLabel(template)}
                      </p>
                    )}
                  </div>

                  <div className="h-12 px-4 flex items-center justify-between border-t shrink-0 mt-auto">
                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      {formatTemplateDate(template)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-l border-b border-[#cecece] dark:border-[#16181d]" />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Update the metadata and preview assets for this reusable course template."
                : "Create a reusable course template with a title, category, and optional preview images."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-title">Title</Label>
              <Input
                id="template-title"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="e.g., New Hire Onboarding Path"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="What structure, audience, or delivery pattern does this template support?"
                className="min-h-20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger id="template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((categoryOption) => categoryOption.value !== "all")
                    .map((categoryOption) => (
                      <SelectItem key={categoryOption.value} value={categoryOption.value}>
                        {categoryOption.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-images">Preview Images (Optional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="template-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("template-images").click()}
                    className="w-full"
                    disabled={isUploadingImages}
                  >
                    {isUploadingImages ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Images
                      </>
                    )}
                  </Button>
                </div>
                {templateImages.length > 0 && (
                  <ScrollArea className="h-[100px]">
                    <div className="flex gap-2 flex-wrap">
                      {templateImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editingTemplate ? "Saving..." : "Creating..."}
                </>
              ) : (
                editingTemplate ? "Save Changes" : "Create Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          {selectedTemplate && (
            <>
              <DialogHeader className="shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl">{selectedTemplate.title}</DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="font-normal">
                        {getCategoryLabel(selectedTemplate.category)}
                      </Badge>
                      {selectedTemplate.is_builtin && (
                        <Badge variant="outline" className="font-normal">
                          Built-in
                        </Badge>
                      )}
                      <span>•</span>
                      <span>
                        {selectedTemplate.is_builtin
                          ? "Available instantly"
                          : `Added ${new Date(selectedTemplate.created_at).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                </div>
                {selectedTemplate.description && (
                  <DialogDescription className="mt-3">
                    {selectedTemplate.description}
                  </DialogDescription>
                )}
                {getTemplateStatsLabel(selectedTemplate) && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {getTemplateStatsLabel(selectedTemplate)}
                  </p>
                )}
              </DialogHeader>

              <ScrollArea className="flex-1 -mr-4 pr-4 mt-4">
                <div className="space-y-4 py-2">
                  {selectedTemplate.images && selectedTemplate.images.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Preview Images
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTemplate.images.map((img, index) => (
                          <div key={index} className="rounded-md border overflow-hidden">
                            <img
                              src={img}
                              alt={`${selectedTemplate.title} preview ${index + 1}`}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5" />
                      Structure Preview
                    </h4>
                    <div className="rounded-md border p-4 bg-muted">
                      <pre className="text-[11px] leading-relaxed font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                        {buildTemplateStructurePreview(selectedTemplate)}
                      </pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="shrink-0 gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                {user?.id === selectedTemplate?.user_id && !selectedTemplate?.is_builtin && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      openEditMetadataDialog(selectedTemplate);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Details
                  </Button>
                )}
                {user?.id === selectedTemplate?.user_id && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleEditTemplate(selectedTemplate);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Layout
                  </Button>
                )}
                {user?.id === selectedTemplate?.user_id && !selectedTemplate?.is_builtin && (
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleDeleteTemplate(selectedTemplate)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setShowDetailsDialog(false);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Use Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
