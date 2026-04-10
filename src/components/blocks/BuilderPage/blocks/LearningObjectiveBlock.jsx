import { Target } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function LearningObjectiveBlock({ block, onUpdate }) {
  return (
    <div className="rounded-md border border-teal-500/50 bg-teal-50/20 dark:bg-teal-950/10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-teal-500/30 bg-teal-50/30 dark:bg-teal-950/20">
        <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
          Learning Objective
        </span>
      </div>
      <Textarea
        value={block.content || ""}
        onChange={(e) => onUpdate(block.id, { ...block, content: e.target.value })}
        placeholder="Students will be able to..."
        className="min-h-[80px] w-full resize-y border-0 bg-transparent p-3 text-sm leading-relaxed focus-visible:ring-0"
      />
    </div>
  );
}
