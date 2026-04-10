import { CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function KnowledgeCheckBlock({ block, onUpdate }) {
  const update = (changes) => onUpdate(block.id, { ...block, ...changes });

  return (
    <div className="rounded-md border border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20">
        <CheckSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
          Knowledge Check
        </span>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <Input
            value={block.question || ""}
            onChange={(e) => update({ question: e.target.value })}
            placeholder="What is...?"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Answer</Label>
          <Input
            value={block.answer || ""}
            onChange={(e) => update({ answer: e.target.value })}
            placeholder="Correct answer..."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Hint (optional)</Label>
          <Textarea
            value={block.hint || ""}
            onChange={(e) => update({ hint: e.target.value })}
            placeholder="Give learners a hint..."
            className="min-h-[60px] text-sm resize-none border-border"
          />
        </div>
      </div>
    </div>
  );
}
