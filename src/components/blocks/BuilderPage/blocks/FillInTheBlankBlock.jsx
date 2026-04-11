import { PenLine, RotateCcw, ToggleLeft, ToggleRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Learner Interactive View ─────────────────────────────────────────────────

function FITBLearnerView({ sentence, answers, caseSensitive, feedbackCorrect, feedbackIncorrect }) {
  const parts = useMemo(() => sentence.split("___"), [sentence]);
  const blankCount = parts.length - 1;
  const [inputs, setInputs] = useState(() => Array(blankCount).fill(""));
  const [submitted, setSubmitted] = useState(false);

  const check = (ua, ca) => {
    const u = (ua || "").trim();
    const c = (ca || "").trim();
    return caseSensitive ? u === c : u.toLowerCase() === c.toLowerCase();
  };

  const allCorrect = submitted && inputs.every((inp, i) => check(inp, answers[i]));
  const anyFilled = inputs.some((inp) => inp.trim() !== "");

  const handleReset = () => {
    setInputs(Array(blankCount).fill(""));
    setSubmitted(false);
  };

  return (
    <div className="rounded border border-violet-200 dark:border-violet-800 bg-background/60 p-3 space-y-3">
      <div className="text-sm leading-relaxed flex flex-wrap items-baseline gap-y-1">
        {parts.map((part, i) => (
          <span key={i}>
            <span>{part}</span>
            {i < blankCount && (
              <input
                type="text"
                value={inputs[i] || ""}
                onChange={(e) => {
                  if (submitted) return;
                  const next = [...inputs];
                  next[i] = e.target.value;
                  setInputs(next);
                }}
                disabled={submitted}
                autoComplete="off"
                className={cn(
                  "inline-block mx-1 px-2 py-0.5 text-sm border rounded w-28 text-center outline-none focus:ring-1 focus:ring-violet-400 transition-colors",
                  submitted && check(inputs[i], answers[i])
                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                    : submitted
                      ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                      : "border-border bg-background hover:border-violet-300"
                )}
              />
            )}
          </span>
        ))}
      </div>

      {submitted && (
        <div className="space-y-1.5">
          {/* Per-blank correction hints */}
          {inputs.some((inp, i) => !check(inp, answers[i])) && (
            <div className="text-xs text-muted-foreground space-y-0.5">
              {inputs.map((inp, i) =>
                !check(inp, answers[i]) ? (
                  <p key={i}>
                    Blank {i + 1}: correct answer is{" "}
                    <span className="font-semibold text-foreground">{answers[i]}</span>
                  </p>
                ) : null
              )}
            </div>
          )}
          <p
            className={cn(
              "text-xs font-semibold",
              allCorrect
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {allCorrect ? feedbackCorrect : feedbackIncorrect}
          </p>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Try again
          </Button>
        </div>
      )}

      {!submitted && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20"
          onClick={() => setSubmitted(true)}
          disabled={!anyFilled}
        >
          Check answers
        </Button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FillInTheBlankBlock({ block, onUpdate }) {
  const sentence = block.sentence || "";
  const answers = block.answers || [];
  const caseSensitive = block.caseSensitive ?? false;
  const feedbackCorrect = block.feedbackCorrect || "✓ Correct! Well done.";
  const feedbackIncorrect = block.feedbackIncorrect || "✗ Not quite — review and try again.";

  const blankCount = (sentence.match(/___/g) || []).length;
  const syncedAnswers = Array.from({ length: blankCount }, (_, i) => answers[i] || "");

  const updateAnswer = (i, val) => {
    const updated = [...syncedAnswers];
    updated[i] = val;
    onUpdate(block.id, { ...block, answers: updated });
  };

  // ── Learner / preview mode ─────────────────────────────────────────────────
  if (!onUpdate) {
    return (
      <FITBLearnerView
        sentence={sentence}
        answers={syncedAnswers}
        caseSensitive={caseSensitive}
        feedbackCorrect={feedbackCorrect}
        feedbackIncorrect={feedbackIncorrect}
      />
    );
  }

  // ── Editor mode ────────────────────────────────────────────────────────────
  return (
    <div className="rounded-md border border-violet-500 border-l-4 bg-violet-50/20 dark:bg-violet-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <PenLine className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Fill in the Blank
        </span>
      </div>

      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Sentence{" "}
            <span className="text-muted-foreground/60">(use ___ for each blank)</span>
          </Label>
          <Textarea
            value={sentence}
            onChange={(e) => onUpdate(block.id, { ...block, sentence: e.target.value })}
            placeholder="The capital of France is ___ and it is famous for the ___ Tower."
            className="text-sm resize-none bg-muted/20 border-0 focus-visible:ring-1 min-h-[60px]"
          />
          <p className="text-[11px] text-muted-foreground/60">
            {blankCount} blank{blankCount !== 1 ? "s" : ""} detected
          </p>
        </div>

        {blankCount > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Correct answers (in order)</Label>
            {syncedAnswers.map((ans, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-4 shrink-0 text-right">{i + 1}.</span>
                <Input
                  value={ans}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                  placeholder={`Blank ${i + 1} answer`}
                  className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => onUpdate(block.id, { ...block, caseSensitive: !caseSensitive })}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {caseSensitive ? (
            <ToggleRight className="h-4 w-4 text-violet-500" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
          Case sensitive matching
        </button>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Correct feedback</Label>
            <Input
              value={feedbackCorrect}
              onChange={(e) => onUpdate(block.id, { ...block, feedbackCorrect: e.target.value })}
              className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Incorrect feedback</Label>
            <Input
              value={feedbackIncorrect}
              onChange={(e) => onUpdate(block.id, { ...block, feedbackIncorrect: e.target.value })}
              className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {sentence && blankCount > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Learner preview</p>
            <FITBLearnerView
              key={sentence + syncedAnswers.join("") + caseSensitive}
              sentence={sentence}
              answers={syncedAnswers}
              caseSensitive={caseSensitive}
              feedbackCorrect={feedbackCorrect}
              feedbackIncorrect={feedbackIncorrect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
