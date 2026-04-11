import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo, useEffect, useMemo, useRef } from "react";
import MarkdownBlock from "./MarkdownBlock";

const Editor = memo(function Editor({
  blocks = [],
  onBlockUpdate,
  onBlockDelete,
  onBlockAdd,
  onBlockCopy,
  onPasteAfter,
  focusBlockId,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "editor-dropzone" });
  const scrollRef = useRef(null);

  // Scroll to and briefly pulse-highlight the focused block
  useEffect(() => {
    if (!focusBlockId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-block-id="${CSS.escape(focusBlockId)}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("search-highlight-pulse");
    const timer = setTimeout(() => el.classList.remove("search-highlight-pulse"), 2000);
    return () => clearTimeout(timer);
  }, [focusBlockId]);

  // Memoize block IDs for SortableContext
  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  // Pre-compute slide numbers for slide-type blocks
  const slideMetadata = useMemo(() => {
    const meta = {};
    const totalSlides = blocks.filter((b) => b.type === "slide").length + 1;
    let currentSlide = 1;
    for (const block of blocks) {
      if (block.type === "slide") {
        currentSlide++;
        meta[block.id] = { slideNumber: currentSlide, totalSlides };
      }
    }
    return meta;
  }, [blocks]);

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full rounded-lg transition-colors relative ${
        isOver ? "bg-muted/30" : ""
      }`}
    >
      {blocks.length === 0 ? (
        <div className="absolute inset-4 flex items-center justify-center border-2 border-dashed rounded-lg border-muted-foreground/20">
          <p className="text-center text-sm text-muted-foreground px-4">
            {isOver ? "Release to add block..." : "Drag blocks here to start building"}
          </p>
        </div>
      ) : (
        <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden">
          <div className="p-2 sm:p-4">
            <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {blocks.map((block) => (
                  <div key={block.id} data-block-id={block.id}>
                    <MarkdownBlock
                      block={block}
                      onUpdate={onBlockUpdate}
                      onDelete={onBlockDelete}
                      onBlockAdd={onBlockAdd}
                      onCopy={onBlockCopy}
                      onPasteAfter={onPasteAfter}
                      slideNumber={slideMetadata[block.id]?.slideNumber}
                      totalSlides={slideMetadata[block.id]?.totalSlides}
                    />
                  </div>
                ))}
                {/* Extended drop zone at the bottom */}
                <div className="h-32 w-full">
                  {isOver && (
                    <div className="h-16 border-2 border-dashed border-primary rounded-lg bg-muted/30 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Drop here</p>
                    </div>
                  )}
                </div>
              </div>
            </SortableContext>
          </div>
        </div>
      )}
    </div>
  );
});

export default Editor;
