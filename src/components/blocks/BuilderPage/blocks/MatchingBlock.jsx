import { ArrowLeftRight, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Learner Interactive View ─────────────────────────────────────────────────

function MatchingLearnerView({ prompt, pairs }) {
  // Shuffle once per mount
  const shuffledDefs = useMemo(() => shuffleArray(pairs.map((p) => ({ id: p.id, definition: p.definition }))), []);

  const [assignments, setAssignments] = useState({}); // termId -> defId
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const usedDefIds = new Set(Object.values(assignments));
  const allMatched = pairs.every((p) => assignments[p.id] !== undefined);
  const allCorrect = submitted && pairs.every((p) => assignments[p.id] === p.id);

  const handleTermClick = (termId) => {
    if (submitted) return;
    // If already matched, allow re-assigning by selecting again
    setSelectedTermId((prev) => (prev === termId ? null : termId));
  };

  const handleDefClick = (defId) => {
    if (submitted || !selectedTermId) return;
    setAssignments((prev) => {
      const next = { ...prev };
      // If this def was assigned to another term, unassign it
      for (const [tid, did] of Object.entries(next)) {
        if (did === defId) delete next[tid];
      }
      next[selectedTermId] = defId;
      return next;
    });
    setSelectedTermId(null);
  };

  const handleReset = () => {
    setAssignments({});
    setSelectedTermId(null);
    setSubmitted(false);
  };

  const getDefById = (defId) => shuffledDefs.find((d) => d.id === defId);

  const isCorrect = (termId) => submitted && assignments[termId] === termId;
  const isIncorrect = (termId) => submitted && assignments[termId] !== undefined && assignments[termId] !== termId;

  return (
    <div className="rounded border border-teal-200 dark:border-teal-800 bg-background/60 p-3 space-y-3">
      {prompt && <p className="text-sm font-medium">{prompt}</p>}

      {/* Hint */}
      {!submitted && (
        <p className="text-[11px] text-muted-foreground">
          {selectedTermId ? "Now click the matching definition →" : "Click a term to select it, then click its definition."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Terms column */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Terms</p>
          {pairs.map((p) => {
            const assignedDef = assignments[p.id] ? getDefById(assignments[p.id]) : null;
            const selected = selectedTermId === p.id;
            return (
              <div key={p.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleTermClick(p.id)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded border text-xs font-medium transition-colors",
                    submitted
                      ? isCorrect(p.id)
                        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200"
                        : isIncorrect(p.id)
                          ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-800 dark:text-red-200"
                          : "border-border"
                      : selected
                        ? "border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 ring-1 ring-teal-400"
                        : assignedDef
                          ? "border-teal-300 dark:border-teal-700 bg-teal-50/20 dark:bg-teal-950/10"
                          : "border-border hover:border-teal-300 dark:hover:border-teal-600"
                  )}
                >
                  {p.term}
                </button>
                {assignedDef && !submitted && (
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 pl-1 truncate">
                    → {assignedDef.definition}
                  </p>
                )}
                {submitted && assignedDef && (
                  <p className={cn("text-[10px] pl-1 truncate", isCorrect(p.id) ? "text-emerald-600" : "text-red-600")}>
                    → {assignedDef.definition}
                    {isIncorrect(p.id) && (
                      <span className="ml-1 text-muted-foreground">(correct: {p.definition})</span>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Definitions column */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Definitions</p>
          {shuffledDefs.map((d) => {
            const taken = usedDefIds.has(d.id);
            const clickable = !submitted && selectedTermId && (!taken || assignments[selectedTermId] === d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleDefClick(d.id)}
                disabled={submitted || (!selectedTermId && !taken)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded border text-xs transition-colors",
                  taken && !submitted
                    ? "border-border/40 text-muted-foreground/50 bg-muted/20 cursor-default"
                    : clickable
                      ? "border-teal-400 dark:border-teal-600 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 cursor-pointer"
                      : "border-border cursor-default"
                )}
              >
                {d.definition}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {!submitted ? (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-teal-300 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/20"
          onClick={() => setSubmitted(true)}
          disabled={!allMatched}
        >
          Submit
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <p
            className={cn(
              "text-xs font-semibold",
              allCorrect
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            )}
          >
            {allCorrect
              ? "✓ All correct! Well done."
              : `${pairs.filter((p) => assignments[p.id] === p.id).length} / ${pairs.length} correct`}
          </p>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchingBlock({ block, onUpdate }) {
  const prompt = block.prompt || "";
  const pairs = block.pairs || [
    { id: "p1", term: "", definition: "" },
    { id: "p2", term: "", definition: "" },
  ];

  const updatePair = (id, field, val) => {
    onUpdate(block.id, {
      ...block,
      pairs: pairs.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    });
  };

  const addPair = () => {
    onUpdate(block.id, {
      ...block,
      pairs: [...pairs, { id: `p${Date.now()}`, term: "", definition: "" }],
    });
  };

  const removePair = (id) => {
    if (pairs.length <= 2) return;
    onUpdate(block.id, { ...block, pairs: pairs.filter((p) => p.id !== id) });
  };

  // ── Learner / preview mode ─────────────────────────────────────────────────
  if (!onUpdate) {
    return <MatchingLearnerView prompt={prompt} pairs={pairs} />;
  }

  // ── Editor mode ────────────────────────────────────────────────────────────
  return (
    <div className="rounded-md border border-teal-500 border-l-4 bg-teal-50/20 dark:bg-teal-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <ArrowLeftRight className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          Matching Activity
        </span>
        <span className="text-xs text-muted-foreground ml-auto">{pairs.length} pairs</span>
      </div>

      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Prompt / instruction</Label>
          <Textarea
            value={prompt}
            onChange={(e) => onUpdate(block.id, { ...block, prompt: e.target.value })}
            placeholder="Match each term to its correct definition."
            rows={2}
            className="text-sm resize-none bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 px-1">
            <Label className="text-xs text-muted-foreground">Term</Label>
            <Label className="text-xs text-muted-foreground">Definition</Label>
          </div>
          {pairs.map((p, i) => (
            <div key={p.id} className="flex items-start gap-1.5">
              <span className="text-[10px] text-muted-foreground mt-2 w-4 shrink-0 text-right">{i + 1}.</span>
              <Input
                value={p.term}
                onChange={(e) => updatePair(p.id, "term", e.target.value)}
                placeholder="Term"
                className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
              />
              <Input
                value={p.definition}
                onChange={(e) => updatePair(p.id, "definition", e.target.value)}
                placeholder="Definition"
                className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removePair(p.id)}
                disabled={pairs.length <= 2}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-muted-foreground"
            onClick={addPair}
            disabled={pairs.length >= 8}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add pair
          </Button>
        </div>

        {/* Live preview */}
        {pairs.some((p) => p.term && p.definition) && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Learner preview</p>
            <MatchingLearnerView
              key={JSON.stringify(pairs)}
              prompt={prompt}
              pairs={pairs.filter((p) => p.term || p.definition)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
