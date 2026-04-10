import { Layers } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FlashcardBlock({ block, onUpdate }) {
  const update = (changes) => onUpdate(block.id, { ...block, ...changes });

  return (
    <div className="rounded-md border border-sky-500/50 bg-sky-50/20 dark:bg-sky-950/10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-sky-500/30 bg-sky-50/30 dark:bg-sky-950/20">
        <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
          Flashcard
        </span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Front</Label>
          <Textarea
            value={block.front || ""}
            onChange={(e) => update({ front: e.target.value })}
            placeholder="Question or term..."
            className="min-h-[80px] text-sm resize-none border-border"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Back</Label>
          <Textarea
            value={block.back || ""}
            onChange={(e) => update({ back: e.target.value })}
            placeholder="Answer or definition..."
            className="min-h-[80px] text-sm resize-none border-border"
          />
        </div>
      </div>
    </div>
  );
}
