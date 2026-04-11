import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Images,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "https://placehold.co/800x450?text=Slide+Image";

export default function CarouselBlock({ block, onUpdate }) {
  const images = block.images?.length ? block.images : [{ url: "", alt: "", caption: "" }];
  const autoPlay = block.autoPlay ?? false;
  const interval = block.interval ?? 3000;
  const showDots = block.showDots ?? true;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Sync dot indicator with carousel position
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  // Autoplay
  useEffect(() => {
    if (!autoPlay || !emblaApi || images.length <= 1) return;
    const timer = setInterval(() => emblaApi.scrollNext(), interval);
    return () => clearInterval(timer);
  }, [autoPlay, emblaApi, interval, images.length]);

  const update = (patch) => onUpdate(block.id, { ...block, ...patch });

  const updateImage = (index, field, value) => {
    const updated = images.map((img, i) => (i === index ? { ...img, [field]: value } : img));
    update({ images: updated });
  };

  const addImage = () => {
    update({ images: [...images, { url: "", alt: "", caption: "" }] });
  };

  const removeImage = (index) => {
    if (images.length <= 1) return;
    const updated = images.filter((_, i) => i !== index);
    update({ images: updated });
    if (activeIdx >= updated.length) {
      setActiveIdx(Math.max(0, updated.length - 1));
    }
  };

  return (
    <div className="rounded-md border border-border bg-background/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/10">
        <Images className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Image Carousel</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {autoPlay ? (
              <Pause className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Play className="h-3 w-3 text-muted-foreground" />
            )}
            <Label className="text-xs text-muted-foreground cursor-pointer" htmlFor={`autoplay-${block.id}`}>
              Auto-play
            </Label>
            <Switch
              id={`autoplay-${block.id}`}
              checked={autoPlay}
              onCheckedChange={(v) => update({ autoPlay: v })}
            />
          </div>
        </div>
      </div>

      {/* Carousel Preview */}
      <div className="relative overflow-hidden bg-muted/20" ref={emblaRef}>
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="relative flex-[0_0_100%] min-w-0">
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.alt || `Slide ${i + 1}`}
                  className="w-full object-cover"
                  style={{ maxHeight: "280px", minHeight: "160px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = PLACEHOLDER;
                  }}
                />
              ) : (
                <div
                  className="w-full flex items-center justify-center bg-muted/30 text-muted-foreground text-sm"
                  style={{ height: "180px" }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Images className="h-8 w-8 opacity-30" />
                    <span className="text-xs opacity-60">No image URL — slide {i + 1}</span>
                  </div>
                </div>
              )}
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-1.5 text-center">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 hover:bg-black/60 text-white p-1 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 hover:bg-black/60 text-white p-1 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {showDots && images.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2 bg-muted/10">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "rounded-full transition-all",
                i === activeIdx
                  ? "w-4 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image editor */}
      <div className="p-3 space-y-2 border-t border-border/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">Slides ({images.length})</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground" htmlFor={`showdots-${block.id}`}>
                Dots
              </Label>
              <Switch
                id={`showdots-${block.id}`}
                checked={showDots}
                onCheckedChange={(v) => update({ showDots: v })}
              />
            </div>
            {autoPlay && (
              <div className="flex items-center gap-1.5">
                <Label className="text-xs text-muted-foreground">Interval (ms)</Label>
                <Input
                  type="number"
                  value={interval}
                  min={500}
                  max={10000}
                  step={500}
                  onChange={(e) => update({ interval: Number(e.target.value) })}
                  className="h-6 w-20 text-xs bg-muted/20 border-0 focus-visible:ring-1"
                />
              </div>
            )}
          </div>
        </div>

        {images.map((img, i) => (
          <div key={i} className="rounded-md border border-border/40 bg-muted/10 p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Slide {i + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive/60 hover:text-destructive"
                onClick={() => removeImage(i)}
                disabled={images.length <= 1}
                title="Remove slide"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={img.url}
              onChange={(e) => updateImage(i, "url", e.target.value)}
              placeholder="Image URL (https://...)"
              className="h-7 text-xs bg-background/70 border-border/40 focus-visible:ring-1"
            />
            <div className="flex gap-1.5">
              <Input
                value={img.alt}
                onChange={(e) => updateImage(i, "alt", e.target.value)}
                placeholder="Alt text"
                className="h-6 text-xs bg-background/70 border-border/40 focus-visible:ring-1 flex-1"
              />
              <Input
                value={img.caption}
                onChange={(e) => updateImage(i, "caption", e.target.value)}
                placeholder="Caption (optional)"
                className="h-6 text-xs bg-background/70 border-border/40 focus-visible:ring-1 flex-1"
              />
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs border-dashed"
          onClick={addImage}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Slide
        </Button>
      </div>
    </div>
  );
}
