import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BookOpen,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCourse } from "@/context/CourseContext";
import { cn } from "@/lib/utils";

function SortableModuleItem({ module, isActive, onClick, onRename, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const commitRename = () => {
    setEditing(false);
    if (editTitle.trim() && editTitle !== module.title) {
      onRename(module.id, editTitle.trim());
    } else {
      setEditTitle(module.title);
    }
  };

  const blocks = (() => {
    try { return JSON.parse(module.blocks_json || "[]"); } catch { return []; }
  })();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
      )}
      onClick={() => !editing && onClick(module.id)}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-60"
        {...attributes}
        {...listeners}
        style={{ touchAction: "none" }}
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
            if (e.key === "Escape") { setEditing(false); setEditTitle(module.title); }
          }}
          className="h-6 text-xs px-1 bg-transparent border-0 border-b border-primary focus-visible:ring-0 rounded-none"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <ChevronRight className={cn("h-3 w-3 shrink-0 transition-transform", isActive && "text-primary rotate-90")} />
          <span
            className="flex-1 text-sm truncate"
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
            title="Double-click to rename"
          >
            {module.title}
          </span>
          <span className="text-[10px] text-muted-foreground/50 shrink-0">
            {blocks.length}
          </span>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-destructive"
        onClick={(e) => { e.stopPropagation(); onDelete(module.id); }}
        title="Delete module"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export default function CourseStructurePanel({ className }) {
  const { course, modules, activeModuleId, setActiveModuleId, addModule, renameModule, removeModule, reorderModuleList } = useCourse();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderModuleList(arrayMove(modules, oldIndex, newIndex));
    }
  };

  return (
    <div className={cn("flex flex-col h-full border-r bg-card", className)}>
      <div className="flex items-center gap-2 px-3 py-3 border-b shrink-0">
        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate flex-1">
          {course?.title || "Course"}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {modules.length} mod{modules.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {modules.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 px-2 py-3 text-center">
              No modules yet
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                {modules.map((mod) => (
                  <SortableModuleItem
                    key={mod.id}
                    module={mod}
                    isActive={mod.id === activeModuleId}
                    onClick={setActiveModuleId}
                    onRename={renameModule}
                    onDelete={removeModule}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs gap-1"
          onClick={() => addModule()}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Module
        </Button>
      </div>
    </div>
  );
}
