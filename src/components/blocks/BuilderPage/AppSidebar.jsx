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
  MessageSquareCode,
  Minus,
  Network,
  ListOrdered as OrderedList,
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
import { useEffect, useState } from "react";
import markdropIconDark from "@/assets/markdrop_icon_dark.svg";
import markdropIconLight from "@/assets/markdrop_icon_light.svg";
import markdropLogoDark from "@/assets/markdrop_logo_dark.svg";
import markdropLogoLight from "@/assets/markdrop_logo_light.svg";
import { useTheme } from "@/components/ThemeProvider";
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

export default function AppSidebar({ onBlockAdd, presentationMode = false, ...props }) {
  const { setNodeRef } = useDroppable({ id: "sidebar" });
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // ── Slide Templates ─────────────────────────────────────────────────────
  const SLIDE_TEMPLATES = [
    {
      key: "title-slide",
      label: "Title Slide",
      description: "Course title, subtitle, intro paragraph",
      icon: LayoutGrid,
      blocks: [
        { type: "h1", content: "Course Title" },
        { type: "h3", content: "Subtitle or tagline" },
        { type: "separator", content: "" },
        { type: "paragraph", content: "Welcome to this course. In this module you will learn…" },
        {
          type: "learning-objective",
          content: "",
          objectives: ["Learners will be able to…", "Identify key concepts of…"],
        },
      ],
    },
    {
      key: "two-column",
      label: "Two-Column",
      description: "Text left, image right (2:1)",
      icon: Columns2,
      blocks: [
        { type: "h2", content: "Section Title" },
        {
          type: "grid",
          content: "",
          columns: [
            { type: "text", content: "### Key Point\n\nExplain this concept in detail. Use **bold** for emphasis, bullet points for lists:\n\n- First takeaway\n- Second takeaway\n- Third takeaway" },
            { type: "image", content: "" },
          ],
          weights: [2, 1],
        },
      ],
    },
    {
      key: "quote-focus",
      label: "Quote Focus",
      description: "Pull quote + supporting paragraph",
      icon: Quote,
      blocks: [
        { type: "h2", content: "Key Insight" },
        { type: "blockquote", content: "The most powerful tool we have as developers is automation. — Scott Hanselman" },
        { type: "paragraph", content: "Expand on the quote here. Explain why it matters in the context of this course and how learners can apply this insight." },
        {
          type: "knowledge-check",
          content: "",
          prompt: "What does this quote highlight about…?",
          options: ["Option A", "Option B", "Option C"],
          correctIndex: 0,
        },
      ],
    },
    {
      key: "three-step-timeline",
      label: "3-Step Timeline",
      description: "Three sequential steps in columns",
      icon: Layers,
      blocks: [
        { type: "h2", content: "Three-Step Process" },
        {
          type: "grid",
          content: "",
          columns: [
            { type: "text", content: "**Step 1: Discover**\n\nDescribe the first step in the process." },
            { type: "text", content: "**Step 2: Design**\n\nDescribe the second step in the process." },
            { type: "text", content: "**Step 3: Deliver**\n\nDescribe the third step in the process." },
          ],
          weights: [1, 1, 1],
        },
        { type: "paragraph", content: "Summarise the process and what learners should do next." },
      ],
    },
  ];

  const handleTemplateInsert = (template) => {
    if (!onBlockAdd) return;
    template.blocks.forEach((blockData) => {
      onBlockAdd(null, { id: Date.now().toString() + Math.random().toString(36).slice(2), ...blockData });
    });
  };

  const handleDoubleClickAdd = (blockType) => {
    if (!onBlockAdd) return;

    const defaultContent = {
      h1: "Heading 1",
      h2: "Heading 2",
      h3: "Heading 3",
      h4: "Heading 4",
      h5: "Heading 5",
      h6: "Heading 6",
      paragraph: "",
      blockquote: "",
      code: "```javascript\n// Your code here\n```",
      math: "$\\sqrt{3x-1}+(1+x)^2$",
      diagram: "```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;\n```",
      alert: "Useful information that users should know, even when skimming content.",
      ul: "- Item 1\n- Item 2\n- Item 3",
      ol: "1. First item\n2. Second item\n3. Third item",
      "task-list": "- [ ] Task 1\n- [x] Task 2\n- [ ] Task 3",
      separator: "",
      image: "",
      video: "",
      link: "",
      table: "| Header 1 | Header 2 |\n|----------|----------|\n| Add text..   | Add text..   |",
      "shield-badge": "",
      "skill-icons": "",
      "typing-svg": "",
      "github-profile-cards": "",
      // MARP blocks
      "marp-frontmatter": "",
      slide: "",
      "marp-slide-directive": "",
      "marp-bg-image": "",
      "marp-style": "",
    };

    const newBlock = {
      id: Date.now().toString(),
      type: blockType,
      content: defaultContent[blockType] || "",
      ...(blockType === "image" && {
        alt: "",
        width: "",
        height: "",
        align: "left",
      }),
      ...(blockType === "video" && { title: "" }),
      ...(blockType === "link" && { url: "" }),
      ...(blockType === "shield-badge" && {
        label: "build",
        message: "passing",
        badgeColor: "brightgreen",
        style: "flat",
        logo: "",
      }),
      ...(blockType === "skill-icons" && {
        icons: "js,html,css",
        theme: "dark",
        perLine: "15",
      }),
      ...(blockType === "typing-svg" && {
        lines: ["Hi there! I'm a developer 👋"],
        font: "Fira Code",
        size: "28",
        duration: "3000",
        pause: "1000",
        color: "00FFB3",
        center: true,
        vCenter: true,
        width: "900",
        height: "80",
      }),
      ...(blockType === "github-profile-cards" && {
        username: "",
        align: "left",
        cards: [
          {
            cardType: "profile-details",
            theme: "material_palenight",
            utcOffset: "8",
            height: "",
            width: "",
          },
        ],
      }),
      ...(blockType === "alert" && {
        alertType: "note",
      }),
      // MARP block defaults
      ...(blockType === "marp-frontmatter" && {
        theme: "default",
        size: "16:9",
        paginate: false,
        header: "",
        footer: "",
        backgroundColor: "",
        color: "",
      }),
      ...(blockType === "marp-slide-directive" && {
        directives: [{ key: "_class", value: "" }],
      }),
      ...(blockType === "marp-bg-image" && {
        position: "bg",
        opacity: "",
      }),
      // eLearning block defaults
      ...(blockType === "grid" && {
        columns: [
          { id: "nc_init_0", blocks: [{ id: "nb_init_0", type: "h2", content: "" }, { id: "nb_init_1", type: "paragraph", content: "" }] },
          { id: "nc_init_1", blocks: [{ id: "nb_init_2", type: "h2", content: "" }, { id: "nb_init_3", type: "paragraph", content: "" }] },
        ],
        weights: null,
      }),
      // eLearning block defaults
      ...(blockType === "learning-objective" && {
        objectives: ["Learners will be able to…"],
      }),
      ...(blockType === "quiz" && {
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
      }),
      ...(blockType === "knowledge-check" && {
        prompt: "",
        options: ["", "", ""],
        correctIndex: 0,
      }),
      ...(blockType === "flashcard" && {
        front: "",
        back: "",
      }),
      ...(blockType === "progress-marker" && {
        label: "Progress checkpoint",
      }),
      ...(blockType === "course-nav" && {
        prevLabel: "← Previous",
        nextLabel: "Next →",
        locked: false,
        position: "bottom",
        showProgress: false,
      }),
      ...(blockType === "branching" && {
        prompt: "",
        choices: [
          { id: "c1", label: "" },
          { id: "c2", label: "" },
        ],
      }),
      ...(blockType === "time-requirements" && {
        requiredMinutes: 2,
        showProgress: true,
        hideOnCompleted: false,
      }),
      ...(blockType === "categorization" && {
        prompt: "Sort the following items into the correct categories:",
        mode: "checklist",
        categories: [
          { id: "cat-1", label: "Category A" },
          { id: "cat-2", label: "Category B" },
        ],
        items: [
          { id: "item-1", content: "", categoryId: "cat-1" },
          { id: "item-2", content: "", categoryId: "cat-2" },
          { id: "item-3", content: "", categoryId: "cat-1" },
          { id: "item-4", content: "", categoryId: "cat-2" },
        ],
      }),
      ...(blockType === "carousel" && {
        images: [{ url: "", alt: "", caption: "" }],
        autoPlay: false,
        interval: 3000,
        showDots: true,
      }),
      ...(blockType === "pdf" && {
        url: "",
        title: "",
        height: "500px",
        showDownload: true,
      }),
      ...(blockType === "fill-in-the-blank" && {
        sentence: "The ___ is the powerhouse of the cell.",
        answers: ["mitochondria"],
        caseSensitive: false,
        feedbackCorrect: "\u2713 Correct! Well done.",
        feedbackIncorrect: "\u2717 Not quite \u2014 review and try again.",
      }),
      ...(blockType === "matching" && {
        prompt: "Match each term to its correct definition:",
        pairs: [
          { id: "p1", term: "Term 1", definition: "Definition A" },
          { id: "p2", term: "Term 2", definition: "Definition B" },
          { id: "p3", term: "Term 3", definition: "Definition C" },
        ],
      }),
      ...(blockType === "hotspot" && {
        imageUrl: "",
        alt: "",
        hotspots: [],
      }),
    };


    // Add the block using the existing onBlockAdd function structure
    // We need to modify the Builder's handleBlockAdd to accept a block object
    onBlockAdd(null, newBlock);
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
            <img
              src={isDarkMode ? markdropLogoDark : markdropLogoLight}
              alt="Markdrop"
              className="h-8 w-auto"
            />
          ) : (
            <img
              src={isDarkMode ? markdropIconDark : markdropIconLight}
              alt="Markdrop"
              className="h-6 w-6"
            />
          )}
        </a>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <TooltipProvider>
            <div className="space-y-4 py-2">
              {Object.entries(data).map(([section, items], i, arr) => (
                <div key={section}>
                  {showFullContent && (
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                      {section}
                    </div>
                  )}

                  {items.map((item) => (
                    <DraggableItem
                      key={item.key}
                      id={item.key}
                      title={item.title}
                      icon={item.icon}
                      isCollapsed={isCollapsed}
                      isMobile={isMobile}
                      onDoubleClick={handleDoubleClickAdd}
                    />
                  ))}

                  {!showFullContent && i < arr.length - 1 && (
                    <div className="px-3">
                      <Separator className="my-2 opacity-40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TooltipProvider>

          {/* Slide Templates section */}
          {showFullContent && (
            <div className="mt-2 border-t pt-3 pb-2">
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
