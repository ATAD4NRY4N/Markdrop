import { Trash2, GripVertical, LayoutGrid, Type, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function GridBlock({ block, onUpdate }) {
  const columns = block.columns || [{ type: "text", content: "Column 1 text" }, { type: "text", content: "Column 2 text" }];
  const colsCount = columns.length;

  const handleColContentChange = (index, value) => {
    const newCols = [...columns];
    newCols[index] = { ...newCols[index], content: value };
    onUpdate({ ...block, columns: newCols });
  };

  const handleColTypeChange = (index, type) => {
    const newCols = [...columns];
    newCols[index] = { ...newCols[index], type, content: "" };
    onUpdate({ ...block, columns: newCols });
  };

  const handleAddColumn = () => {
    if (colsCount >= 4) return;
    onUpdate({ ...block, columns: [...columns, { type: "text", content: `Column ${colsCount + 1}` }] });
  };

  const handleRemoveColumn = (index) => {
    if (colsCount <= 1) return;
    const newCols = columns.filter((_, i) => i !== index);
    onUpdate({ ...block, columns: newCols });
  };

  // ----------------------------------------------------
  // PREVIEW / LEARNER MODE
  // ----------------------------------------------------
  if (!onUpdate) {
    return (
      <div 
        className="grid gap-4 my-6" 
        style={{ gridTemplateColumns: \`repeat(\${colsCount}, minmax(0, 1fr))\` }}
      >
        {columns.map((col, index) => (
          <div key={index} className="flex flex-col gap-2">
            {col.type === "text" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose dark:prose-invert max-w-none text-sm break-words"
              >
                {col.content}
              </ReactMarkdown>
            ) : col.content ? (
              <img 
                src={col.content} 
                alt={\`Column \${index + 1}\`} 
                className="w-full h-auto rounded-lg shadow-sm"
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  // ----------------------------------------------------
  // EDITOR MODE
  // ----------------------------------------------------
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-4 bg-white dark:bg-neutral-900 shadow-sm relative group mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-violet-500">
          <LayoutGrid className="h-5 w-5" />
          <span className="font-semibold text-sm uppercase tracking-wider">CSS Grid Columns</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddColumn}
            disabled={colsCount >= 4}
            className="text-xs h-7"
          >
            + Add Column
          </Button>
        </div>
      </div>

      <div className={`grid gap-4`} style={{ gridTemplateColumns: \`repeat(\${colsCount}, 1fr)\` }}>
        {columns.map((col, index) => (
          <div key={index} className="border border-neutral-100 dark:border-neutral-800 rounded-md p-3 relative group/col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-neutral-500 uppercase">Col {index + 1}</span>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={\`h-6 w-6 \${col.type === "text" ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30" : "text-neutral-400"}\`}
                  onClick={() => handleColTypeChange(index, "text")}
                >
                  <Type className="h-3 w-3" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={\`h-6 w-6 \${col.type === "image" ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30" : "text-neutral-400"}\`}
                  onClick={() => handleColTypeChange(index, "image")}
                >
                  <ImageIcon className="h-3 w-3" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 text-red-500 hover:bg-red-50"
                  onClick={() => handleRemoveColumn(index)}
                  disabled={colsCount <= 1}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {col.type === "text" ? (
              <Textarea 
                className="w-full min-h-[100px] text-sm resize-y"
                value={col.content}
                placeholder="Markdown text here..."
                onChange={(e) => handleColContentChange(index, e.target.value)}
              />
            ) : (
              <div className="space-y-2">
                <Input 
                  placeholder="https://image-url.jpg" 
                  value={col.content}
                  className="text-sm h-8"
                  onChange={(e) => handleColContentChange(index, e.target.value)}
                />
                {col.content && (
                  <div className="aspect-video w-full rounded bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    <img src={col.content} alt="Column preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-neutral-400 italic">
        * Renders side-by-side using CSS Grid on desktop, and stacks gracefully on mobile browsers.
      </div>
    </div>
  );
}