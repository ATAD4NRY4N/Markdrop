import { LayoutGrid, Trash2, Type, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Preset layout ratios — displayed as human-readable labels with fr-value arrays
const LAYOUT_PRESETS = [
  { label: "1:1", fractions: [1, 1] },
  { label: "1:1:1", fractions: [1, 1, 1] },
  { label: "1:1:1:1", fractions: [1, 1, 1, 1] },
  { label: "2:1", fractions: [2, 1] },
  { label: "1:2", fractions: [1, 2] },
  { label: "1:2:1", fractions: [1, 2, 1] },
];

function buildGridTemplateColumns(columns, weights) {
  if (weights?.length === columns.length) {
    return weights.map((w) => `${w}fr`).join(" ");
  }
  return `repeat(${columns.length}, minmax(0, 1fr))`;
}

export default function GridBlock({ block, onUpdate }) {
  const columns = block.columns || [
    { type: "text", content: "" },
    { type: "text", content: "" },
  ];
  const weights = block.weights || null;
  const colsCount = columns.length;

  // Fix: correct onUpdate signature — always (blockId, updatedBlock)
  const update = (patch) => onUpdate(block.id, { ...block, ...patch });

  const handleColContentChange = (index, value) => {
    const newCols = [...columns];
    newCols[index] = { ...newCols[index], content: value };
    update({ columns: newCols });
  };

  const handleColTypeChange = (index, type) => {
    const newCols = [...columns];
    newCols[index] = { ...newCols[index], type, content: "" };
    update({ columns: newCols });
  };

  const handleAddColumn = () => {
    if (colsCount >= 4) return;
    const newCols = [...columns, { type: "text", content: "" }];
    update({ columns: newCols, weights: null });
  };

  const handleRemoveColumn = (index) => {
    if (colsCount <= 1) return;
    const newCols = columns.filter((_, i) => i !== index);
    update({ columns: newCols, weights: null });
  };

  const applyPreset = (preset) => {
    const newCols = preset.fractions.map((_, i) =>
      columns[i] ? columns[i] : { type: "text", content: "" }
    );
    update({ columns: newCols, weights: preset.fractions });
  };

  const gridStyle = { gridTemplateColumns: buildGridTemplateColumns(columns, weights) };

  // ── Preview / Learner Mode ─────────────────────────────────────────────────
  if (!onUpdate) {
    return (
      <div
        className="grid gap-4 my-6 max-sm:grid-cols-1"
        style={gridStyle}
      >
        {columns.map((col, index) => (
          <div key={index} className="min-w-0">
            {col.type === "text" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose dark:prose-invert max-w-none text-sm break-words"
              >
                {col.content}
              </ReactMarkdown>
            ) : col.content ? (
              <img
                src={col.content}
                alt={`Column ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-sm"
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  // ── Editor Mode ────────────────────────────────────────────────────────────
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-4 bg-white dark:bg-neutral-900 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-violet-500">
          <LayoutGrid className="h-4 w-4" />
          <span className="font-semibold text-xs uppercase tracking-wider">Columns / Grid</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddColumn}
          disabled={colsCount >= 4}
          className="text-xs h-7"
        >
          + Add Column
        </Button>
      </div>

      {/* Layout presets */}
      <div className="flex flex-wrap gap-1 mb-3">
        {LAYOUT_PRESETS.map((preset) => {
          const active =
            weights?.length === preset.fractions.length &&
            weights.every((w, i) => w === preset.fractions[i]);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                active
                  ? "border-violet-500 bg-violet-50 text-violet-600 dark:bg-violet-900/30"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-violet-400"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Column editors */}
      <div className="grid gap-3" style={gridStyle}>
        {columns.map((col, index) => (
          <div
            key={index}
            className="border border-neutral-100 dark:border-neutral-800 rounded-md p-2.5"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Col {index + 1}
                {weights ? ` (${weights[index]}fr)` : ""}
              </span>
              <div className="flex items-center gap-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-5 w-5 ${col.type === "text" ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30" : "text-neutral-400"}`}
                  onClick={() => handleColTypeChange(index, "text")}
                  title="Text column"
                >
                  <Type className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-5 w-5 ${col.type === "image" ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30" : "text-neutral-400"}`}
                  onClick={() => handleColTypeChange(index, "image")}
                  title="Image column"
                >
                  <ImageIcon className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 text-destructive/70 hover:text-destructive"
                  onClick={() => handleRemoveColumn(index)}
                  disabled={colsCount <= 1}
                  title="Remove column"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>

            {col.type === "text" ? (
              <Textarea
                className="w-full min-h-[80px] text-xs resize-y"
                value={col.content}
                placeholder="Markdown content…"
                onChange={(e) => handleColContentChange(index, e.target.value)}
              />
            ) : (
              <div className="space-y-1.5">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={col.content}
                  className="text-xs h-7"
                  onChange={(e) => handleColContentChange(index, e.target.value)}
                />
                {col.content && (
                  <div className="aspect-video w-full rounded overflow-hidden bg-muted">
                    <img
                      src={col.content}
                      alt="Column preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground/50 italic">
        Renders side-by-side on desktop · stacks on mobile
      </p>
    </div>
  );
}