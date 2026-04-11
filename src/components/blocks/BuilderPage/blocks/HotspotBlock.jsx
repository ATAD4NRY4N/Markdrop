import { Crosshair, MapPin, Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Learner / Preview View ───────────────────────────────────────────────────

function HotspotPreview({ imageUrl, alt, hotspots }) {
  const [activeId, setActiveId] = useState(null);

  if (!imageUrl) {
    return (
      <div className="rounded border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
        No image set
      </div>
    );
  }

  return (
    <div
      className="relative inline-block w-full select-none"
      onClick={() => setActiveId(null)}
    >
      <img src={imageUrl} alt={alt || ""} className="w-full rounded-md block" draggable={false} />
      {(hotspots || []).map((hs) => (
        <div
          key={hs.id}
          style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
        >
          {/* Hotspot pin */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveId((prev) => (prev === hs.id ? null : hs.id));
            }}
            className={cn(
              "group relative h-7 w-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110",
              activeId === hs.id
                ? "bg-orange-500 scale-110"
                : "bg-orange-400 hover:bg-orange-500"
            )}
            title={hs.label || "Hotspot"}
          >
            <MapPin className="h-4 w-4 text-white" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-orange-400/40 animate-ping" />
          </button>

          {/* Popover */}
          {activeId === hs.id && (
            <div
              className="absolute z-20 w-52 rounded-lg border border-border bg-popover shadow-xl p-2.5 text-xs space-y-1"
              style={{
                left: "50%",
                top: "110%",
                transform: "translateX(-50%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {hs.label && (
                <p className="font-semibold text-sm leading-tight">{hs.label}</p>
              )}
              {hs.content && (
                <p className="text-muted-foreground leading-snug">{hs.content}</p>
              )}
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="absolute top-1 right-1 p-0.5 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HotspotBlock({ block, onUpdate }) {
  const imageUrl = block.imageUrl || "";
  const alt = block.alt || "";
  const hotspots = block.hotspots || [];
  const imgRef = useRef(null);
  const [activeEditor, setActiveEditor] = useState(null); // hotspot id being edited

  const addHotspot = (x, y) => {
    const newHs = {
      id: `hs_${Date.now()}`,
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(1)),
      label: `Spot ${hotspots.length + 1}`,
      content: "",
    };
    onUpdate(block.id, { ...block, hotspots: [...hotspots, newHs] });
    setActiveEditor(newHs.id);
  };

  const handleImageClick = (e) => {
    if (!imageUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    addHotspot(x, y);
  };

  const updateHotspot = (id, field, val) => {
    onUpdate(block.id, {
      ...block,
      hotspots: hotspots.map((hs) => (hs.id === id ? { ...hs, [field]: val } : hs)),
    });
  };

  const removeHotspot = (id) => {
    onUpdate(block.id, { ...block, hotspots: hotspots.filter((hs) => hs.id !== id) });
    if (activeEditor === id) setActiveEditor(null);
  };

  // ── Learner / preview mode ─────────────────────────────────────────────────
  if (!onUpdate) {
    return <HotspotPreview imageUrl={imageUrl} alt={alt} hotspots={hotspots} />;
  }

  // ── Editor mode ────────────────────────────────────────────────────────────
  return (
    <div className="rounded-md border border-orange-500 border-l-4 bg-orange-50/20 dark:bg-orange-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <Crosshair className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
          Hotspot Image
        </span>
        <span className="text-xs text-muted-foreground ml-auto">{hotspots.length} hotspot{hotspots.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => onUpdate(block.id, { ...block, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Alt text</Label>
            <Input
              value={alt}
              onChange={(e) => onUpdate(block.id, { ...block, alt: e.target.value })}
              placeholder="Describe the image"
              className="h-7 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Image with click-to-place */}
        {imageUrl && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">
              <span className="text-orange-500 font-medium">Click on the image</span> to place a hotspot pin.
            </p>
            <div
              className="relative w-full cursor-crosshair rounded-md overflow-hidden border border-border select-none"
              onClick={handleImageClick}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt={alt || ""}
                className="w-full block pointer-events-none"
                draggable={false}
              />
              {hotspots.map((hs) => (
                <div
                  key={hs.id}
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveEditor((prev) => (prev === hs.id ? null : hs.id));
                  }}
                >
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-transform hover:scale-110",
                      activeEditor === hs.id ? "bg-orange-600" : "bg-orange-400"
                    )}
                    title="Click to edit"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotspot list */}
        {hotspots.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Hotspots</Label>
            {hotspots.map((hs, i) => (
              <div key={hs.id} className="rounded border border-border/40 bg-muted/10 overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-muted/20 text-left"
                  onClick={() => setActiveEditor((prev) => (prev === hs.id ? null : hs.id))}
                >
                  <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span className="flex-1 font-medium truncate">{hs.label || `Spot ${i + 1}`}</span>
                  <span className="text-muted-foreground/60 shrink-0">
                    {hs.x}%, {hs.y}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={(e) => { e.stopPropagation(); removeHotspot(hs.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </button>

                {activeEditor === hs.id && (
                  <div className="px-2.5 pb-2 pt-1 space-y-1.5 border-t border-border/30">
                    <Input
                      value={hs.label}
                      onChange={(e) => updateHotspot(hs.id, "label", e.target.value)}
                      placeholder="Label (title)"
                      className="h-6 text-xs bg-muted/20 border-0 focus-visible:ring-1"
                    />
                    <Textarea
                      value={hs.content}
                      onChange={(e) => updateHotspot(hs.id, "content", e.target.value)}
                      placeholder="Popover description…"
                      rows={2}
                      className="text-xs bg-muted/20 border-0 focus-visible:ring-1 resize-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">X position (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={hs.x}
                          onChange={(e) => updateHotspot(hs.id, "x", parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs bg-muted/20 border-0 focus-visible:ring-1"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">Y position (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={hs.y}
                          onChange={(e) => updateHotspot(hs.id, "y", parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs bg-muted/20 border-0 focus-visible:ring-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!imageUrl && (
          <p className="text-[11px] text-muted-foreground/60 text-center py-2">
            Enter an image URL above to start placing hotspots.
          </p>
        )}

        {imageUrl && hotspots.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs border-dashed border-orange-300 dark:border-orange-700"
            onClick={() => addHotspot(50, 50)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add a hotspot manually
          </Button>
        )}
      </div>
    </div>
  );
}
