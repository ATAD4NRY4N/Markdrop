import { Layers } from "lucide-react";

export default function SlideBlock({ slideNumber, totalSlides }) {
  return (
    <div className="relative py-3 flex items-center gap-3 select-none">
      <div className="flex-1 border-t-2 border-dashed border-primary/30" />
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
        <Layers className="h-3 w-3 text-primary/60" />
        <span className="text-xs font-medium text-primary/70">
          {typeof slideNumber === "number"
            ? `Slide ${slideNumber}${typeof totalSlides === "number" ? ` / ${totalSlides}` : ""}`
            : "New Slide"}
        </span>
      </div>
      <div className="flex-1 border-t-2 border-dashed border-primary/30" />
    </div>
  );
}
