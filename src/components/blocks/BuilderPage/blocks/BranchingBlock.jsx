import { GitBranch, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BranchingBlock({ block, onUpdate }) {
  const branches = block.branches || [{ id: "1", label: "", url: "" }];
  const update = (changes) => onUpdate(block.id, { ...block, ...changes });

  const updateBranch = (id, changes) =>
    update({ branches: branches.map((b) => (b.id === id ? { ...b, ...changes } : b)) });

  const addBranch = () =>
    update({ branches: [...branches, { id: Date.now().toString(), label: "", url: "" }] });

  const removeBranch = (id) => {
    if (branches.length <= 1) return;
    update({ branches: branches.filter((b) => b.id !== id) });
  };

  return (
    <div className="rounded-md border border-orange-500/50 bg-orange-50/20 dark:bg-orange-950/10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-orange-500/30 bg-orange-50/30 dark:bg-orange-950/20">
        <GitBranch className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
          Branching
        </span>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Prompt</Label>
          <Input
            value={block.prompt || ""}
            onChange={(e) => update({ prompt: e.target.value })}
            placeholder="Which path will you take?"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Branches</Label>
          {branches.map((branch) => (
            <div key={branch.id} className="flex items-center gap-2">
              <Input
                value={branch.label}
                onChange={(e) => updateBranch(branch.id, { label: e.target.value })}
                placeholder="Branch label"
                className="h-7 text-sm flex-1"
              />
              <Input
                value={branch.url}
                onChange={(e) => updateBranch(branch.id, { url: e.target.value })}
                placeholder="URL"
                className="h-7 text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => removeBranch(branch.id)}
                className="text-destructive shrink-0"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={addBranch}>
            + Add branch
          </Button>
        </div>
      </div>
    </div>
  );
}
