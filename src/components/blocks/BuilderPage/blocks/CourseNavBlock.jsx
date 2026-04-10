import { Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CourseNavBlock({ block, onUpdate }) {
  const update = (changes) => onUpdate(block.id, { ...block, ...changes });

  return (
    <div className="rounded-md border border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/20">
        <Navigation className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
          Course Navigation
        </span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Previous label</Label>
            <Input
              value={block.prevLabel || ""}
              onChange={(e) => update({ prevLabel: e.target.value })}
              placeholder="← Previous"
              className="h-7 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Previous URL</Label>
            <Input
              value={block.prevUrl || ""}
              onChange={(e) => update({ prevUrl: e.target.value })}
              placeholder="/module-1"
              className="h-7 text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Next label</Label>
            <Input
              value={block.nextLabel || ""}
              onChange={(e) => update({ nextLabel: e.target.value })}
              placeholder="Next →"
              className="h-7 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Next URL</Label>
            <Input
              value={block.nextUrl || ""}
              onChange={(e) => update({ nextUrl: e.target.value })}
              placeholder="/module-3"
              className="h-7 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
