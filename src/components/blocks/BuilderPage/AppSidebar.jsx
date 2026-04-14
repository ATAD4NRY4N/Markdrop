import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  Code2,
  Columns2,
  CreditCard,
  Crosshair,
  FileSliders,
  FileText,
  Flag,
  GitBranch,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  HelpCircle,
  Image,
  ImagePlay,
  LayoutGrid,
  Layers,
  Link2,
  ListChecks,
  Lock,
  MessageSquareCode,
  Minus,
  Network,
  ListOrdered as OrderedList,
  Mic,
  Palette,
  PenLine,
  Pilcrow,
  Quote,
  RotateCcw,
  Search,
  Shield,
  Sigma,
  Sparkles,
  Table,
  Target,
  Type,
  List as UnorderedList,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo, Icon } from "@/components/Logo";
import { useTheme } from "@/components/ThemeProvider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";
import { createDefaultBlock } from "@/lib/blockLibrary";
import {
  getBlockTemplateBaseType,
  getBlockTemplateBaseTypeLabel,
  getUserBlockTemplates,
  materializeBlockTemplateBlocks,
} from "@/lib/blockTemplates";
import {
  materializeTemplateBlocks,
  PRE_GENERATED_SLIDE_TEMPLATES,
} from "@/lib/preGeneratedSlideTemplates";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function DraggableItem({ id, title, icon: Icon, isCollapsed, isMobile, onDoubleClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  });

  // On mobile, always show text even if sidebar is "collapsed"
  const showText = !isCollapsed || isMobile;
  const itemClasses = showText ? "px-3 mx-2" : "justify-center mx-0 px-0";

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDoubleClick(id);
  };

  const itemContent = (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={handleDoubleClick}
      className={`flex w-full items-center gap-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors cursor-grab active:cursor-grabbing ${itemClasses}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
      {showText && <span className="text-sm">{title}</span>}
    </div>
  );

  // If collapsed (showing only icons), wrap with tooltip
  if (!showText) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{itemContent}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <p>{title}</p>
          <p className="text-muted-foreground text-[10px]">Drag or double-click to add</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return itemContent;
}

export default function AppSidebar({
  onBlockAdd,
  presentationMode = false,
  readonlyStructure = false,
  readonlyTitle = "Structure locked",
  readonlyDescription = "This course uses a template. Block structure is fixed — you can only edit content.",
  ...props
}) {
  const { setNodeRef } = useDroppable({ id: "sidebar" });
  const { theme } = useTheme();
  const { user } = useAuth();
  const { state, setOpen } = useSidebar();
  const isDarkMode = theme === "dark";
  const [userBlockTemplates, setUserBlockTemplates] = useState([]);
  const [isLoadingBlockTemplates, setIsLoadingBlockTemplates] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [openCategories, setOpenCategories] = useState(["content"]);
  const [openVariantBlocks, setOpenVariantBlocks] = useState({});

  const TEMPLATE_ICONS = {
    AlertCircle,
    ArrowLeftRight,
    CheckCircle2,
    Columns2,
    Crosshair,
    ImagePlay,
    LayoutGrid,
    Layers,
    ListChecks,
    Mic,
    Quote,
  };

  const SLIDE_TEMPLATES = PRE_GENERATED_SLIDE_TEMPLATES.map((template) => ({
    ...template,
    icon: TEMPLATE_ICONS[template.icon] || LayoutGrid,
  }));

  const handleTemplateInsert = (template) => {
    if (!onBlockAdd) return;
    materializeTemplateBlocks(template.blocks).forEach((blockData) => {
      onBlockAdd(null, blockData);
    });
  };

  const handleUserTemplateInsert = (template) => {
    if (!onBlockAdd) return;
    materializeBlockTemplateBlocks(template).forEach((blockData) => {
      onBlockAdd(null, blockData);
    });
  };

  const handleDoubleClickAdd = (blockType) => {
    if (!onBlockAdd) return;
    onBlockAdd(null, createDefaultBlock(blockType));
  };

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const loadUserBlockTemplates = async () => {
      if (!user?.id || readonlyStructure) {
        setUserBlockTemplates([]);
        setIsLoadingBlockTemplates(false);
        return;
      }

      setIsLoadingBlockTemplates(true);
      const templates = await getUserBlockTemplates(user.id);
      setUserBlockTemplates(templates);
      setIsLoadingBlockTemplates(false);
    };

    loadUserBlockTemplates();
  }, [readonlyStructure, user?.id]);

  const userTemplatesByBlockType = useMemo(() => {
    return userBlockTemplates.reduce((groupedTemplates, template) => {
      const blockType = getBlockTemplateBaseType(template);
      if (!blockType) {
        return groupedTemplates;
      }

      if (!groupedTemplates[blockType]) {
        groupedTemplates[blockType] = [];
      }

      groupedTemplates[blockType].push(template);
      return groupedTemplates;
    }, {});
  }, [userBlockTemplates]);

  const data = {
    headings: [
      { title: "Heading 1", key: "h1", icon: Heading1 },
      { title: "Heading 2", key: "h2", icon: Heading2 },
      { title: "Heading 3", key: "h3", icon: Heading3 },
      { title: "Heading 4", key: "h4", icon: Heading4 },
      { title: "Heading 5", key: "h5", icon: Heading5 },
      { title: "Heading 6", key: "h6", icon: Heading6 },
    ],
    blocks: [
      { title: "Paragraph", key: "paragraph", icon: Pilcrow },
      { title: "Table", key: "table", icon: Table },
      { title: "Separator", key: "separator", icon: Minus },
      { title: "Blockquote", key: "blockquote", icon: Quote },
      { title: "Alert", key: "alert", icon: AlertCircle },
      { title: "Code Block", key: "code", icon: Code2 },
      { title: "Math Expression", key: "math", icon: Sigma },
      { title: "Diagram", key: "diagram", icon: Network },
    ],
    layout: [
      { title: "Columns / Grid", key: "grid", icon: Columns2 },
    ],
    lists: [
      { title: "Ordered List", key: "ol", icon: OrderedList },
      { title: "Unordered List", key: "ul", icon: UnorderedList },
      { title: "Task List", key: "task-list", icon: ListChecks },
    ],
    media: [
      { title: "Image", key: "image", icon: Image },
      { title: "Video", key: "video", icon: Video },
      { title: "Image Carousel", key: "carousel", icon: ImagePlay },
      { title: "PDF Viewer", key: "pdf", icon: FileText },
    ],
    links: [{ title: "Link", key: "link", icon: Link2 }],
    marp: [
      { title: "MARP Frontmatter", key: "marp-frontmatter", icon: FileSliders },
      { title: "Slide Break", key: "slide", icon: Layers },
      { title: "Slide Directive", key: "marp-slide-directive", icon: MessageSquareCode },
      { title: "Background Image", key: "marp-bg-image", icon: Image },
      { title: "Custom CSS", key: "marp-style", icon: Palette },
      { title: "Slide Narration", key: "marp-voiceover", icon: Mic },
    ],
    "special blocks": [
      { title: "Shield Badge", key: "shield-badge", icon: Shield },
      { title: "Skill Icons", key: "skill-icons", icon: Sparkles },
      { title: "Typing SVG", key: "typing-svg", icon: Type },
      { title: "GitHub Profile Cards", key: "github-profile-cards", icon: CreditCard },
    ],
    "elearning": [
      { title: "Learning Objectives", key: "learning-objective", icon: Target },
      { title: "Quiz", key: "quiz", icon: CheckCircle2 },
      { title: "Knowledge Check", key: "knowledge-check", icon: HelpCircle },
      { title: "Flashcard", key: "flashcard", icon: RotateCcw },
      { title: "Fill in the Blank", key: "fill-in-the-blank", icon: PenLine },
      { title: "Matching Activity", key: "matching", icon: ArrowLeftRight },
      { title: "Hotspot Image", key: "hotspot", icon: Crosshair },
      { title: "Categorization", key: "categorization", icon: CheckSquare },
      { title: "Time Requirement", key: "time-requirements", icon: Clock },
      { title: "Progress Marker", key: "progress-marker", icon: Flag },
      { title: "Course Navigation", key: "course-nav", icon: Layers },
      { title: "Branching Scenario", key: "branching", icon: GitBranch },
    ],
  };
  const isCollapsed = state === "collapsed";

  // On mobile, always show full content when sidebar is open
  const showFullContent = !isCollapsed || isMobile;

  const menuCategories = useMemo(
    () => [
      {
        key: "content",
        title: "Content",
        icon: FileText,
        sections: [
          { key: "headings", title: "Headings", items: data.headings },
          { key: "text", title: "Text & Data", items: data.blocks },
          { key: "lists", title: "Lists", items: data.lists },
        ],
      },
      {
        key: "layout-media",
        title: "Media & Layout",
        icon: Image,
        sections: [
          { key: "layout", title: "Layout", items: data.layout },
          { key: "media", title: "Media", items: data.media },
          { key: "links", title: "Links", items: data.links },
          { key: "special", title: "Special", items: data["special blocks"] },
        ],
      },
      {
        key: "learning",
        title: "Interactive Learning",
        icon: Target,
        sections: [{ key: "elearning", title: "Activities", items: data.elearning }],
      },
      {
        key: "presentation",
        title: "Presentation",
        icon: Layers,
        sections: [{ key: "marp", title: "MARP Slides", items: data.marp }],
      },
      {
        key: "templates",
        title: "Starter Templates",
        icon: LayoutGrid,
        sections: [{ key: "slide-templates", title: "Slide Layouts", templates: SLIDE_TEMPLATES }],
      },
    ],
    [SLIDE_TEMPLATES]
  );

  const normalizedSearch = menuSearch.trim().toLowerCase();

  const filteredMenuCategories = useMemo(() => {
    const matchesSearch = (...parts) => {
      if (!normalizedSearch) return true;
      return parts.join(" ").toLowerCase().includes(normalizedSearch);
    };

    return menuCategories
      .map((category) => {
        const sections = category.sections
          .map((section) => {
            if (section.templates) {
              const templates = section.templates.filter((template) =>
                matchesSearch(template.label, template.description)
              );

              if (!templates.length) {
                return null;
              }

              return {
                ...section,
                templates,
              };
            }

            const items = section.items
              .map((item) => {
                const matchingTemplates = userTemplatesByBlockType[item.key] || [];
                const blockMatches = matchesSearch(item.title, item.key, section.title, category.title);
                const visibleTemplates = !normalizedSearch
                  ? matchingTemplates
                  : blockMatches
                    ? matchingTemplates
                    : matchingTemplates.filter((template) =>
                        matchesSearch(
                          template.title,
                          template.description,
                          getBlockTemplateBaseTypeLabel(template)
                        )
                      );

                if (!blockMatches && !visibleTemplates.length) {
                  return null;
                }

                return {
                  ...item,
                  visibleTemplates,
                  forceVariantOpen: normalizedSearch.length > 0 && visibleTemplates.length > 0,
                };
              })
              .filter(Boolean);

            if (!items.length) {
              return null;
            }

            return {
              ...section,
              items,
            };
          })
          .filter(Boolean);

        if (!sections.length) {
          return null;
        }

        return {
          ...category,
          sections,
        };
      })
      .filter(Boolean);
  }, [menuCategories, normalizedSearch, userTemplatesByBlockType]);

  const visibleCategoryKeys = filteredMenuCategories.map((category) => category.key);
  const accordionValue = normalizedSearch ? visibleCategoryKeys : openCategories;

  const openCategoryFromCollapsedRail = (categoryKey) => {
    setOpen(true);
    setOpenCategories([categoryKey]);
  };

  const toggleVariantBlock = (blockKey) => {
    setOpenVariantBlocks((currentState) => ({
      ...currentState,
      [blockKey]: !currentState[blockKey],
    }));
  };

  const renderTemplateButton = (template, variant = "custom") => {
    const isSlideTemplate = variant === "slide-template";
    const Icon = isSlideTemplate ? template.icon || LayoutGrid : FileText;
    const iconClassName = isSlideTemplate ? "text-violet-500" : "text-sky-600";

    return (
      <button
        key={template.id || template.key}
        type="button"
        className="w-full flex items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/60 transition-colors group"
        onClick={() =>
          isSlideTemplate ? handleTemplateInsert(template) : handleUserTemplateInsert(template)
        }
      >
        <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconClassName}`} />
        <div className="min-w-0">
          <p className="text-[11px] font-medium truncate">
            {isSlideTemplate ? template.label : template.title}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {isSlideTemplate
              ? template.description
              : template.description || `${getBlockTemplateBaseTypeLabel(template)} variant`}
          </p>
        </div>
      </button>
    );
  };

  return (
    <Sidebar collapsible="icon" {...props} ref={setNodeRef}>
      <SidebarHeader className="flex items-center justify-center px-4 py-2 border-b h-16">
        <a
          href="/"
          className="flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          title="Go to Home"
        >
          {showFullContent ? (
            <Logo />
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </a>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {readonlyStructure ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <Lock className="h-6 w-6 text-muted-foreground/50" />
              {showFullContent && (
                <>
                  <p className="text-xs font-medium text-muted-foreground">{readonlyTitle}</p>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                    {readonlyDescription}
                  </p>
                </>
              )}
            </div>
          ) : !showFullContent ? (
            <TooltipProvider>
              <div className="flex flex-col items-center gap-2 px-1 py-2">
                {menuCategories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <Tooltip key={category.key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          onClick={() => openCategoryFromCollapsedRail(category.key)}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        <p>{category.title}</p>
                        <p className="text-[10px] text-muted-foreground">Open category</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          ) : (
            <div className="flex h-full flex-col">
              <div className="sticky top-0 z-10 border-b bg-sidebar/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={menuSearch}
                    onChange={(event) => setMenuSearch(event.target.value)}
                    placeholder="Find block, variant, or template"
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <p className="px-1 pt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Category → Group → Block → Variant
                </p>
                {isLoadingBlockTemplates && (
                  <p className="px-1 pt-1 text-[10px] text-muted-foreground">
                    Loading saved block variants...
                  </p>
                )}
              </div>

              <div className="px-2 py-2">
                {filteredMenuCategories.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border/70 px-3 py-6 text-center text-xs text-muted-foreground">
                    No blocks or templates match your search.
                  </div>
                ) : (
                  <Accordion
                    type="multiple"
                    value={accordionValue}
                    onValueChange={setOpenCategories}
                    className="w-full"
                  >
                    {filteredMenuCategories.map((category) => {
                      const CategoryIcon = category.icon;

                      return (
                        <AccordionItem key={category.key} value={category.key} className="border-b border-border/70">
                          <AccordionTrigger className="px-2 py-3 hover:no-underline">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium leading-none">{category.title}</p>
                                <p className="pt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                  {category.sections.length} section{category.sections.length === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3">
                            <div className="space-y-4 px-1">
                              {category.sections.map((section) => (
                                <div key={section.key} className="space-y-2">
                                  <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {section.title}
                                  </div>

                                  {section.templates ? (
                                    <div className="ml-3 border-l border-border/60 pl-3 space-y-1">
                                      {section.templates.map((template) =>
                                        renderTemplateButton(template, "slide-template")
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      {section.items.map((item) => {
                                        const visibleTemplates = item.visibleTemplates || [];
                                        const variantOpen = item.forceVariantOpen || Boolean(openVariantBlocks[item.key]);

                                        return (
                                          <div key={item.key} className="space-y-1">
                                            <div className="flex items-center gap-1">
                                              <div className="min-w-0 flex-1">
                                                <DraggableItem
                                                  id={item.key}
                                                  title={item.title}
                                                  icon={item.icon}
                                                  isCollapsed={false}
                                                  isMobile={isMobile}
                                                  onDoubleClick={handleDoubleClickAdd}
                                                />
                                              </div>

                                              {visibleTemplates.length > 0 && (
                                                <button
                                                  type="button"
                                                  className="mr-2 flex h-7 items-center gap-1 rounded-md px-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                  onClick={() => toggleVariantBlock(item.key)}
                                                >
                                                  <span className="rounded-full border border-border/70 px-1.5 py-0.5 leading-none">
                                                    {visibleTemplates.length}
                                                  </span>
                                                  <ChevronRight
                                                    className={`h-3.5 w-3.5 transition-transform ${variantOpen ? "rotate-90" : ""}`}
                                                  />
                                                </button>
                                              )}
                                            </div>

                                            {visibleTemplates.length > 0 && (
                                              <Collapsible open={variantOpen}>
                                                <CollapsibleContent>
                                                  <div className="ml-8 mr-4 border-l border-border/60 pl-3 space-y-1">
                                                    {visibleTemplates.map((template) =>
                                                      renderTemplateButton(template)
                                                    )}
                                                  </div>
                                                </CollapsibleContent>
                                              </Collapsible>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
