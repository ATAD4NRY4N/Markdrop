import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  CheckSquare,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
      className={`flex items-center gap-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors cursor-grab active:cursor-grabbing ${itemClasses}`}
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
  const isDarkMode = theme === "dark";
  const [userBlockTemplates, setUserBlockTemplates] = useState([]);
  const [isLoadingBlockTemplates, setIsLoadingBlockTemplates] = useState(false);

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

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // On mobile, always show full content when sidebar is open
  const showFullContent = !isCollapsed || isMobile;

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
          ) : (
          <TooltipProvider>
            <div className="space-y-4 py-2">
              {Object.entries(data).map(([section, items], i, arr) => (
                <div key={section}>
                  {showFullContent && (
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      {section}
                    </div>
                  )}

                  {items.map((item) => {
                    const matchingTemplates = userTemplatesByBlockType[item.key] || [];

                    return (
                      <div key={item.key}>
                        <DraggableItem
                          id={item.key}
                          title={item.title}
                          icon={item.icon}
                          isCollapsed={isCollapsed}
                          isMobile={isMobile}
                          onDoubleClick={handleDoubleClickAdd}
                        />

                        {showFullContent && matchingTemplates.length > 0 && (
                          <div className="ml-8 mr-4 mt-1 border-l border-border/60 pl-3 space-y-1">
                            {matchingTemplates.map((template) => (
                              <button
                                key={template.id}
                                type="button"
                                className="w-full flex items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/60 transition-colors group"
                                onClick={() => handleUserTemplateInsert(template)}
                              >
                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-medium truncate">{template.title}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {template.description || `${getBlockTemplateBaseTypeLabel(template)} variant`}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!showFullContent && i < arr.length - 1 && (
                    <div className="px-3">
                      <Separator className="my-2 opacity-40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TooltipProvider>
          )}

          {/* Slide Templates section */}
          {showFullContent && !readonlyStructure && (
            <div className="mt-2 border-t pt-3 pb-2">
              {isLoadingBlockTemplates && (
                <p className="px-4 py-2 text-[11px] text-muted-foreground">
                  Loading saved block variants...
                </p>
              )}

              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Slide Templates
              </div>
              <div className="px-2 space-y-1 mt-1">
                {SLIDE_TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <TooltipProvider key={tpl.key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="w-full flex items-start gap-2 px-2 py-2 rounded-md text-left hover:bg-muted/60 transition-colors group"
                            onClick={() => handleTemplateInsert(tpl)}
                          >
                            <Icon className="h-4 w-4 mt-0.5 shrink-0 text-violet-500" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{tpl.label}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{tpl.description}</p>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          Click to insert {tpl.blocks.length} blocks
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
