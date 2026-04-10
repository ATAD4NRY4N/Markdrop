import { Plus, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LearningObjectiveBlock({ block, onUpdate }) {
  const objectives = block.objectives || [""];

  const updateObjective = (index, value) => {
    const updated = objectives.map((o, i) => (i === index ? value : o));
    onUpdate(block.id, { ...block, objectives: updated });
  };

  const addObjective = () => {
    onUpdate(block.id, { ...block, objectives: [...objectives, ""] });
  };

  const removeObjective = (index) => {
    const updated = objectives.filter((_, i) => i !== index);
    onUpdate(block.id, { ...block, objectives: updated.length ? updated : [""] });
  };

  return (
    <div className="rounded-md border border-emerald-500 border-l-4 bg-emerald-50/30 dark:bg-emerald-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Learning Objectives
        </span>
      </div>
      <div className="p-3 space-y-2">
        {objectives.map((obj, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">{i + 1}.</span>
            <Input
              value={obj}
              onChange={(e) => updateObjective(i, e.target.value)}
              placeholder="Learners will be able to…"
              className="h-8 text-sm bg-transparent border-0 border-b border-border/40 rounded-none focus-visible:ring-0 focus-visible:border-emerald-500 px-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeObjective(i)}
              disabled={objectives.length === 1 && obj === ""}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 px-2"
          onClick={addObjective}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Objective
        </Button>
      </div>
    </div>
  );
}
