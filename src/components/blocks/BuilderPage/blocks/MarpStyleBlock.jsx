import { Palette, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const CSS_TEMPLATES = {
  minimal: `section {
  background: #1a1a2e;
  color: #eee;
  font-family: 'Segoe UI', sans-serif;
}

h1, h2, h3 {
  color: #e94560;
}

code {
  background: #16213e;
  color: #0f9b8e;
}`,

  gradient: `section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

h1 {
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  border-bottom: 2px solid rgba(255,255,255,0.4);
}

strong {
  color: #ffd700;
}`,

  corporate: `section {
  background: #ffffff;
  color: #2c3e50;
  font-family: 'Arial', sans-serif;
}

h1, h2 {
  color: #2980b9;
  border-bottom: 3px solid #2980b9;
  padding-bottom: 0.3em;
}

blockquote {
  border-left: 4px solid #2980b9;
  background: #f0f8ff;
  padding: 0.5em 1em;
}`,
};

export default function MarpStyleBlock({ block, onUpdate }) {
  const handleChange = (value) => {
    onUpdate(block.id, { ...block, content: value });
  };

  const loadTemplate = (key) => {
    handleChange(CSS_TEMPLATES[key]);
  };

  return (
    <div className="group relative rounded-md border border-border bg-background transition-all hover:border-ring/50 focus-within:border-ring">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Palette className="h-3.5 w-3.5" />
          <span>Custom CSS</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground/60 mr-1">Templates:</span>
          {Object.keys(CSS_TEMPLATES).map((key) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              onClick={() => loadTemplate(key)}
              className="h-6 px-2 text-[10px] capitalize text-muted-foreground hover:text-primary"
            >
              <Wand2 className="mr-1 h-2.5 w-2.5" />
              {key}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={block.content || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`/* Custom CSS for your presentation */\nsection {\n  background: #1a1a2e;\n  color: #eee;\n}`}
          className="min-h-[180px] w-full resize-y border-0 bg-transparent p-3 font-mono text-sm leading-relaxed focus-visible:ring-0"
          spellCheck={false}
        />
        <div className="absolute bottom-2 right-3 opacity-40 pointer-events-none">
          <span className="text-[10px] text-muted-foreground font-mono">&lt;style&gt;</span>
        </div>
      </div>
    </div>
  );
}
