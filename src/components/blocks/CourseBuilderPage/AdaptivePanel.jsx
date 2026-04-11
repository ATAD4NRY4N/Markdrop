import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Layers,
  Plus,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourse } from "@/context/CourseContext";
import { getCheckpointableBlocks } from "@/lib/adaptiveUtils";

// ── helpers ──────────────────────────────────────────────────────────────

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function VariantRow({ variant, modules, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);

  const variantModules = modules.filter((m) => (variant.moduleIds ?? []).includes(m.id));
  const unassigned = modules.filter((m) => !(variant.moduleIds ?? []).includes(m.id));

  const toggle = (moduleId) => {
    const current = variant.moduleIds ?? [];
    const next = current.includes(moduleId)
      ? current.filter((id) => id !== moduleId)
      : [...current, moduleId];
    onUpdate({ ...variant, moduleIds: next });
  };

  return (
    <div className="rounded-md border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <GitBranch className="h-4 w-4 text-violet-500 shrink-0" />
          <span className="text-sm font-medium truncate">{variant.name || "Unnamed variant"}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {variantModules.length} module{variantModules.length !== 1 ? "s" : ""}
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Star
              className={`h-3.5 w-3.5 ${variant.required ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
            />
            <Switch
              checked={!!variant.required}
              onCheckedChange={(v) => onUpdate({ ...variant, required: v })}
              className="scale-75 origin-right"
            />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {variant.required ? "Required" : "Optional"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="border-t px-3 pb-3 pt-2 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Variant name</Label>
            <Input
              value={variant.name}
              onChange={(e) => onUpdate({ ...variant, name: e.target.value })}
              className="h-7 text-sm"
              placeholder="e.g. Remediation Path"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Assign slides to this variant</Label>
            <p className="text-xs text-muted-foreground">
              Checked modules are part of this learning path. Core modules are those not assigned
              to any variant.
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-muted/20">
              {modules.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No modules yet</p>
              ) : (
                modules.map((m) => {
                  const checked = (variant.moduleIds ?? []).includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(m.id)}
                        className="accent-violet-600 h-3.5 w-3.5"
                      />
                      <span className="text-xs truncate">{m.title || "Untitled Module"}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RuleRow({ rule, variants, onUpdate, onDelete }) {
  return (
    <div className="flex items-center gap-2 flex-wrap rounded border bg-muted/20 px-2 py-1.5 text-xs">
      <span className="text-muted-foreground shrink-0">If score</span>
      <Select
        value={rule.operator}
        onValueChange={(v) => onUpdate({ ...rule, operator: v })}
      >
        <SelectTrigger className="h-6 w-20 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lt" className="text-xs">&lt; (below)</SelectItem>
          <SelectItem value="gte" className="text-xs">≥ (at or above)</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={100}
          value={rule.threshold}
          onChange={(e) =>
            onUpdate({ ...rule, threshold: Math.max(0, Math.min(100, Number(e.target.value))) })
          }
          className="h-6 w-14 text-xs text-center"
        />
        <span className="text-muted-foreground">%</span>
      </div>
      <span className="text-muted-foreground shrink-0">→ unlock</span>
      <Select
        value={rule.variantIds?.[0] ?? "none"}
        onValueChange={(v) => onUpdate({ ...rule, variantIds: v === "none" ? [] : [v] })}
      >
        <SelectTrigger className="h-6 flex-1 min-w-[120px] text-xs">
          <SelectValue placeholder="(no variant)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" className="text-xs">(no unlock)</SelectItem>
          {variants.map((v) => (
            <SelectItem key={v.id} value={v.id} className="text-xs">
              {v.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function CheckpointCard({ cp, variants, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);

  const addRule = () => {
    onUpdate({
      ...cp,
      rules: [
        ...(cp.rules ?? []),
        { id: uid(), type: "score", operator: "lt", threshold: 70, variantIds: [] },
      ],
    });
  };

  const updateRule = (ruleId, updated) => {
    onUpdate({ ...cp, rules: cp.rules.map((r) => (r.id === ruleId ? updated : r)) });
  };

  const deleteRule = (ruleId) => {
    onUpdate({ ...cp, rules: cp.rules.filter((r) => r.id !== ruleId) });
  };

  const ruleCount = (cp.rules ?? []).length;
  const fallbackVariant = variants.find((v) => v.id === cp.fallbackVariantIds?.[0]);

  return (
    <div className="rounded-md border bg-card">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{cp.blockLabel}</p>
            <p className="text-xs text-muted-foreground truncate">
              {cp.moduleTitle} · {cp.blockType === "quiz" ? "Quiz" : "Knowledge Check"} ·{" "}
              {ruleCount} rule{ruleCount !== 1 ? "s" : ""}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t px-3 pb-3 pt-2 space-y-2">
          <p className="text-xs text-muted-foreground">
            Rules are evaluated in order; first match wins.
          </p>

          {(cp.rules ?? []).map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              variants={variants}
              onUpdate={(u) => updateRule(rule.id, u)}
              onDelete={() => deleteRule(rule.id)}
            />
          ))}

          <Button size="sm" variant="outline" className="h-6 text-xs gap-1 w-full" onClick={addRule}>
            <Plus className="h-3 w-3" />
            Add rule
          </Button>

          <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t">
            <span className="text-muted-foreground shrink-0">Fallback (no rule matches) →</span>
            <Select
              value={cp.fallbackVariantIds?.[0] ?? "none"}
              onValueChange={(v) =>
                onUpdate({ ...cp, fallbackVariantIds: v === "none" ? [] : [v] })
              }
            >
              <SelectTrigger className="h-6 flex-1 min-w-[120px] text-xs">
                <SelectValue placeholder="(nothing)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs">(no unlock)</SelectItem>
                {variants.map((v) => (
                  <SelectItem key={v.id} value={v.id} className="text-xs">
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function AdaptivePanel({ open, onOpenChange }) {
  const { modules, adaptiveConfig, saveAdaptiveConfig } = useCourse();

  const [config, setConfig] = useState(null);

  // Sync local draft when panel opens
  const effectiveConfig = config ?? adaptiveConfig;

  const checkpointableBlocks = useMemo(
    () => getCheckpointableBlocks(modules),
    [modules]
  );

  const isDirty =
    JSON.stringify(effectiveConfig) !== JSON.stringify(adaptiveConfig);

  const update = (next) => setConfig(next);

  const handleSave = async () => {
    try {
      await saveAdaptiveConfig(effectiveConfig);
      setConfig(null);
      toast.success("Adaptive config saved");
    } catch {
      toast.error("Failed to save adaptive config");
    }
  };

  const handleDiscard = () => setConfig(null);

  // ── Variants actions ──────────────────────────────────────────────────
  const addVariant = () => {
    update({
      ...effectiveConfig,
      variants: [
        ...effectiveConfig.variants,
        { id: uid(), name: "New Learning Path", required: false, moduleIds: [] },
      ],
    });
  };

  const updateVariant = (variantId, updated) => {
    update({
      ...effectiveConfig,
      variants: effectiveConfig.variants.map((v) => (v.id === variantId ? updated : v)),
    });
  };

  const deleteVariant = (variantId) => {
    update({
      ...effectiveConfig,
      variants: effectiveConfig.variants.filter((v) => v.id !== variantId),
      // Remove all checkpoints referring to variants of this id
      checkpoints: effectiveConfig.checkpoints.map((cp) => ({
        ...cp,
        rules: (cp.rules ?? []).map((r) => ({
          ...r,
          variantIds: (r.variantIds ?? []).filter((v) => v !== variantId),
        })),
        fallbackVariantIds: (cp.fallbackVariantIds ?? []).filter((v) => v !== variantId),
      })),
    });
  };

  // ── Checkpoints actions ───────────────────────────────────────────────
  const addCheckpoint = (blockId) => {
    if (effectiveConfig.checkpoints.some((cp) => cp.blockId === blockId)) {
      toast.info("Checkpoint already added for that block");
      return;
    }
    const blockMeta = checkpointableBlocks.find((b) => b.blockId === blockId);
    if (!blockMeta) return;
    update({
      ...effectiveConfig,
      checkpoints: [
        ...effectiveConfig.checkpoints,
        {
          id: uid(),
          blockId,
          moduleId: blockMeta.moduleId,
          blockLabel: blockMeta.blockLabel,
          blockType: blockMeta.blockType,
          moduleTitle: blockMeta.moduleTitle,
          rules: [{ id: uid(), type: "score", operator: "lt", threshold: 70, variantIds: [] }],
          fallbackVariantIds: [],
        },
      ],
    });
  };

  const updateCheckpoint = (cpId, updated) => {
    update({
      ...effectiveConfig,
      checkpoints: effectiveConfig.checkpoints.map((cp) => (cp.id === cpId ? updated : cp)),
    });
  };

  const deleteCheckpoint = (cpId) => {
    update({
      ...effectiveConfig,
      checkpoints: effectiveConfig.checkpoints.filter((cp) => cp.id !== cpId),
    });
  };

  // Blocks not yet turned into checkpoints
  const availableBlocks = checkpointableBlocks.filter(
    (b) => !effectiveConfig.checkpoints.some((cp) => cp.blockId === b.blockId)
  );

  const coreCount = modules.filter(
    (m) => !effectiveConfig.variants.flatMap((v) => v.moduleIds ?? []).includes(m.id)
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[420px] sm:w-[480px] flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-violet-500" />
            Adaptive Learning
          </SheetTitle>
          <SheetDescription className="text-xs">
            Create learning paths and unlock them with checkpoint rules.
          </SheetDescription>
        </SheetHeader>

        {/* Stats bar */}
        <div className="px-4 py-2 border-b flex gap-3 text-xs text-muted-foreground shrink-0">
          <span>
            <strong className="text-foreground">{coreCount}</strong> core slides
          </span>
          <span>
            <strong className="text-foreground">{effectiveConfig.variants.length}</strong> variants
          </span>
          <span>
            <strong className="text-foreground">{effectiveConfig.checkpoints.length}</strong> checkpoints
          </span>
          {isDirty && (
            <span className="ml-auto text-amber-600 font-medium">Unsaved changes</span>
          )}
        </div>

        <Tabs defaultValue="variants" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-4 my-2 shrink-0">
            <TabsTrigger value="variants" className="flex-1 text-xs">
              <Layers className="h-3.5 w-3.5 mr-1.5" />
              Variants ({effectiveConfig.variants.length})
            </TabsTrigger>
            <TabsTrigger value="checkpoints" className="flex-1 text-xs">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Checkpoints ({effectiveConfig.checkpoints.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Variants tab ─── */}
          <TabsContent value="variants" className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 mt-0">
            <div className="space-y-2 text-xs text-muted-foreground bg-muted/30 rounded-md p-3">
              <p>
                <strong>Core slides</strong> are always visible to all learners.{" "}
                <strong>Variant slides</strong> are locked until a checkpoint unlocks the path.
              </p>
              <p>
                Slides not assigned to any variant are automatically considered <em>Core</em>.
              </p>
            </div>

            {effectiveConfig.variants.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No variants defined</p>
                <p className="text-xs">Add a variant to create a learning path</p>
              </div>
            ) : (
              <div className="space-y-2">
                {effectiveConfig.variants.map((v) => (
                  <VariantRow
                    key={v.id}
                    variant={v}
                    modules={modules}
                    onUpdate={(u) => updateVariant(v.id, u)}
                    onDelete={() => deleteVariant(v.id)}
                  />
                ))}
              </div>
            )}

            <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={addVariant}>
              <Plus className="h-4 w-4" />
              Add learning path
            </Button>

            {effectiveConfig.variants.some((v) => v.required) && (
              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md p-2.5">
                <Star className="h-3 w-3 inline mr-1 text-amber-500" />
                <strong>Required</strong> variants count toward course completion.{" "}
                <strong>Optional</strong> variants are enrichment only.
              </div>
            )}
          </TabsContent>

          {/* ── Checkpoints tab ─── */}
          <TabsContent
            value="checkpoints"
            className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 mt-0"
          >
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3">
              A <strong>checkpoint</strong> watches a quiz or knowledge-check and unlocks variant
              paths based on the learner's score. Decisions are stored in{" "}
              <code className="bg-muted rounded px-1">suspend_data</code> so progress resumes
              correctly.
            </div>

            {availableBlocks.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Add checkpoint from block</Label>
                <div className="space-y-1 max-h-36 overflow-y-auto border rounded-md p-2 bg-muted/20">
                  {availableBlocks.map((b) => (
                    <div
                      key={b.blockId}
                      className="flex items-center justify-between gap-2 px-1 py-0.5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{b.blockLabel}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {b.moduleTitle} · {b.blockType === "quiz" ? "Quiz" : "Knowledge Check"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs shrink-0 gap-1"
                        onClick={() => addCheckpoint(b.blockId)}
                        disabled={effectiveConfig.variants.length === 0}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
                {effectiveConfig.variants.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add at least one variant before creating checkpoints.
                  </p>
                )}
              </div>
            )}

            {effectiveConfig.checkpoints.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No checkpoints yet</p>
                <p className="text-xs">
                  {checkpointableBlocks.length === 0
                    ? "Add a quiz or knowledge-check block to a module first"
                    : "Select a block above to add a checkpoint"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {effectiveConfig.checkpoints.map((cp) => (
                  <CheckpointCard
                    key={cp.id}
                    cp={cp}
                    variants={effectiveConfig.variants}
                    onUpdate={(u) => updateCheckpoint(cp.id, u)}
                    onDelete={() => deleteCheckpoint(cp.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer actions */}
        {isDirty && (
          <div className="px-4 py-3 border-t flex gap-2 shrink-0">
            <Button size="sm" variant="ghost" className="flex-1" onClick={handleDiscard}>
              Discard
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSave}>
              Save changes
            </Button>
          </div>
        )}
        {!isDirty && (
          <div className="px-4 py-3 border-t shrink-0">
            <Button size="sm" className="w-full" onClick={handleSave}>
              Save
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
