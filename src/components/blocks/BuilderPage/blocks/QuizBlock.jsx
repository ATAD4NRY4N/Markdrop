import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "tf", label: "True / False" },
  { value: "fitb", label: "Fill in the Blank" },
];

function MCQEditor({ question, onChange }) {
  const options = question.options || ["", "", "", ""];
  const correctIndex = question.correctIndex ?? 0;

  const updateOption = (i, val) => {
    const updated = options.map((o, idx) => (idx === i ? val : o));
    onChange({ ...question, options: updated });
  };

  const addOption = () => onChange({ ...question, options: [...options, ""] });

  const removeOption = (i) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, idx) => idx !== i);
    onChange({
      ...question,
      options: updated,
      correctIndex: correctIndex >= updated.length ? 0 : correctIndex,
    });
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Options (click circle = correct answer)</Label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...question, correctIndex: i })}
            className={cn(
              "h-5 w-5 rounded-full border-2 shrink-0 transition-colors",
              i === correctIndex
                ? "border-emerald-500 bg-emerald-500"
                : "border-muted-foreground/40 hover:border-muted-foreground"
            )}
            title="Mark as correct"
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
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs px-2 text-muted-foreground"
        onClick={addOption}
        disabled={options.length >= 8}
      >
        <Plus className="h-3 w-3 mr-1" /> Add option
      </Button>
    </div>
  );
}

