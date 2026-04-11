import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clapperboard, Copy, GripVertical, Trash2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import AlertBlock from "./blocks/AlertBlock";
import BlockquoteBlock from "./blocks/BlockquoteBlock";
import BranchingBlock from "./blocks/BranchingBlock";
import CategorizationBlock from "./blocks/CategorizationBlock";
import CodeBlock from "./blocks/CodeBlock";
import CourseNavBlock from "./blocks/CourseNavBlock";
import DiagramBlock from "./blocks/DiagramBlock";
import FlashcardBlock from "./blocks/FlashcardBlock";
import GithubProfileCardsBlock from "./blocks/GithubProfileCardsBlock";
import GridBlock from "./blocks/GridBlock";
import HeadingBlock from "./blocks/HeadingBlock";
import ImageBlock from "./blocks/ImageBlock";
import KnowledgeCheckBlock from "./blocks/KnowledgeCheckBlock";
import LearningObjectiveBlock from "./blocks/LearningObjectiveBlock";
import LinkBlock from "./blocks/LinkBlock";
import ListBlock from "./blocks/ListBlock";
import MarpBgImageBlock from "./blocks/MarpBgImageBlock";
import MarpFrontmatterBlock from "./blocks/MarpFrontmatterBlock";
import MarpSlideDirectiveBlock from "./blocks/MarpSlideDirectiveBlock";
import MarpStyleBlock from "./blocks/MarpStyleBlock";
import MathBlock from "./blocks/MathBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import ProgressMarkerBlock from "./blocks/ProgressMarkerBlock";
import QuizBlock from "./blocks/QuizBlock";
import SeparatorBlock from "./blocks/SeparatorBlock";
import ShieldBadgeBlock from "./blocks/ShieldBadgeBlock";
import SkillIconsBlock from "./blocks/SkillIconsBlock";
import SlideBlock from "./blocks/SlideBlock";
import TableBlock from "./blocks/TableBlock";
import TimeRequirementsBlock from "./blocks/TimeRequirementsBlock";
import TypingSvgBlock from "./blocks/TypingSvgBlock";
import VideoBlock from "./blocks/VideoBlock";

const ANIMATION_TYPES = [
  { value: "none", label: "None" },
  { value: "fadeIn", label: "Fade In" },
  { value: "fadeInUp", label: "Fade In Up" },
  { value: "slideInLeft", label: "Slide In Left" },
  { value: "slideInRight", label: "Slide In Right" },
  { value: "zoomIn", label: "Zoom In" },
];

// Block types that don't benefit from per-block animation (MARP presentation controls)
const NO_ANIMATION_TYPES = new Set([
  "marp-frontmatter",
  "slide",
  "marp-slide-directive",
  "marp-bg-image",
  "marp-style",
  "progress-marker",
  "course-nav",
]);

