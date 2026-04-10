import { GitBranch, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function BranchingBlock({ block, onUpdate }) {
  const choices = block.choices || [
    { id: "c1", label: "" },
    { id: "c2", label: "" },
  ];

  const updateChoice = (i, field, value) => {
    const updated = choices.map((c, idx) =>
      idx === i ? { ...c, [field]: value } : c
    );
    onUpdate(block.id, { ...block, choices: updated });
  };

  const addChoice = () => {
    if (choices.length >= 4) return;
    onUpdate(block.id, {
      ...block,
      choices: [...choices, { id: `c${Date.now()}`, label: "" }],
    });
  };

  const removeChoice = (i) => {
    if (choices.length <= 2) return;
    onUpdate(block.id, { ...block, choices: choices.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="rounded-md border border-indigo-500 border-l-4 bg-indigo-50/20 dark:bg-indigo-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <GitBranch className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Branching Scenario
        </span>
      </div>

      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Scenario Prompt</Label>
          <Textarea
            value={block.prompt || ""}
            onChange={(e) => onUpdate(block.id, { ...block, prompt: e.target.value })}
            placeholder="Describe the situation and ask the learner to choose a path…"
            className="min-h-[72px] text-sm resize-none bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Choices (max 4) — link to module via target label
          </Label>
          {choices.map((choice, i) => (
            <div key={choice.id || i} className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                {String.fromCharCode(65 + i)}
              </div>
              <Input
                value={choice.label}
                onChange={(e) => updateChoice(i, "label", e.target.value)}
                placeholder={`Choice ${String.fromCharCode(65 + i)} label…`}
                className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1 flex-1"
              />
              <Input
                value={choice.targetLabel || ""}
                onChange={(e) => updateChoice(i, "targetLabel", e.target.value)}
                placeholder="→ module name"
                className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1 w-28"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeChoice(i)}
                disabled={choices.length <= 2}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {choices.length < 4 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-indigo-600 dark:text-indigo-400"
              onClick={addChoice}
            >
              <Plus className="h-3 w-3 mr-1" /> Add choice
            </Button>
          )}
        </div>

        {/* Preview */}
        {block.prompt && (
          <div className="rounded border border-border/40 bg-background/60 p-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Learner preview</p>
            <p className="text-sm">{block.prompt}</p>
            <div className="grid grid-cols-2 gap-2">
              {choices.map((c, i) => (
                <button
                  key={c.id || i}
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-indigo-400/40 bg-indigo-50/30 dark:bg-indigo-950/20 text-sm hover:bg-indigo-100/40 dark:hover:bg-indigo-950/40 transition-colors text-left"
                >
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {c.label || `Choice ${String.fromCharCode(65 + i)}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