function TFEditor({ question, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Correct Answer</Label>
      <div className="flex gap-2">
        {["True", "False"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange({ ...question, correctTF: label })}
            className={cn(
              "px-4 py-1.5 rounded-md border text-xs font-medium transition-colors",
              question.correctTF === label
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border hover:border-muted-foreground/60"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FITBEditor({ question, onChange }) {
  const answers = question.acceptedAnswers || [""];

  const updateAnswer = (i, val) => {
    const updated = answers.map((a, idx) => (idx === i ? val : a));
    onChange({ ...question, acceptedAnswers: updated });
  };

  const addAnswer = () => onChange({ ...question, acceptedAnswers: [...answers, ""] });

  const removeAnswer = (i) => {
    if (answers.length <= 1) return;
    onChange({ ...question, acceptedAnswers: answers.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Use <code className="bg-muted px-1 rounded text-[10px]">___</code> in the prompt to mark the blank.
      </p>
      <Label className="text-xs text-muted-foreground">Accepted Answers</Label>
      {answers.map((ans, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={ans}
            onChange={(e) => updateAnswer(i, e.target.value)}
            placeholder={`Accepted answer ${i + 1}`}
            className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeAnswer(i)}
            disabled={answers.length <= 1}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs px-2 text-muted-foreground"
        onClick={addAnswer}
      >
        <Plus className="h-3 w-3 mr-1" /> Add answer
      </Button>
    </div>
  );
}

function QuestionEditor({ question, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-md border border-border/60 bg-background/60 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/10 border-b border-border/40">
        <span className="text-xs font-semibold text-muted-foreground">Q{index + 1}</span>
        <Select
          value={question.type || "mcq"}
          onValueChange={(v) => onChange({ ...question, type: v })}
        >
          <SelectTrigger className="h-6 w-36 text-xs border-0 bg-transparent focus:ring-0 px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-xs">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMoveUp}
            disabled={isFirst}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMoveDown}
            disabled={isLast}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Question Prompt</Label>
            <Textarea
              value={question.prompt || ""}
              onChange={(e) => onChange({ ...question, prompt: e.target.value })}
              placeholder="Enter your question here…"
              className="min-h-[56px] text-sm resize-none bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>

          {(question.type || "mcq") === "mcq" && (
            <MCQEditor question={question} onChange={onChange} />
          )}
          {question.type === "tf" && (
            <TFEditor question={question} onChange={onChange} />
          )}
          {question.type === "fitb" && (
            <FITBEditor question={question} onChange={onChange} />
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Correct Feedback</Label>
              <Input
                value={question.feedbackCorrect || ""}
                onChange={(e) => onChange({ ...question, feedbackCorrect: e.target.value })}
                placeholder="Great job!"
                className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Incorrect Feedback</Label>
              <Input
                value={question.feedbackIncorrect || ""}
                onChange={(e) => onChange({ ...question, feedbackIncorrect: e.target.value })}
                placeholder="Try again."
                className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Points</Label>
              <Input
                type="number"
                min={0}
                value={question.points ?? 1}
                onChange={(e) => onChange({ ...question, points: Number(e.target.value) })}
                className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Preview mode — shows how learner would see a single question
function QuestionPreview({ question, index }) {
  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const checkAnswer = () => {
    setSubmitted(true);
  };

  const reset = () => {
    setSelected(null);
    setTextAnswer("");
    setSubmitted(false);
  };

  const type = question.type || "mcq";

  const isCorrect = () => {
    if (type === "mcq") return selected === (question.correctIndex ?? 0);
    if (type === "tf") return selected === question.correctTF;
    if (type === "fitb") {
      const accepted = (question.acceptedAnswers || []).map((a) => a.trim().toLowerCase());
      return accepted.includes(textAnswer.trim().toLowerCase());
    }
    return false;
  };

  return (
    <div className="rounded-md border border-border/60 bg-background/60 p-3 space-y-3">
      <p className="text-sm font-medium">
        {index + 1}. {question.prompt || "(No prompt)"}
      </p>

      {type === "mcq" && (
        <div className="space-y-1.5">
          {(question.options || []).map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => !submitted && setSelected(i)}
              className={cn(
                "flex items-center gap-2 w-full rounded px-3 py-2 text-sm text-left border transition-colors",
                submitted && i === (question.correctIndex ?? 0)
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : submitted && selected === i && i !== (question.correctIndex ?? 0)
                    ? "border-red-500 bg-red-50/40 dark:bg-red-950/20"
                    : selected === i
                      ? "border-primary bg-primary/5"
                      : "border-border/40 hover:border-muted-foreground/40"
              )}
            >
              {opt || `Option ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {type === "tf" && (
        <div className="flex gap-2">
          {["True", "False"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => !submitted && setSelected(label)}
              className={cn(
                "px-4 py-1.5 rounded-md border text-sm font-medium transition-colors",
                submitted && label === question.correctTF
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600"
                  : submitted && selected === label && label !== question.correctTF
                    ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-600"
                    : selected === label
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/60"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {type === "fitb" && (
        <Input
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          disabled={submitted}
          placeholder="Type your answer…"
          className="h-8 text-sm"
        />
      )}

      {submitted ? (
        <div
          className={cn(
            "rounded px-3 py-2 text-sm",
            isCorrect()
              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
          )}
        >
          {isCorrect()
            ? question.feedbackCorrect || "Correct!"
            : question.feedbackIncorrect || "Incorrect. Try again."}
          <Button variant="ghost" size="sm" className="ml-3 h-6 text-xs" onClick={reset}>
            Reset
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={checkAnswer}
          disabled={selected === null && textAnswer === ""}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Submit
        </Button>
      )}
    </div>
  );
}

export default function QuizBlock({ block, onUpdate }) {
  const [isPreview, setIsPreview] = useState(false);
  const questions = block.questions || [
    { id: "q1", type: "mcq", prompt: "", options: ["", "", "", ""], correctIndex: 0, feedbackCorrect: "", feedbackIncorrect: "", points: 1 },
  ];

  const updateQuestion = (index, updated) => {
    const newQuestions = questions.map((q, i) => (i === index ? updated : q));
    onUpdate(block.id, { ...block, questions: newQuestions });
  };

  const addQuestion = () => {
    onUpdate(block.id, {
      ...block,
      questions: [
        ...questions,
        {
          id: `q${Date.now()}`,
          type: "mcq",
          prompt: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          feedbackCorrect: "",
          feedbackIncorrect: "",
          points: 1,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    onUpdate(block.id, { ...block, questions: updated.length ? updated : questions });
  };

  const moveQuestion = (index, dir) => {
    const newQ = [...questions];
    const target = index + dir;
    if (target < 0 || target >= newQ.length) return;
    [newQ[index], newQ[target]] = [newQ[target], newQ[index]];
    onUpdate(block.id, { ...block, questions: newQ });
  };

  return (
    <div className="rounded-md border border-violet-500 border-l-4 bg-violet-50/20 dark:bg-violet-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Quiz
        </span>
        <span className="text-xs text-muted-foreground ml-1">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
          {" · "}
          {questions.reduce((s, q) => s + (q.points ?? 1), 0)} pts
        </span>
        <div className="ml-auto flex gap-1">
          <Input
            value={block.title || ""}
            onChange={(e) => onUpdate(block.id, { ...block, title: e.target.value })}
            placeholder="Quiz title…"
            className="h-7 w-40 text-xs bg-muted/20 border-0 focus-visible:ring-1"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 px-2"
            onClick={() => setIsPreview((v) => !v)}
            title={isPreview ? "Edit" : "Preview"}
          >
            {isPreview ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {isPreview ? (
          questions.map((q, i) => <QuestionPreview key={q.id || i} question={q} index={i} />)
        ) : (
          <>
            {questions.map((q, i) => (
              <QuestionEditor
                key={q.id || i}
                question={q}
                index={i}
                onChange={(updated) => updateQuestion(i, updated)}
                onRemove={() => removeQuestion(i)}
                onMoveUp={() => moveQuestion(i, -1)}
                onMoveDown={() => moveQuestion(i, 1)}
                isFirst={i === 0}
                isLast={i === questions.length - 1}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs w-full"
              onClick={addQuestion}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
            </Button>
          </>
        )}
      </div>

      {!isPreview && (
        <div className="px-3 pb-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Label className="text-xs">Pass threshold</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={block.passThreshold ?? 80}
              onChange={(e) =>
                onUpdate(block.id, { ...block, passThreshold: Number(e.target.value) })
              }
              className="h-6 w-16 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
            <span>%</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Label className="text-xs">Max attempts</Label>
            <Input
              type="number"
              min={0}
              value={block.maxAttempts ?? 0}
              onChange={(e) =>
                onUpdate(block.id, { ...block, maxAttempts: Number(e.target.value) })
              }
              className="h-6 w-16 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
            <span className="text-muted-foreground/60">(0 = unlimited)</span>
          </div>
        </div>
      )}
    </div>
  );
}
