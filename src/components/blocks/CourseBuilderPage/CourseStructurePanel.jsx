import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BookOpen,
  Clipboard,
  Copy,
  ChevronRight,
  FolderPlus,
  GripVertical,
  Lock,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCourse } from "@/context/CourseContext";
import { copyBlocksToClipboard, pasteBlocksFromClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────
const UNSECTIONED = "__unsectioned__";

// ── Drag overlay ghost ────────────────────────────────────────────────────────
function ModuleGhost({ title }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/30 text-sm font-medium shadow-lg backdrop-blur-sm cursor-grabbing max-w-[220px]">
      <GripVertical className="h-3.5 w-3.5 text-primary/60 shrink-0" />
      <span className="truncate">{title}</span>
    </div>
  );
}

// ── Sortable module row ───────────────────────────────────────────────────────
function SortableModuleItem({
  module,
  containerId,
  isActive,
  onClick,
  onRename,
  onDelete,
  sections,
  onAssignSection,
  onCopyModuleBlocks,
  onPasteIntoModule,
  readonlyStructure = false,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
    data: { type: "module", containerId },
  });

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const commitRename = () => {
    setEditing(false);
    if (editTitle.trim() && editTitle !== module.title) {
      onRename(module.id, editTitle.trim());
    } else {
      setEditTitle(module.title);
    }
  };

  const blockCount = (() => {
    try {
      return JSON.parse(module.blocks_json || "[]").length;
    } catch {
      return 0;
    }
  })();

  const currentSection = sections.find((s) => s.moduleIds.includes(module.id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
        isDragging && "pointer-events-none",
      )}
      onClick={() => !editing && onClick(module.id)}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-60"
        {...(readonlyStructure ? {} : { ...attributes, ...listeners })}
        style={{ touchAction: "none", visibility: readonlyStructure ? "hidden" : undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </Button>

      {editing ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setEditing(false);
              setEditTitle(module.title);
            }
          }}
          className="h-6 text-xs px-1 bg-transparent border-0 border-b border-primary focus-visible:ring-0 rounded-none"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <ChevronRight
            className={cn(
              "h-3 w-3 shrink-0 transition-transform",
              isActive && "text-primary rotate-90",
            )}
          />
          <span
            className="flex-1 text-sm truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            title="Double-click to rename"
          >
            {module.title}
          </span>
          <span className="text-[10px] text-muted-foreground/50 shrink-0">{blockCount}</span>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {!readonlyStructure && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              Rename
            </DropdownMenuItem>
          )}
          {!readonlyStructure && <DropdownMenuSeparator />}
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCopyModuleBlocks(module);
            }}
          >
            <Copy className="h-3.5 w-3.5 mr-2" />
            Copy module blocks
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onPasteIntoModule(module.id);
            }}
          >
            <Clipboard className="h-3.5 w-3.5 mr-2" />
            Paste blocks here
          </DropdownMenuItem>
          {sections.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {currentSection && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignSection(module.id, null);
                  }}
                >
                  Remove from section
                </DropdownMenuItem>
              )}
              {sections.map((sec) => (
                <DropdownMenuItem
                  key={sec.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignSection(module.id, sec.id);
                  }}
                  disabled={sec.id === currentSection?.id}
                >
                  Move to: {sec.title}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          {!readonlyStructure && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(module.id);
              }}
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Droppable section body ────────────────────────────────────────────────────
function DroppableSectionBody({ sectionId, isEmpty, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    data: { type: "container", containerId: sectionId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "pl-4 rounded-sm transition-colors min-h-[4px]",
        isOver && "bg-primary/5 ring-1 ring-primary/20 ring-inset",
        isEmpty && isOver && "pb-2 pt-1",
      )}
    >
      {isEmpty && !isOver && (
        <p className="text-[10px] text-muted-foreground/40 px-2 py-1">No modules in this section</p>
      )}
      {children}
      {isEmpty && isOver && (
        <p className="text-[10px] text-primary/60 px-2 py-1 text-center">Drop to add to section</p>
      )}
    </div>
  );
}

// ── Droppable unsectioned body ────────────────────────────────────────────────
function DroppableUnsectionedBody({ isEmpty, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: UNSECTIONED,
    data: { type: "container", containerId: UNSECTIONED },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-sm transition-colors min-h-[4px]",
        isEmpty && isOver && "bg-primary/5 ring-1 ring-primary/20 ring-inset pb-2 pt-1",
      )}
    >
      {children}
      {isEmpty && isOver && (
        <p className="text-[10px] text-primary/60 px-2 py-1 text-center">Drop here</p>
      )}
    </div>
  );
}