function AnimationPopover({ block, onUpdate }) {
  const [open, setOpen] = useState(false);
  const anim = block.animation || { type: "none", duration: 0.5, delay: 0 };

  const handleAnimChange = (field, value) => {
    onUpdate(block.id, {
      ...block,
      animation: { ...anim, [field]: value },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 md:h-7 md:w-7 touch-manipulation ${anim.type !== "none" ? "text-primary" : ""}`}
          title="Animation"
        >
          <Clapperboard className="h-4 w-4 md:h-3.5 md:w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="w-60 p-3 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold">Block Animation</p>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select value={anim.type} onValueChange={(v) => handleAnimChange("type", v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANIMATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {anim.type !== "none" && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <span className="text-xs text-muted-foreground">
                  {(anim.duration ?? 0.5).toFixed(1)}s
                </span>
              </div>
              <Slider
                min={0.3}
                max={1.5}
                step={0.1}
                value={[anim.duration ?? 0.5]}
                onValueChange={([v]) => handleAnimChange("duration", v)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Delay</Label>
                <span className="text-xs text-muted-foreground">
                  {(anim.delay ?? 0).toFixed(1)}s
                </span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[anim.delay ?? 0]}
                onValueChange={([v]) => handleAnimChange("delay", v)}
              />
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

const MarkdownBlock = memo(function MarkdownBlock({
  block,
  onUpdate,
  onDelete,
  onBlockAdd,
  onCopy,
  slideNumber,
  totalSlides,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const handleDelete = useCallback(() => {
    onDelete(block.id);
  }, [onDelete, block.id]);

  const handleCopy = useCallback(() => {
    if (typeof onCopy === "function") onCopy(block.id);
  }, [onCopy, block.id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const renderBlock = () => {
    const headingTypes = ["h1", "h2", "h3", "h4", "h5", "h6"];
    const listTypes = ["ul", "ol", "task-list"];

    if (headingTypes.includes(block.type)) {
      return <HeadingBlock block={block} onUpdate={onUpdate} />;
    }

    switch (block.type) {
      case "paragraph":
        return <ParagraphBlock block={block} onUpdate={onUpdate} />;
      case "blockquote":
        return <BlockquoteBlock block={block} onUpdate={onUpdate} />;
      case "alert":
        return <AlertBlock block={block} onUpdate={onUpdate} />;
      case "code":
        return <CodeBlock block={block} onUpdate={onUpdate} />;
      case "math":
        return <MathBlock block={block} onUpdate={onUpdate} />;
      case "diagram":
        return <DiagramBlock block={block} onUpdate={onUpdate} />;
      case "separator":
        return <SeparatorBlock />;
      case "image":
        return <ImageBlock block={block} onUpdate={onUpdate} />;
      case "video":
        return <VideoBlock block={block} onUpdate={onUpdate} />;
      case "link":
        return <LinkBlock block={block} onUpdate={onUpdate} />;
      case "table":
        return <TableBlock block={block} onUpdate={onUpdate} />;
      case "shield-badge":
        return <ShieldBadgeBlock block={block} onUpdate={onUpdate} />;
      case "skill-icons":
        return <SkillIconsBlock block={block} onUpdate={onUpdate} />;
      case "typing-svg":
        return <TypingSvgBlock block={block} onUpdate={onUpdate} />;
      case "github-profile-cards":
        return <GithubProfileCardsBlock block={block} onUpdate={onUpdate} />;
      // eLearning blocks
      case "learning-objective":
        return <LearningObjectiveBlock block={block} onUpdate={onUpdate} />;
      case "quiz":
        return <QuizBlock block={block} onUpdate={onUpdate} />;
      case "knowledge-check":
        return <KnowledgeCheckBlock block={block} onUpdate={onUpdate} />;
      case "flashcard":
        return <FlashcardBlock block={block} onUpdate={onUpdate} />;
      case "grid":
        return <GridBlock block={block} onUpdate={onUpdate} />;
      case "progress-marker":
        return <ProgressMarkerBlock block={block} onUpdate={onUpdate} />;
      case "course-nav":
        return <CourseNavBlock block={block} onUpdate={onUpdate} />;
      case "branching":
        return <BranchingBlock block={block} onUpdate={onUpdate} />;
      case "time-requirements":
        return <TimeRequirementsBlock block={block} onUpdate={onUpdate} />;
      case "categorization":
        return <CategorizationBlock block={block} onUpdate={onUpdate} />;
      // MARP-specific blocks
      case "marp-frontmatter":
        return <MarpFrontmatterBlock block={block} onUpdate={onUpdate} />;
      case "slide":
        return <SlideBlock slideNumber={slideNumber} totalSlides={totalSlides} />;
      case "marp-slide-directive":
        return <MarpSlideDirectiveBlock block={block} onUpdate={onUpdate} />;
      case "marp-bg-image":
        return <MarpBgImageBlock block={block} onUpdate={onUpdate} />;
      case "marp-style":
        return <MarpStyleBlock block={block} onUpdate={onUpdate} />;
      default:
        if (listTypes.includes(block.type)) {
          return <ListBlock block={block} onUpdate={onUpdate} />;
        }
        return <ParagraphBlock block={block} onUpdate={onUpdate} />;
    }
  };

  // Slide blocks render as full-width separators without the side controls
  if (block.type === "slide") {
    return (
      <div ref={setNodeRef} style={style} className="relative group">
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-7 md:w-7 cursor-grab active:cursor-grabbing touch-manipulation"
            {...attributes}
            {...listeners}
            style={{ touchAction: "none" }}
          >
            <GripVertical className="h-5 w-5 md:h-4 md:w-4" />
          </Button>
        </div>
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-7 md:w-7 text-destructive hover:text-destructive touch-manipulation"
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
          </Button>
        </div>
        <div className="w-full">{renderBlock()}</div>
      </div>
    );
  }

  return (
    <div className="relative mx-8">
      <div
        ref={setNodeRef}
        style={style}
        className="group relative rounded-lg border border-transparent hover:border-muted-foreground/20 transition-all p-3 touch-manipulation"
      >
        {/* Controls - always visible on mobile, hover on desktop */}
        <div className="absolute -left-8 top-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-7 md:w-7 cursor-grab active:cursor-grabbing touch-manipulation"
            {...attributes}
            {...listeners}
            style={{ touchAction: "none" }}
          >
            <GripVertical className="h-5 w-5 md:h-4 md:w-4" />
          </Button>
        </div>

        <div className="absolute -right-8 top-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          {!NO_ANIMATION_TYPES.has(block.type) && (
            <AnimationPopover block={block} onUpdate={onUpdate} />
          )}
          {typeof onCopy === "function" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-7 md:w-7 touch-manipulation"
              onClick={handleCopy}
              title="Copy block (Ctrl+C)"
            >
              <Copy className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-7 md:w-7 text-destructive hover:text-destructive touch-manipulation"
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
          </Button>
        </div>

        {/* Block content */}
        <div className="w-full block-content">{renderBlock()}</div>
      </div>
    </div>
  );
});

export default MarkdownBlock;
