import { CheckCircle2, Download, FileX, Globe, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { createCourse, createModule } from "@/lib/storage";
import {
  applyTranslationsToModules,
  exportToXliff,
  extractBlockSegments,
  parseXliff,
} from "@/lib/xliffUtils";

// ─── Export Tab ───────────────────────────────────────────────────────────────

function ExportTab({ course, modules }) {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("xx");

  const countSegments = () => {
    try {
      return modules.reduce((sum, mod) => {
        const blocks = JSON.parse(mod.blocks_json || "[]");
        return sum + blocks.reduce((bs, b) => bs + extractBlockSegments(b).length, 0);
      }, 0);
    } catch {
      return 0;
    }
  };

  const handleDownload = () => {
    const xml = exportToXliff(course, modules, sourceLang.trim() || "en", targetLang.trim() || "xx");
    const blob = new Blob([xml], { type: "application/xliff+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${sourceLang.trim() || "en"}.xliff`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("XLIFF file downloaded. Send it to your translator.");
  };

  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-muted-foreground">
        Export all translatable text from this course as a XLIFF 1.2 file. Send it to a
        translation agency, then import the completed file to create a translated copy.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Source language</Label>
          <Input
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            placeholder="en"
            className="h-8"
          />
          <p className="text-[11px] text-muted-foreground/60">BCP-47 code, e.g. en, en-US</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Target language hint</Label>
          <Input
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            placeholder="fr"
            className="h-8"
          />
          <p className="text-[11px] text-muted-foreground/60">BCP-47 code, e.g. fr, de, ja</p>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Modules</span>
          <span className="font-medium tabular-nums">{modules.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Translatable text fields</span>
          <span className="font-medium tabular-nums">{countSegments()}</span>
        </div>
      </div>

      <Button onClick={handleDownload} className="w-full gap-2" disabled={!modules.length}>
        <Download className="h-4 w-4" />
        Download XLIFF
      </Button>
    </div>
  );
}

// ─── Import Tab ───────────────────────────────────────────────────────────────

function ImportTab({ course, modules, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [parsed, setParsed] = useState(null); // parseXliff result
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [creating, setCreating] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setParsed(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = parseXliff(ev.target.result);
        // Warn if segments cover unknown module IDs (file is for a different course)
        const knownIds = new Set(modules.map((m) => m.id));
        const unknownCount = result.segmentCounts.filter((s) => !knownIds.has(s.moduleId)).length;
        if (unknownCount > 0 && result.segmentCounts.length > 0) {
          setParseError(
            `${unknownCount} of ${result.segmentCounts.length} module(s) in this XLIFF do not match the current course. The file may be for a different course.`
          );
        }
        setParsed(result);
      } catch (err) {
        setParseError(err.message || "Failed to parse XLIFF file.");
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const totalTranslated = parsed?.segmentCounts.reduce((s, c) => s + c.translated, 0) ?? 0;
  const totalSegments = parsed?.segmentCounts.reduce((s, c) => s + c.total, 0) ?? 0;

  const handleCreate = async () => {
    if (!parsed || !user) return;
    setCreating(true);
    try {
      const targetLang = parsed.targetLang || "xx";
      const newTitle = `${course.title} [${targetLang}]`;

      // 1. Create new course
      const newCourse = await createCourse(
        user.id,
        newTitle,
        course.description || "",
        course.scorm_version || "1.2",
        course.pass_threshold ?? 80,
        course.max_attempts ?? 0
      );

      // 2. Apply translations to module clones
      const translatedModules = applyTranslationsToModules(modules, parsed);

      // 3. Insert translated modules
      await Promise.all(
        translatedModules.map((mod, idx) =>
          createModule(newCourse.id, mod.title, idx, mod.blocks_json)
        )
      );

      toast.success(
        <span>
          <strong>{newTitle}</strong> created successfully.{" "}
          <button
            type="button"
            className="underline text-primary"
            onClick={() => navigate(`/course/${newCourse.id}`)}
          >
            Open course
          </button>
        </span>,
        { duration: 8000 }
      );

      onClose();
    } catch (err) {
      toast.error(`Failed to create translated course: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-muted-foreground">
        Upload a completed XLIFF file (with{" "}
        <code className="text-xs bg-muted px-1 rounded">&lt;target&gt;</code> elements filled in
        by a translator). A new translated course will be created.
      </p>

      {/* File picker */}
      <div className="space-y-2">
        <Label className="text-xs">XLIFF file</Label>
        <div
          className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            {fileName ? (
              <p className="text-sm font-medium truncate">{fileName}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Click to select .xliff / .xlf file</p>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xliff,.xlf,application/xliff+xml,text/xml,application/xml"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Parse error */}
      {parseError && (
        <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50/40 dark:bg-amber-950/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          <FileX className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Segment preview */}
      {parsed && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Translation summary</p>
            {parsed.targetLang && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                {parsed.targetLang}
              </span>
            )}
          </div>

          <div className="rounded-lg border border-border/60 overflow-hidden divide-y divide-border/40">
            {/* Header */}
            <div className="grid grid-cols-3 px-3 py-1.5 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Module</span>
              <span className="text-right">Translated</span>
              <span className="text-right">Total</span>
            </div>
            {parsed.segmentCounts.map((sc) => {
              const pct = sc.total > 0 ? Math.round((sc.translated / sc.total) * 100) : 0;
              return (
                <div key={sc.moduleId} className="grid grid-cols-3 px-3 py-2 text-xs items-center">
                  <span className="truncate text-muted-foreground">{sc.moduleLabel.split(" | ")[0].replace("Module: ", "")}</span>
                  <span className="text-right tabular-nums font-medium">{sc.translated}</span>
                  <span className="text-right tabular-nums text-muted-foreground">
                    {sc.total}{" "}
                    <span className={pct === 100 ? "text-emerald-500" : "text-muted-foreground/60"}>
                      ({pct}%)
                    </span>
                  </span>
                </div>
              );
            })}
            {/* Total row */}
            <div className="grid grid-cols-3 px-3 py-2 bg-muted/10 text-xs font-semibold items-center">
              <span>Total</span>
              <span className="text-right tabular-nums">{totalTranslated}</span>
              <span className="text-right tabular-nums text-muted-foreground">{totalSegments}</span>
            </div>
          </div>

          {totalTranslated === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No translated segments found. Make sure the{" "}
              <code className="bg-muted px-1 rounded">&lt;target&gt;</code> elements are filled in.
            </p>
          )}
        </div>
      )}

      <Button
        onClick={handleCreate}
        disabled={!parsed || totalTranslated === 0 || creating}
        className="w-full gap-2"
      >
        {creating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {creating ? "Creating…" : "Create translated course"}
      </Button>
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export default function XliffDialog({ open, onOpenChange, course, modules }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-500" />
            Localization — XLIFF
          </DialogTitle>
          <DialogDescription>
            Export text for translation or import a translated XLIFF to clone this course.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="export" className="flex-1 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1 text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-3">
            <ExportTab course={course} modules={modules} />
          </TabsContent>
          <TabsContent value="import" className="mt-3">
            <ImportTab
              course={course}
              modules={modules}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
