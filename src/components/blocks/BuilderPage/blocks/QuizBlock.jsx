import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function QuizBlock({ block, onUpdate }) {
  const question = block.question || "";
  const options = block.options || [
    { id: "1", text: "", correct: false },
    { id: "2", text: "", correct: false },
    { id: "3", text: "", correct: false },
    { id: "4", text: "", correct: false },
  ];
  const explanation = block.explanation || "";

  const update = (changes) => onUpdate(block.id, { ...block, ...changes });

  const updateOption = (id, changes) =>
    update({ options: options.map((o) => (o.id === id ? { ...o, ...changes } : o)) });

  const addOption = () =>
    update({ options: [...options, { id: Date.now().toString(), text: "", correct: false }] });

  const removeOption = (id) => {
    if (options.length <= 2) return;
    update({ options: options.filter((o) => o.id !== id) });
  };

  return (
    <div className="rounded-md border border-violet-500/50 bg-violet-50/20 dark:bg-violet-950/10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-violet-500/30 bg-violet-50/30 dark:bg-violet-950/20">
        <HelpCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          Quiz
        </span>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <Input
            value={question}
            onChange={(e) => update({ question: e.target.value })}
            placeholder="Enter your question..."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Options</Label>
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateOption(opt.id, { correct: !opt.correct })}
                className="shrink-0"
                title={opt.correct ? "Correct" : "Incorrect"}
              >
                {opt.correct ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              <Input
                value={opt.text}
                onChange={(e) => updateOption(opt.id, { text: e.target.value })}
                placeholder={`Option...`}
                className="h-7 text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => removeOption(opt.id)}
                className="text-destructive shrink-0"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={addOption}>
            + Add option
          </Button>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Explanation (optional)</Label>
          <Textarea
            value={explanation}
            onChange={(e) => update({ explanation: e.target.value })}
            placeholder="Explain the correct answer..."
            className="min-h-[60px] text-sm resize-none border-border"
          />
        </div>
      </div>
    </div>
  );
}
