import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FlashcardBlock({ block, onUpdate }) {
  const [flipped, setFlipped] = useState(false);

  const front = block.front || "";
  const back = block.back || "";

  return (
    <div className="rounded-md border border-amber-500 border-l-4 bg-amber-50/20 dark:bg-amber-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Flashcard
        </span>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Front</Label>
          <Textarea
            value={front}
            onChange={(e) => onUpdate(block.id, { ...block, front: e.target.value })}
            placeholder="Term, concept, or question…"
            className="min-h-[72px] text-sm resize-none bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Back</Label>
          <Textarea
            value={back}
            onChange={(e) => onUpdate(block.id, { ...block, back: e.target.value })}
            placeholder="Definition, answer, or explanation…"
            className="min-h-[72px] text-sm resize-none bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Preview card */}
      {(front || back) && (
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => setFlipped((v) => !v)}
            className="w-full rounded-md border border-amber-400/40 bg-background hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors p-4 text-left relative min-h-[64px] flex flex-col justify-center"
          >
            <span className="absolute top-2 right-2 text-[10px] text-muted-foreground/60">
              {flipped ? "back" : "front"} — click to flip
            </span>
            <p className="text-sm">{flipped ? back || "(Back is empty)" : front || "(Front is empty)"}</p>
          </button>
        </div>
      )}
    </div>
  );
}
