import { FileSliders } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const THEMES = [
  { value: "default", label: "Default" },
  { value: "gaia", label: "Gaia" },
  { value: "uncover", label: "Uncover" },
];

const SIZES = [
  { value: "16:9", label: "16:9 (Widescreen)" },
  { value: "4:3", label: "4:3 (Classic)" },
];

export default function MarpFrontmatterBlock({ block, onUpdate }) {
  const updateField = (key, value) => {
    onUpdate(block.id, { ...block, [key]: value });
  };

  return (
    <div className="group relative rounded-md border border-border bg-background transition-all focus-within:border-ring">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
        <FileSliders className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">MARP Presentation Settings</span>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Theme</Label>
            <Select value={block.theme || "default"} onValueChange={(v) => updateField("theme", v)}>
              <SelectTrigger className="h-8 text-xs bg-muted/20 border-0 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Slide Size</Label>
            <Select value={block.size || "16:9"} onValueChange={(v) => updateField("size", v)}>
              <SelectTrigger className="h-8 text-xs bg-muted/20 border-0 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-2">
          <Label htmlFor={`paginate-${block.id}`} className="text-xs cursor-pointer">
            Show page numbers
          </Label>
          <Switch
            id={`paginate-${block.id}`}
            checked={!!block.paginate}
            onCheckedChange={(v) => updateField("paginate", v)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Header</Label>
            <Input
              value={block.header || ""}
              onChange={(e) => updateField("header", e.target.value)}
              placeholder="Slide header text"
              className="h-8 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Footer</Label>
            <Input
              value={block.footer || ""}
              onChange={(e) => updateField("footer", e.target.value)}
              placeholder="Slide footer text"
              className="h-8 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Background Color</Label>
            <div className="flex gap-1.5 items-center">
              <input
                type="color"
                value={block.backgroundColor || "#ffffff"}
                onChange={(e) => updateField("backgroundColor", e.target.value)}
                className="h-8 w-10 rounded border border-border/40 cursor-pointer bg-transparent p-0.5"
              />
              <Input
                value={block.backgroundColor || ""}
                onChange={(e) => updateField("backgroundColor", e.target.value)}
                placeholder="#ffffff"
                className="h-8 text-xs bg-muted/20 border-0 focus-visible:ring-1 flex-1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Text Color</Label>
            <div className="flex gap-1.5 items-center">
              <input
                type="color"
                value={block.color || "#000000"}
                onChange={(e) => updateField("color", e.target.value)}
                className="h-8 w-10 rounded border border-border/40 cursor-pointer bg-transparent p-0.5"
              />
              <Input
                value={block.color || ""}
                onChange={(e) => updateField("color", e.target.value)}
                placeholder="#000000"
                className="h-8 text-xs bg-muted/20 border-0 focus-visible:ring-1 flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
