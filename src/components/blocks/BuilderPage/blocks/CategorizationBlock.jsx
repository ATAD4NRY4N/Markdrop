import { CheckSquare, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COLORS = [
  {
    label: "Blue",
    value: "blue",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-400",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    label: "Green",
    value: "green",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-400",
    text: "text-green-700 dark:text-green-300",
  },
  {
    label: "Purple",
    value: "purple",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-400",
    text: "text-purple-700 dark:text-purple-300",
  },
  {
    label: "Orange",
    value: "orange",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-400",
    text: "text-orange-700 dark:text-orange-300",
  },
];

function getColor(index) {
  return COLORS[index % COLORS.length];
}

export default function CategorizationBlock({ block, onUpdate }) {
  const categories = block.categories || [
    { id: "cat-1", label: "Category A" },
    { id: "cat-2", label: "Category B" },
  ];
  const items = block.items || [
    { id: "item-1", content: "", categoryId: "cat-1" },
    { id: "item-2", content: "", categoryId: "cat-2" },
  ];
  const mode = block.mode || "checklist";
  const prompt = block.prompt || "Sort the following items into the correct categories:";

  const [learnerAnswers, setLearnerAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const isEditMode = typeof onUpdate === "function";

  const updateField = (field, value) => {
    onUpdate(block.id, { ...block, [field]: value });
  };

  const addCategory = () => {
    if (categories.length >= 4) return;
    const id = `cat-${Date.now()}`;
    updateField("categories", [...categories, { id, label: `Category ${categories.length + 1}` }]);
  };

  const updateCategory = (catId, label) => {
    updateField(
      "categories",
      categories.map((c) => (c.id === catId ? { ...c, label } : c))
    );
  };

  const removeCategory = (catId) => {
    if (categories.length <= 2) return;
    updateField(
      "categories",
      categories.filter((c) => c.id !== catId)
    );
  };

  const addItem = () => {
    const id = `item-${Date.now()}`;
    updateField("items", [...items, { id, content: "", categoryId: categories[0]?.id || "" }]);
  };

  const updateItem = (itemId, changes) => {
    updateField(
      "items",
      items.map((it) => (it.id === itemId ? { ...it, ...changes } : it))
    );
  };

  const removeItem = (itemId) => {
    updateField(
      "items",
      items.filter((it) => it.id !== itemId)
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const resetAttempt = () => {
    setLearnerAnswers({});
    setSubmitted(false);
  };

  const correctCount = submitted
    ? items.filter((it) => learnerAnswers[it.id] === it.categoryId).length
    : 0;

  return (
    <div className="rounded-md border border-violet-500 border-l-4 bg-violet-50/20 dark:bg-violet-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <CheckSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Categorization
        </span>
      </div>

      {isEditMode && (
        <div className="p-3 space-y-4 border-b border-border/30">
          {/* Prompt */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Prompt / Instructions</Label>
            <Input
              value={prompt}
              onChange={(e) => updateField("prompt", e.target.value)}
              placeholder="Prompt for learners…"
              className="text-sm h-8"
            />
          </div>

          {/* Interaction mode */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Interaction Mode</Label>
            <Select value={mode} onValueChange={(v) => updateField("mode", v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checklist">Checklist (radio buttons)</SelectItem>
                <SelectItem value="dragdrop">Drag &amp; Drop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Categories ({categories.length}/4)
              </Label>
              {categories.length < 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={addCategory}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
            {categories.map((cat, idx) => {
              const color = getColor(idx);
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full shrink-0",
                      color.bg,
                      color.border,
                      "border"
                    )}
                  />
                  <Input
                    value={cat.label}
                    onChange={(e) => updateCategory(cat.id, e.target.value)}
                    className="h-7 text-xs flex-1"
                    placeholder={`Category ${idx + 1}`}
                  />
                  {categories.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 hover:text-destructive"
                      onClick={() => removeCategory(cat.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Items</Label>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={addItem}>
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <Input
                  value={item.content}
                  onChange={(e) => updateItem(item.id, { content: e.target.value })}
                  className="h-7 text-xs flex-1"
                  placeholder="Item text…"
                />
                <Select
                  value={item.categoryId}
                  onValueChange={(v) => updateItem(item.id, { categoryId: v })}
                >
                  <SelectTrigger className="h-7 w-28 text-xs shrink-0">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learner preview */}
      <div className="p-3 space-y-3">
        <p className="text-sm font-medium">{prompt}</p>

        {/* Checklist mode */}
        {mode === "checklist" && (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left pb-1 text-muted-foreground text-xs font-medium pr-4 w-1/3">
                  Item
                </th>
                {categories.map((cat, idx) => {
                  const color = getColor(idx);
                  return (
                    <th
                      key={cat.id}
                      className={cn("text-center pb-1 text-xs font-medium px-2", color.text)}
                    >
                      {cat.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isCorrect = submitted && learnerAnswers[item.id] === item.categoryId;
                const isWrong =
                  submitted &&
                  learnerAnswers[item.id] &&
                  learnerAnswers[item.id] !== item.categoryId;
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-t border-border/30",
                      isCorrect && "bg-green-50/50 dark:bg-green-950/20",
                      isWrong && "bg-red-50/50 dark:bg-red-950/20"
                    )}
                  >
                    <td className="py-1.5 pr-4 text-sm">{item.content || "(empty)"}</td>
                    {categories.map((cat) => (
                      <td key={cat.id} className="text-center py-1.5 px-2">
                        <input
                          type="radio"
                          name={`cat-${item.id}`}
                          value={cat.id}
                          checked={learnerAnswers[item.id] === cat.id}
                          disabled={submitted}
                          onChange={() =>
                            setLearnerAnswers((prev) => ({ ...prev, [item.id]: cat.id }))
                          }
                          className="cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Drag & drop mode placeholder */}
        {mode === "dragdrop" && (
          <div className="space-y-3">
            {/* Unassigned items pool */}
            {!submitted && (
              <div className="flex flex-wrap gap-2 p-2 rounded-md bg-muted/20 border border-dashed border-border/50 min-h-[44px]">
                {items
                  .filter((it) => !learnerAnswers[it.id])
                  .map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => {
                        if (learnerAnswers[it.id]) {
                          // deselect
                          setLearnerAnswers((prev) => {
                            const n = { ...prev };
                            delete n[it.id];
                            return n;
                          });
                        }
                      }}
                      className="text-xs bg-background rounded-full px-2.5 py-1 border border-border/60 shadow-sm hover:bg-muted/30 cursor-pointer"
                    >
                      {it.content || "(empty)"}
                    </button>
                  ))}
              </div>
            )}
            {/* Category drop zones */}
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}
            >
              {categories.map((cat, idx) => {
                const color = getColor(idx);
                const assignedItems = submitted
                  ? items.filter((it) => it.categoryId === cat.id)
                  : items.filter((it) => learnerAnswers[it.id] === cat.id);
                return (
                  <div
                    key={cat.id}
                    className={cn(
                      "rounded-md border-2 p-2 min-h-[80px] cursor-pointer",
                      color.bg,
                      color.border
                    )}
                    onClick={() => {
                      // assign all unassigned to this category when pool item is clicked - simplified UX
                    }}
                  >
                    <p className={cn("text-xs font-semibold mb-2", color.text)}>{cat.label}</p>
                    {assignedItems.map((it) => {
                      const isCorrect = submitted && it.categoryId === cat.id;
                      const isWrong = submitted && learnerAnswers[it.id] !== it.categoryId;
                      return (
                        <div
                          key={it.id}
                          className={cn(
                            "text-xs bg-background rounded px-2 py-1 mb-1 border border-border/40 shadow-sm cursor-pointer hover:bg-muted/30",
                            !submitted && "hover:opacity-70",
                            submitted && isCorrect && "border-green-400 bg-green-50/50",
                            submitted && isWrong && "border-red-400 bg-red-50/50"
                          )}
                          onClick={(e) => {
                            if (!submitted) {
                              e.stopPropagation();
                              setLearnerAnswers((prev) => {
                                const n = { ...prev };
                                delete n[it.id];
                                return n;
                              });
                            }
                          }}
                        >
                          {it.content || "(empty)"}
                        </div>
                      );
                    })}
                    {!submitted && (
                      <div
                        className="text-xs text-muted-foreground/40 mt-1 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Assign all unassigned items to this category (one at a time - click zone after selecting pill)
                          const unassigned = items.find((it) => !learnerAnswers[it.id]);
                          if (unassigned) {
                            setLearnerAnswers((prev) => ({ ...prev, [unassigned.id]: cat.id }));
                          }
                        }}
                      >
                        click to place item
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit / result */}
        {!submitted ? (
          <Button
            size="sm"
            className="mt-2"
            onClick={handleSubmit}
            disabled={Object.keys(learnerAnswers).length < items.length}
          >
            Submit
          </Button>
        ) : (
          <div className="space-y-2">
            <div
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium",
                correctCount === items.length
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
              )}
            >
              {correctCount}/{items.length} correct
              {correctCount === items.length
                ? " — Well done! 🎉"
                : " — Review the highlighted items."}
            </div>
            <Button variant="outline" size="sm" onClick={resetAttempt}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
