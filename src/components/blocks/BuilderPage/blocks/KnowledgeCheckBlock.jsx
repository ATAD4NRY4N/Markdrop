import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function KnowledgeCheckBlock({ block, onUpdate }) {
  const [previewSelected, setPreviewSelected] = useState(null);
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  const options = block.options || ["", "", ""];
  const correctIndex = block.correctIndex ?? 0;

  const updateOption = (i, val) => {
    const updated = options.map((o, idx) => (idx === i ? val : o));
    onUpdate(block.id, { ...block, options: updated });
  };

  const addOption = () => onUpdate(block.id, { ...block, options: [...options, ""] });

  const removeOption = (i) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, idx) => idx !== i);
    onUpdate(block.id, {
      ...block,
      options: updated,
      correctIndex: correctIndex >= updated.length ? 0 : correctIndex,
    });
  };

  const previewIsCorrect = previewSelected === correctIndex;

  return (
    <div className="rounded-md border border-sky-500 border-l-4 bg-sky-50/20 dark:bg-sky-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <HelpCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          Knowledge Check
        </span>
        <span className="text-xs text-muted-foreground">(no scoring)</span>
      </div>

      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <Textarea
            value={block.prompt || ""}
            onChange={(e) => onUpdate(block.id, { ...block, prompt: e.target.value })}
            placeholder="Ask a quick comprehension question…"
            className="min-h-[56px] text-sm resize-none bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Options (circle = correct)</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdate(block.id, { ...block, correctIndex: i })}
                className={cn(
                  "h-5 w-5 rounded-full border-2 shrink-0 transition-colors",
                  i === correctIndex
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-muted-foreground/40 hover:border-muted-foreground"
                )}
              />
              <Input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-muted-foreground"
            onClick={addOption}
            disabled={options.length >= 6}
          >
            + Add option
          </Button>
        </div>

        {/* Inline mini-preview */}
        {block.prompt && (
          <div className="rounded border border-border/40 bg-background/60 p-2 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Learner preview</p>
            <p className="text-sm">{block.prompt}</p>
            <div className="space-y-1">
              {options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPreviewSelected(i);
                    setPreviewSubmitted(true);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full rounded px-2 py-1.5 text-xs text-left border transition-colors",
                    previewSubmitted && i === correctIndex
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : previewSubmitted && previewSelected === i
                        ? "border-red-500 bg-red-50/40 dark:bg-red-950/20"
                        : previewSelected === i
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-muted-foreground/40"
                  )}
                >
                  {opt || `Option ${i + 1}`}
                </button>
              ))}
            </div>
            {previewSubmitted && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  setPreviewSelected(null);
                  setPreviewSubmitted(false);
                }}
              >
                Reset preview
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
