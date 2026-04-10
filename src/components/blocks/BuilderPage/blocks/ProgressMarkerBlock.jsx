import { Flag } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProgressMarkerBlock({ block, onUpdate }) {
  return (
    <div className="relative py-2 flex items-center gap-3 select-none">
      <div className="flex-1 border-t-2 border-dashed border-orange-400/40" />
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-400/30 shrink-0">
        <Flag className="h-3.5 w-3.5 text-orange-500/70" />
        <Input
          value={block.label || ""}
          onChange={(e) => onUpdate(block.id, { ...block, label: e.target.value })}
          placeholder="Progress checkpoint"
          className="h-5 w-36 text-xs bg-transparent border-0 focus-visible:ring-0 p-0 text-orange-700 dark:text-orange-300 placeholder:text-orange-400/60"
        />
      </div>
      <div className="flex-1 border-t-2 border-dashed border-orange-400/40" />
    </div>
  );
}
