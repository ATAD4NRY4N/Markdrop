import {
  AlertCircle,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  LayoutGrid,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const LAYOUT_PRESETS = [
  { label: "1:1", fractions: [1, 1] },
  { label: "1:1:1", fractions: [1, 1, 1] },
  { label: "1:1:1:1", fractions: [1, 1, 1, 1] },
  { label: "2:1", fractions: [2, 1] },
  { label: "1:2", fractions: [1, 2] },
  { label: "1:2:1", fractions: [1, 2, 1] },
];

const ALERT_TYPES = ["note", "tip", "important", "warning", "caution", "success"];

// Block types available inside grid columns
const COLUMN_BLOCK_TYPES = [
  { type: "h2", label: "Heading 2", icon: Heading2 },
  { type: "h3", label: "Heading 3", icon: Heading3 },
  { type: "h4", label: "Heading 4", icon: Heading4 },
  { type: "h1", label: "Heading 1", icon: Heading1 },
  { type: "paragraph", label: "Paragraph", icon: AlignLeft },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "alert", label: "Alert", icon: AlertCircle },
  { type: "separator", label: "Divider", icon: Minus },
];

const HEADING_PREFIX = { h1: "# ", h2: "## ", h3: "### ", h4: "#### ", h5: "##### ", h6: "###### " };
const TYPE_BADGE = {
  h1: "H1", h2: "H2", h3: "H3", h4: "H4", h5: "H5", h6: "H6",
  paragraph: "P", image: "IMG", alert: "!", separator: "—",
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildGridTemplateColumns(columns, weights) {
  if (weights?.length === columns.length) return weights.map((w) => `${w}fr`).join(" ");
  return `repeat(${columns.length}, minmax(0, 1fr))`;
}

function makeNestedId() {
  return `nb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function makeNestedBlock(type) {
  const b = { id: makeNestedId(), type, content: "" };
  if (type === "alert") return { ...b, alertType: "note" };
  if (type === "image") return { ...b, alt: "" };
  return b;
}

/**
 * Transparently migrate old {type:"text"|"image", content} columns
 * to the new {id, blocks:[]} format so old saved data renders correctly.
 */
function migrateColumns(rawCols) {
  return rawCols.map((col, i) => {
    if (Array.isArray(col.blocks)) return col; // already new format
    const b =
      col.type === "image"
        ? { id: `nb_leg_${i}_0`, type: "image", content: col.content || "", alt: "" }
        : { id: `nb_leg_${i}_0`, type: "paragraph", content: col.content || "" };
    return { id: `nc_leg_${i}`, blocks: [b] };
  });
}

// ─── Nested block — preview renderer (read-only) ─────────────────────────────

function NestedBlockPreview({ block: b }) {
  if (b.type === "separator") return <hr className="my-3 border-border/50" />;

  if (b.type === "image")
    return b.content ? (
      <img src={b.content} alt={b.alt || ""} className="w-full rounded-md" />
    ) : null;

  if (b.type === "alert") {
    const COLORS = {
      note:      "border-blue-400 bg-blue-50/40 dark:bg-blue-950/10",
      tip:       "border-green-400 bg-green-50/40 dark:bg-green-950/10",
      warning:   "border-amber-400 bg-amber-50/40 dark:bg-amber-950/10",
      caution:   "border-red-400 bg-red-50/40 dark:bg-red-950/10",
      success:   "border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/10",
      important: "border-purple-400 bg-purple-50/40 dark:bg-purple-950/10",
    };
    return (
      <div className={cn("border-l-4 rounded-r px-3 py-2 my-2 text-sm", COLORS[b.alertType || "note"] || COLORS.note)}>
        <p className="text-[10px] font-semibold uppercase mb-1 opacity-60">{b.alertType || "note"}</p>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{b.content || ""}</ReactMarkdown>
        </div>
      </div>
    );
  }

  const md = (HEADING_PREFIX[b.type] || "") + (b.content || "");
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
    </div>
  );
}

// ─── Nested block — inline editor ────────────────────────────────────────────

function NestedBlockEditor({ block: b, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const isHeading = /^h[1-6]$/.test(b.type);
  const badge = TYPE_BADGE[b.type] || "?";

  return (
    <div className="group flex items-start gap-1.5 py-1.5 border-b border-border/20 last:border-0">
      {/* Type badge */}
      <span className="mt-1 shrink-0 inline-flex items-center justify-center min-w-[22px] h-[18px] text-[10px] font-bold text-muted-foreground bg-muted/40 rounded px-1 leading-none">
        {badge}
      </span>

      {/* Editor */}
      <div className="flex-1 min-w-0 py-0.5">
        {b.type === "separator" ? (
          <div className="h-px w-full bg-border/50 my-2" />
        ) : b.type === "image" ? (
          <div className="space-y-1">
            <Input
              value={b.content || ""}
              onChange={(e) => onUpdate({ ...b, content: e.target.value })}
              placeholder="Image URL (https://…)"
              className="h-6 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
            <Input
              value={b.alt || ""}
              onChange={(e) => onUpdate({ ...b, alt: e.target.value })}
              placeholder="Alt text"
              className="h-6 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>
        ) : b.type === "alert" ? (
          <div className="space-y-1">
            <Select value={b.alertType || "note"} onValueChange={(v) => onUpdate({ ...b, alertType: v })}>
              <SelectTrigger className="h-6 text-xs bg-muted/20 border-0 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={b.content || ""}
              onChange={(e) => onUpdate({ ...b, content: e.target.value })}
              placeholder="Alert content…"
              rows={2}
              className="text-xs bg-muted/20 border-0 focus-visible:ring-1 resize-none"
            />
          </div>
        ) : isHeading ? (
          <Input
            value={b.content || ""}
            onChange={(e) => onUpdate({ ...b, content: e.target.value })}
            placeholder={`${b.type.toUpperCase()} text…`}
            className="h-7 text-xs font-semibold bg-muted/20 border-0 focus-visible:ring-1"
          />
        ) : (
          <Textarea
            value={b.content || ""}
            onChange={(e) => onUpdate({ ...b, content: e.target.value })}
            placeholder="Content…"
            rows={2}
            className="text-xs bg-muted/20 border-0 focus-visible:ring-1 resize-none"
          />
        )}
      </div>

      {/* Controls — visible on hover */}
      <div className="shrink-0 flex flex-col gap-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-5 w-5" disabled={isFirst} onClick={onMoveUp} title="Move up">
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-5 w-5" disabled={isLast} onClick={onMoveDown} title="Move down">
          <ChevronDown className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive/60 hover:text-destructive" onClick={onDelete} title="Remove">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── Add block button (popover type picker) ───────────────────────────────────

function AddBlockButton({ onAdd }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full h-6 text-xs border-dashed mt-1">
          <Plus className="h-3 w-3 mr-1" />
          Add Block
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1.5 shadow-lg" align="start">
        <div className="space-y-0.5">
          {COLUMN_BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted/50 transition-colors text-left"
              onClick={() => onAdd(type)}
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Main GridBlock component ─────────────────────────────────────────────────

export default function GridBlock({ block, onUpdate }) {
  const rawColumns = block.columns?.length
    ? block.columns
    : [
        { id: "nc_def_0", blocks: [{ id: "nb_def_0", type: "paragraph", content: "" }] },
        { id: "nc_def_1", blocks: [{ id: "nb_def_1", type: "paragraph", content: "" }] },
      ];

  const columns = migrateColumns(rawColumns);
  const weights = block.weights || null;
  const gridStyle = { gridTemplateColumns: buildGridTemplateColumns(columns, weights) };

  // ── Preview / learner mode (onUpdate is null/undefined) ───────────────────
  if (!onUpdate) {
    return (
      <div className="grid gap-4 my-6 max-sm:grid-cols-1" style={gridStyle}>
        {columns.map((col, ci) => (
          <div key={col.id || ci} className="min-w-0 space-y-1">
            {(col.blocks || []).map((b, bi) => (
              <NestedBlockPreview key={b.id || bi} block={b} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Editor mode ────────────────────────────────────────────────────────────
  const setColumns = (newCols) => onUpdate(block.id, { ...block, columns: newCols });

  const updateNested = (colIdx, updated) => {
    setColumns(columns.map((col, ci) =>
      ci !== colIdx ? col : { ...col, blocks: col.blocks.map((b) => (b.id === updated.id ? updated : b)) }
    ));
  };

  const deleteNested = (colIdx, blockId) => {
    setColumns(columns.map((col, ci) => {
      if (ci !== colIdx) return col;
      const filtered = col.blocks.filter((b) => b.id !== blockId);
      return { ...col, blocks: filtered.length ? filtered : [makeNestedBlock("paragraph")] };
    }));
  };

  const moveNested = (colIdx, blockIdx, dir) => {
    setColumns(columns.map((col, ci) => {
      if (ci !== colIdx) return col;
      const bs = [...col.blocks];
      const target = blockIdx + dir;
      if (target < 0 || target >= bs.length) return col;
      [bs[blockIdx], bs[target]] = [bs[target], bs[blockIdx]];
      return { ...col, blocks: bs };
    }));
  };

  const addNested = (colIdx, type) => {
    const nb = makeNestedBlock(type);
    setColumns(columns.map((col, ci) =>
      ci !== colIdx ? col : { ...col, blocks: [...col.blocks, nb] }
    ));
  };

  const addColumn = () => {
    if (columns.length >= 4) return;
    const newCol = { id: makeNestedId(), blocks: [makeNestedBlock("paragraph")] };
    onUpdate(block.id, { ...block, columns: [...columns, newCol], weights: null });
  };

  const removeColumn = (colIdx) => {
    if (columns.length <= 1) return;
    onUpdate(block.id, { ...block, columns: columns.filter((_, i) => i !== colIdx), weights: null });
  };

  const applyPreset = (preset) => {
    const newCols = preset.fractions.map((_, i) =>
      columns[i] ?? { id: makeNestedId(), blocks: [makeNestedBlock("paragraph")] }
    );
    onUpdate(block.id, { ...block, columns: newCols, weights: preset.fractions });
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-3 bg-white dark:bg-neutral-900 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-violet-500">
          <LayoutGrid className="h-4 w-4" />
          <span className="font-semibold text-xs uppercase tracking-wider">Columns / Grid</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addColumn}
          disabled={columns.length >= 4}
          className="text-xs h-6"
        >
          <Plus className="h-3 w-3 mr-1" />
          Column
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
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono border transition-colors",
                active
                  ? "border-violet-500 bg-violet-50 text-violet-600 dark:bg-violet-900/30"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-violet-400"
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Column editors (always equal-width in the editor for usability) */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col, colIdx) => (
          <div
            key={col.id || colIdx}
            className="rounded-md border border-border/50 bg-muted/5 overflow-hidden min-w-0"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-2 py-1 bg-muted/10 border-b border-border/30">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Col {colIdx + 1}
                {weights?.[colIdx] ? ` · ${weights[colIdx]}fr` : ""}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-destructive/50 hover:text-destructive"
                onClick={() => removeColumn(colIdx)}
                disabled={columns.length <= 1}
                title="Remove column"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
            </div>

            {/* Nested block list */}
            <div className="px-2 pb-2">
              {col.blocks.map((b, bIdx) => (
                <NestedBlockEditor
                  key={b.id || bIdx}
                  block={b}
                  onUpdate={(updated) => updateNested(colIdx, updated)}
                  onDelete={() => deleteNested(colIdx, b.id)}
                  onMoveUp={() => moveNested(colIdx, bIdx, -1)}
                  onMoveDown={() => moveNested(colIdx, bIdx, 1)}
                  isFirst={bIdx === 0}
                  isLast={bIdx === col.blocks.length - 1}
                />
              ))}
              <AddBlockButton onAdd={(type) => addNested(colIdx, type)} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground/50 italic">
        Renders side-by-side on desktop · stacks on mobile
      </p>
    </div>
  );
}