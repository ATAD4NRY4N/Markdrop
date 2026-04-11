import { CaseSensitive, ChevronDown, ChevronUp, Replace, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getBlockLabel, searchModules } from "@/lib/searchUtils";
import { cn } from "@/lib/utils";

export default function SearchReplaceDialog({
  open,
  onOpenChange,
  modules = [],
  onNavigate,
  onReplace,
  onReplaceAll,
}) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isReplacing, setIsReplacing] = useState(false);

  const queryInputRef = useRef(null);

  // Focus search input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => queryInputRef.current?.focus(), 50);
    }
  }, [open]);

  // Re-search whenever query, caseSensitive, or modules change
  const results = useMemo(
    () => searchModules(modules, query, caseSensitive),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modules, query, caseSensitive]
  );

  // Keep selectedIdx in range after results change
  useEffect(() => {
    setSelectedIdx((prev) => (results.length === 0 ? 0 : Math.min(prev, results.length - 1)));
  }, [results]);

  // Group results by module for display
  const grouped = useMemo(() => {
    const map = new Map();
    results.forEach((r, i) => {
      if (!map.has(r.moduleId)) {
        map.set(r.moduleId, { name: r.moduleName, items: [] });
      }
      map.get(r.moduleId).items.push({ ...r, globalIdx: i });
    });
    return [...map.values()];
  }, [results]);

  const selectedResult = results[selectedIdx] ?? null;

  function selectResult(idx) {
    setSelectedIdx(idx);
    const r = results[idx];
    if (r) onNavigate?.(r.moduleId, r.blockId);
  }

  function handlePrev() {
    if (!results.length) return;
    const next = (selectedIdx - 1 + results.length) % results.length;
    selectResult(next);
  }

  function handleNext() {
    if (!results.length) return;
    const next = (selectedIdx + 1) % results.length;
    selectResult(next);
  }

  async function handleReplace() {
    if (!selectedResult || !replacement && replacement !== "") return;
    setIsReplacing(true);
    try {
      await onReplace?.(selectedResult, replacement, caseSensitive);
      // After replace, the results list will update via modules prop change;
      // keep same index (or clamp if list shrinks)
    } finally {
      setIsReplacing(false);
    }
  }

  async function handleReplaceAll() {
    if (!query.trim()) return;
    setIsReplacing(true);
    try {
      await onReplaceAll?.(query, replacement, caseSensitive);
    } finally {
      setIsReplacing(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (e.shiftKey) handlePrev();
      else handleNext();
    }
    if (e.key === "Escape") onOpenChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[580px] gap-0 p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 pt-4 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4 text-violet-500 shrink-0" />
            Search &amp; Replace
          </DialogTitle>
        </DialogHeader>

        {/* Search + replace inputs */}
        <div className="px-4 py-3 space-y-2 border-b">
          {/* Search row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                ref={queryInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Find…"
                className="pl-8 h-8 text-sm pr-20"
                autoComplete="off"
                spellCheck={false}
              />
              {/* Case-sensitive toggle */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        size="sm"
                        className="h-6 w-6 p-0 data-[state=on]:bg-violet-100 data-[state=on]:text-violet-700 dark:data-[state=on]:bg-violet-900/40 dark:data-[state=on]:text-violet-300"
                        pressed={caseSensitive}
                        onPressedChange={setCaseSensitive}
                        aria-label="Case sensitive"
                      >
                        <CaseSensitive className="h-3.5 w-3.5" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Case sensitive</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Nav prev/next */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handlePrev}
                        disabled={results.length === 0}
                        aria-label="Previous match"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Previous (Shift+Enter)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleNext}
                        disabled={results.length === 0}
                        aria-label="Next match"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Next (Enter)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Match count */}
            <span className="text-xs text-muted-foreground shrink-0 w-16 text-right tabular-nums">
              {results.length > 0
                ? `${selectedIdx + 1} / ${results.length}`
                : query.trim()
                ? "No results"
                : ""}
            </span>
          </div>

          {/* Replace row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Replace className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onOpenChange?.(false)}
                placeholder="Replace with…"
                className="pl-8 h-8 text-sm"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs shrink-0"
              onClick={handleReplace}
              disabled={!selectedResult || isReplacing}
            >
              Replace
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 text-xs shrink-0 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleReplaceAll}
              disabled={!query.trim() || results.length === 0 || isReplacing}
            >
              Replace All
            </Button>
          </div>
        </div>

        {/* Results list */}
        <ScrollArea className="h-[300px]">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground/60 gap-2">
              <Search className="h-8 w-8" />
              <p className="text-sm">
                {query.trim() ? "No matches found" : "Type to search your course content"}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {grouped.map((group, gi) => (
                <div key={group.name + gi}>
                  {/* Module header */}
                  <div className="flex items-center gap-2 px-4 py-1.5 sticky top-0 bg-muted/60 backdrop-blur-sm border-b border-border/40 z-10">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate flex-1">
                      {group.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                      {group.items.length}
                    </Badge>
                  </div>

                  {/* Result rows */}
                  {group.items.map((item) => (
                    <ResultRow
                      key={`${item.blockId}-${item.fieldPath}-${item.matchStart}`}
                      item={item}
                      isSelected={item.globalIdx === selectedIdx}
                      onClick={() => selectResult(item.globalIdx)}
                    />
                  ))}

                  {gi < grouped.length - 1 && <Separator className="my-0.5 opacity-40" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ── Result row ───────────────────────────────────────────────────────────────

function ResultRow({ item, isSelected, onClick }) {
  const rowRef = useRef(null);

  // Scroll selected row into view within the ScrollArea
  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isSelected]);

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2 flex flex-col gap-0.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500",
        isSelected && "bg-violet-50 dark:bg-violet-950/30 border-l-2 border-l-violet-500"
      )}
    >
      {/* Block type label */}
      <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
        {getBlockLabel(item.blockType)}
      </span>
      {/* Snippet with highlighted match */}
      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">
        <span className="text-muted-foreground">{item.snippet.before}</span>
        <mark className="bg-yellow-200 dark:bg-yellow-800/60 text-foreground rounded-[2px] px-[1px]">
          {item.snippet.match}
        </mark>
        <span className="text-muted-foreground">{item.snippet.after}</span>
      </p>
    </button>
  );
}