// ── Collapsible section wrapper ───────────────────────────────────────────────
function CollapsibleSection({
  section,
  sectionModules,
  activeModuleId,
  onModuleClick,
  onModuleRename,
  onModuleDelete,
  onSectionRename,
  onSectionDelete,
  allSections,
  onAssignSection,
  onCopyModuleBlocks,
  onPasteIntoModule,
  readonlyStructure = false,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const commitRename = () => {
    setEditingTitle(false);
    if (editTitle.trim() && editTitle !== section.title) {
      onSectionRename(section.id, editTitle.trim());
    } else {
      setEditTitle(section.title);
    }
  };

  return (
    <div className="mt-1">
      {/* Section header */}
      <div className="group flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/30">
        <button
          type="button"
          className="flex items-center gap-1 flex-1 min-w-0 text-left"
          onClick={() => !editingTitle && setCollapsed((v) => !v)}
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 shrink-0 transition-transform text-muted-foreground",
              !collapsed && "rotate-90",
            )}
          />
          {editingTitle ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setEditingTitle(false);
                  setEditTitle(section.title);
                }
              }}
              className="h-5 text-xs px-1 bg-transparent border-0 border-b border-primary focus-visible:ring-0 rounded-none flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingTitle(true);
              }}
              title="Double-click to rename section"
            >
              {section.title}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/40 shrink-0 ml-1">
            {sectionModules.length}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onSectionDelete(section.id);
          }}
          title="Delete section"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Section modules */}
      {!collapsed && (
        <DroppableSectionBody sectionId={section.id} isEmpty={sectionModules.length === 0}>
          <SortableContext
            items={sectionModules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {sectionModules.map((mod) => (
              <SortableModuleItem
                key={mod.id}
                module={mod}
                containerId={section.id}
                isActive={mod.id === activeModuleId}
                onClick={onModuleClick}
                onRename={onModuleRename}
                onDelete={onModuleDelete}
                sections={allSections}
                onAssignSection={onAssignSection}
                onCopyModuleBlocks={onCopyModuleBlocks}
                onPasteIntoModule={onPasteIntoModule}
                readonlyStructure={readonlyStructure}
              />
            ))}
          </SortableContext>
        </DroppableSectionBody>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function CourseStructurePanel({ className }) {
  const {
    course,
    modules,
    activeModuleId,
    setActiveModuleId,
    addModule,
    renameModule,
    removeModule,
    reorderModuleList,
    sections,
    addSection,
    renameSection,
    removeSection,
    assignModuleToSection,
    persistSections,
    pasteBlocksIntoModule,
  } = useCourse();

  const isTemplateLocked = !!course?.template_id;

  const handleCopyModuleBlocks = async (module) => {
    const blocks = (() => {
      try {
        return JSON.parse(module.blocks_json || "[]");
      } catch {
        return [];
      }
    })();
    if (!blocks.length) {
      toast.error("No blocks to copy");
      return;
    }
    await copyBlocksToClipboard(blocks);
    toast.success(`${blocks.length} block${blocks.length !== 1 ? "s" : ""} copied`);
  };

  const handlePasteIntoModule = async (moduleId) => {
    const pasted = await pasteBlocksFromClipboard();
    if (!pasted?.length) {
      toast.error("Nothing to paste");
      return;
    }
    await pasteBlocksIntoModule(moduleId, pasted);
    toast.success(`${pasted.length} block${pasted.length !== 1 ? "s" : ""} pasted`);
  };

  const [draggedId, setDraggedId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const unsectionedModules = modules.filter(
    (m) => !sections.some((s) => s.moduleIds.includes(m.id)),
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  /** Returns the containerId for a module: UNSECTIONED or a section ID */
  const getModuleContainer = (moduleId) => {
    for (const s of sections) {
      if (s.moduleIds.includes(moduleId)) return s.id;
    }
    return UNSECTIONED;
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => setDraggedId(active.id);
  const handleDragCancel = () => setDraggedId(null);

  const handleDragEnd = ({ active, over }) => {
    setDraggedId(null);
    if (isTemplateLocked) return;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    // Resolve source container
    const activeContainerId =
      active.data.current?.containerId ?? getModuleContainer(activeId);

    // Resolve target container: could be a module (has containerId in data) or a droppable container
    const overIsContainer = over.data.current?.type === "container";
    const overContainerId = overIsContainer
      ? over.data.current.containerId
      : (over.data.current?.containerId ?? getModuleContainer(overId));

    // ── Same container: reorder ──────────────────────────────────────────
    if (activeContainerId === overContainerId) {
      if (activeContainerId === UNSECTIONED) {
        const oldIdx = unsectionedModules.findIndex((m) => m.id === activeId);
        const newIdx = unsectionedModules.findIndex((m) => m.id === overId);
        if (oldIdx === -1 || newIdx === -1) return;
        const newUnsectioned = arrayMove(unsectionedModules, oldIdx, newIdx);
        // Preserve sectioned modules at the end of the flat list
        const sectionedModules = modules.filter((m) =>
          sections.some((s) => s.moduleIds.includes(m.id)),
        );
        reorderModuleList([...newUnsectioned, ...sectionedModules]);
      } else {
        const section = sections.find((s) => s.id === activeContainerId);
        if (!section) return;
        const oldIdx = section.moduleIds.indexOf(activeId);
        const newIdx = overIsContainer
          ? section.moduleIds.length
          : section.moduleIds.indexOf(overId);
        if (oldIdx === -1 || newIdx === -1) return;
        persistSections(
          sections.map((s) =>
            s.id === activeContainerId
              ? { ...s, moduleIds: arrayMove(s.moduleIds, oldIdx, newIdx) }
              : s,
          ),
        );
      }
      return;
    }

    // ── Cross-container: move module ─────────────────────────────────────
    // Remove from all sections first
    let newSections = sections.map((s) => ({
      ...s,
      moduleIds: s.moduleIds.filter((id) => id !== activeId),
    }));

    if (overContainerId === UNSECTIONED) {
      // Dropped back into unsectioned — just remove from all sections
      persistSections(newSections);
    } else {
      // Dropped into a section — insert at position
      const targetSec = newSections.find((s) => s.id === overContainerId);
      if (!targetSec) return;

      let insertIdx;
      if (overIsContainer) {
        insertIdx = targetSec.moduleIds.length; // append to end
      } else {
        const overIdx = targetSec.moduleIds.indexOf(overId);
        insertIdx = overIdx === -1 ? targetSec.moduleIds.length : overIdx + 1;
      }

      newSections = newSections.map((s) => {
        if (s.id !== overContainerId) return s;
        const ids = [...s.moduleIds];
        ids.splice(insertIdx, 0, activeId);
        return { ...s, moduleIds: ids };
      });
      persistSections(newSections);
    }
  };

  const draggedModule = modules.find((m) => m.id === draggedId);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col h-full border-r bg-card", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b shrink-0">
        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate flex-1">{course?.title || "Course"}</span>
        {isTemplateLocked ? (
          <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" title="Structure locked by template" />
        ) : (
          <span className="text-xs text-muted-foreground shrink-0">
            {modules.length} mod{modules.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {/* Unsectioned modules */}
            <DroppableUnsectionedBody isEmpty={unsectionedModules.length === 0}>
              <SortableContext
                items={unsectionedModules.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                {unsectionedModules.map((mod) => (
                  <SortableModuleItem
                    key={mod.id}
                    module={mod}
                    containerId={UNSECTIONED}
                    isActive={mod.id === activeModuleId}
                    onClick={setActiveModuleId}
                    onRename={renameModule}
                    onDelete={removeModule}
                    sections={sections}
                    onAssignSection={assignModuleToSection}
                    onCopyModuleBlocks={handleCopyModuleBlocks}
                    onPasteIntoModule={handlePasteIntoModule}
                    readonlyStructure={isTemplateLocked}
                  />
                ))}
              </SortableContext>
            </DroppableUnsectionedBody>

            {/* Sections */}
            {sections.map((section) => {
              const sectionModules = section.moduleIds
                .map((id) => modules.find((m) => m.id === id))
                .filter(Boolean);

              return (
                <CollapsibleSection
                  key={section.id}
                  section={section}
                  sectionModules={sectionModules}
                  activeModuleId={activeModuleId}
                  onModuleClick={setActiveModuleId}
                  onModuleRename={renameModule}
                  onModuleDelete={removeModule}
                  onSectionRename={renameSection}
                  onSectionDelete={removeSection}
                  allSections={sections}
                  onAssignSection={assignModuleToSection}
                  onCopyModuleBlocks={handleCopyModuleBlocks}
                  onPasteIntoModule={handlePasteIntoModule}
                  readonlyStructure={isTemplateLocked}
                />
              );
            })}

            {/* Drag overlay */}
            <DragOverlay dropAnimation={null}>
              {draggedModule && <ModuleGhost title={draggedModule.title} />}
            </DragOverlay>
          </DndContext>

          {modules.length === 0 && sections.length === 0 && (
            <p className="text-xs text-muted-foreground/60 px-2 py-3 text-center">
              No modules yet
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t shrink-0 space-y-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs gap-1"
          onClick={() => {
            if (course?.id) addModule();
            else console.warn("Course not loaded yet");
          }}
          disabled={!course?.id || isTemplateLocked}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Module
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (course?.id) addSection();
            else console.warn("Course not loaded yet");
          }}
          disabled={!course?.id || isTemplateLocked}
        >
          <FolderPlus className="h-3.5 w-3.5" />
          Add Section
        </Button>
      </div>
    </div>
  );
}
