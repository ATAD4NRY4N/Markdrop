import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CourseNavBlock({ block, onUpdate }) {
  const prevLabel = block.prevLabel || "← Previous";
  const nextLabel = block.nextLabel || "Next →";
  const locked = block.locked ?? false;
  const position = block.position || "bottom";
  const showProgress = block.showProgress ?? false;

  return (
    <div className="rounded-md border border-border bg-background/60 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Course Navigation</span>
        <div className="ml-auto flex items-center gap-3">
          <Label className="text-xs text-muted-foreground cursor-pointer" htmlFor={`lock-${block.id}`}>
            Require quiz pass
          </Label>
          <Switch
            id={`lock-${block.id}`}
            checked={locked}
            onCheckedChange={(v) => onUpdate(block.id, { ...block, locked: v })}
          />
        </div>
      </div>

      {/* Settings row */}
      <div className="px-3 py-2 flex items-center gap-3 border-b border-border/40 bg-muted/5">
        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Position</Label>
          <Select
            value={position}
            onValueChange={(v) => onUpdate(block.id, { ...block, position: v })}
          >
            <SelectTrigger className="h-6 w-24 text-xs bg-muted/20 border-0 focus:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom" className="text-xs">Bottom</SelectItem>
              <SelectItem value="top" className="text-xs">Top</SelectItem>
              <SelectItem value="both" className="text-xs">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Label className="text-xs text-muted-foreground cursor-pointer" htmlFor={`prog-${block.id}`}>
            Progress bar
          </Label>
          <Switch
            id={`prog-${block.id}`}
            checked={showProgress}
            onCheckedChange={(v) => onUpdate(block.id, { ...block, showProgress: v })}
          />
        </div>
      </div>

      <div className="p-3 flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-muted-foreground">Previous button label</Label>
          <Input
            value={prevLabel}
            onChange={(e) => onUpdate(block.id, { ...block, prevLabel: e.target.value })}
            className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-muted-foreground">Next button label</Label>
          <Input
            value={nextLabel}
            onChange={(e) => onUpdate(block.id, { ...block, nextLabel: e.target.value })}
            className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Preview */}
      {showProgress && (
        <div className="px-3 pb-1">
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-primary/50 transition-all" />
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-right mt-0.5">Progress bar (approx.)</p>
        </div>
      )}
      <div className="px-3 pb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {prevLabel}
        </button>
        <span className="text-xs text-muted-foreground opacity-50">
          {position === "top" ? "top" : position === "both" ? "top + bottom" : "bottom"}
        </span>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/5 text-sm text-primary hover:bg-primary/10 transition-colors"
        >
          {locked && <Lock className="h-3.5 w-3.5" />}
          {nextLabel}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
