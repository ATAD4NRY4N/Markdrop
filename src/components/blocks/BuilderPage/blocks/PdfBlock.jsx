import { Download, FileText, ExternalLink } from "lucide-react";
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

const HEIGHT_OPTIONS = [
  { value: "400px", label: "Small (400px)" },
  { value: "500px", label: "Medium (500px)" },
  { value: "600px", label: "Large (600px)" },
  { value: "800px", label: "Extra Large (800px)" },
];

export default function PdfBlock({ block, onUpdate }) {
  const url = block.url || "";
  const title = block.title || "";
  const height = block.height || "500px";
  const showDownload = block.showDownload ?? true;

  const update = (patch) => onUpdate(block.id, { ...block, ...patch });

  return (
    <div className="rounded-md border border-border bg-background/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">PDF Viewer</span>
      </div>

      {/* Editor fields */}
      <div className="p-3 space-y-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">PDF URL</Label>
          <Input
            value={url}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="https://example.com/document.pdf"
            className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Title (optional)</Label>
            <Input
              value={title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Document title..."
              className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>
          <div className="w-40 space-y-1">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Select value={height} onValueChange={(v) => update({ height: v })}>
              <SelectTrigger className="h-7 text-xs bg-muted/20 border-0 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEIGHT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id={`dl-${block.id}`}
            checked={showDownload}
            onCheckedChange={(v) => update({ showDownload: v })}
          />
          <Label
            className="text-xs text-muted-foreground cursor-pointer"
            htmlFor={`dl-${block.id}`}
          >
            Show download button
          </Label>
        </div>
      </div>

      {/* Preview */}
      <div className="border-t border-border/40 bg-muted/5">
        {url ? (
          <>
            {title && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40">
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">{title}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
            <iframe
              src={url}
              title={title || "PDF Document"}
              style={{ height, width: "100%", border: "none", display: "block" }}
              aria-label={title || "PDF Document"}
            />
            {showDownload && (
              <div className="flex justify-center px-3 py-2 border-t border-border/40">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </a>
              </div>
            )}
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-muted-foreground gap-3 p-8"
            style={{ minHeight: "160px" }}
          >
            <FileText className="h-10 w-10 opacity-20" />
            <p className="text-xs opacity-50">Enter a PDF URL above to preview it here</p>
          </div>
        )}
      </div>
    </div>
  );
}
