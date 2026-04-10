import { Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function ProgressMarkerBlock({ block, onUpdate }) {
  const percent = block.percent ?? 0;
  const update = (changes) => onUpdate(block.id, { ...block, ...changes });

  return (
    <div className="rounded-md border border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20">
        <Flag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
          Progress Marker
        </span>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            value={block.label || ""}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Module complete..."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Progress</Label>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{percent}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[percent]}
            onValueChange={([v]) => update({ percent: v })}
          />
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
