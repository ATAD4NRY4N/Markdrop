import { ImagePlay, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POSITIONS = [
  { value: "bg", label: "Full Background (bg)" },
  { value: "bg left", label: "Left Half (bg left)" },
  { value: "bg right", label: "Right Half (bg right)" },
  { value: "bg top", label: "Top Half (bg top)" },
  { value: "bg bottom", label: "Bottom Half (bg bottom)" },
  { value: "bg left:40%", label: "Left 40% (bg left:40%)" },
  { value: "bg right:40%", label: "Right 40% (bg right:40%)" },
  { value: "bg fit", label: "Fit (bg fit)" },
  { value: "bg contain", label: "Contain (bg contain)" },
  { value: "bg cover", label: "Cover (bg cover)" },
];

export default function MarpBgImageBlock({ block, onUpdate }) {
  const [imgError, setImgError] = useState(false);

  const updateField = (key, value) => {
    onUpdate(block.id, { ...block, [key]: value });
  };

  const position = block.position || "bg";

  const buildAltText = () => {
    let alt = position;
    if (block.opacity) alt += ` opacity:${block.opacity}`;
    return alt;
  };

  return (
    <div className="group relative rounded-md border border-border bg-background transition-all focus-within:border-ring">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
        <ImagePlay className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Background Image</span>
        {block.content && (
          <code className="ml-auto text-[10px] text-muted-foreground/60 font-mono truncate max-w-[160px]">
            ![{buildAltText()}](...)
          </code>
        )}
      </div>

      <div className="p-3 space-y-3">
        {block.content && !imgError && (
          <div className="w-full rounded-md border border-border/50 bg-muted/5 overflow-hidden h-24">
            <img
              src={block.content}
              alt="Background preview"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LinkIcon className="h-3.5 w-3.5" />
          </div>
          <Input
            value={block.content || ""}
            onChange={(e) => {
              setImgError(false);
              updateField("content", e.target.value);
            }}
            placeholder="Image URL..."
            className="pl-9 border-0 bg-muted/20 h-9 shadow-none focus-visible:ring-1 focus-visible:bg-background transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Position / Fit</Label>
          <Select value={position} onValueChange={(v) => updateField("position", v)}>
            <SelectTrigger className="h-8 text-xs bg-muted/20 border-0 focus:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Opacity{" "}
            <span className="font-normal text-muted-foreground/60">(0.0 – 1.0, optional)</span>
          </Label>
          <Input
            value={block.opacity || ""}
            onChange={(e) => updateField("opacity", e.target.value)}
            placeholder="e.g. 0.5"
            type="number"
            min="0"
            max="1"
            step="0.1"
            className="h-8 text-xs bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>
      </div>
    </div>
  );
}
