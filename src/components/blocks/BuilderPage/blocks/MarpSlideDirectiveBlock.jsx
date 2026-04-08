import { MessageSquareCode, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIRECTIVE_KEYS = [
  { value: "_class", label: "Class (_class)" },
  { value: "_backgroundColor", label: "Background Color (_backgroundColor)" },
  { value: "_color", label: "Text Color (_color)" },
  { value: "_header", label: "Header (_header)" },
  { value: "_footer", label: "Footer (_footer)" },
  { value: "_paginate", label: "Paginate (_paginate)" },
];

export default function MarpSlideDirectiveBlock({ block, onUpdate }) {
  const directives = block.directives || [];

  const updateDirectives = (newDirectives) => {
    onUpdate(block.id, { ...block, directives: newDirectives });
  };

  const addDirective = () => {
    updateDirectives([...directives, { key: "_class", value: "" }]);
  };

  const removeDirective = (index) => {
    updateDirectives(directives.filter((_, i) => i !== index));
  };

  const updateDirective = (index, field, value) => {
    const updated = directives.map((d, i) => (i === index ? { ...d, [field]: value } : d));
    updateDirectives(updated);
  };

  return (
    <div className="group relative rounded-md border border-border bg-background transition-all focus-within:border-ring">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/10">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <MessageSquareCode className="h-3.5 w-3.5" />
          <span>Slide Directive</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={addDirective}
          className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary"
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>

      <div className="p-3 space-y-2">
        {directives.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 text-center py-2">
            No directives yet. Click Add to set a per-slide directive.
          </p>
        ) : (
          directives.map((directive, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={directive.key}
                onValueChange={(v) => updateDirective(index, "key", v)}
              >
                <SelectTrigger className="h-8 text-xs bg-muted/20 border-0 focus:ring-1 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIVE_KEYS.map((k) => (
                    <SelectItem key={k.value} value={k.value} className="text-xs">
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={directive.value}
                onChange={(e) => updateDirective(index, "value", e.target.value)}
                placeholder="value"
                className="h-8 text-xs bg-muted/20 border-0 focus-visible:ring-1 flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeDirective(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
        {directives.length > 0 && (
          <p className="text-[10px] text-muted-foreground/50 font-mono">
            {directives
              .filter((d) => d.key && d.value)
              .map((d) => `<!-- ${d.key}: ${d.value} -->`)
              .join("\n")}
          </p>
        )}
      </div>
    </div>
  );
}
