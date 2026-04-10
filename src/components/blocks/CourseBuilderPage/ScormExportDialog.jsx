import { Download, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { exportToScorm12, exportToScorm2004 } from "@/lib/scormUtils";

export default function ScormExportDialog({ open, onOpenChange, course, modules }) {
  const [scormVersion, setScormVersion] = useState("1.2");
  const [passThreshold, setPassThreshold] = useState(course?.pass_threshold ?? 80);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    if (!modules || modules.length === 0) {
      setError("No modules to export.");
      return;
    }
    setError(null);
    setIsExporting(true);
    setProgress(20);
    try {
      const courseData = { ...course, pass_threshold: passThreshold };
      setProgress(50);
      if (scormVersion === "1.2") {
        await exportToScorm12(courseData, modules);
      } else {
        await exportToScorm2004(courseData, modules);
      }
      setProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
        onOpenChange(false);
      }, 600);
    } catch (err) {
      setError(err.message || "Export failed.");
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isExporting) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-500" />
            Export SCORM Package
          </DialogTitle>
          <DialogDescription>
            Generate a ZIP file ready for upload to any SCORM-conformant LMS (Moodle, Canvas,
            Blackboard, TalentLMS, etc.).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* SCORM version */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">SCORM Version</Label>
            <RadioGroup value={scormVersion} onValueChange={setScormVersion} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1.2" id="v12" />
                <Label htmlFor="v12" className="cursor-pointer font-normal">
                  SCORM 1.2
                  <span className="ml-1.5 text-xs text-muted-foreground">(most compatible)</span>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="2004" id="v2004" />
                <Label htmlFor="v2004" className="cursor-pointer font-normal">
                  SCORM 2004
                  <span className="ml-1.5 text-xs text-muted-foreground">(4th Edition)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pass threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Pass Threshold</Label>
              <span className="text-sm font-semibold tabular-nums">{passThreshold}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[passThreshold]}
              onValueChange={([v]) => setPassThreshold(v)}
              className="w-full"
            />
          </div>

          {/* Package summary */}
          <div className="rounded-md bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Course title</span>
              <span className="font-medium text-foreground truncate ml-4">{course?.title || "Untitled"}</span>
            </div>
            <div className="flex justify-between">
              <span>Modules</span>
              <span className="font-medium text-foreground">{modules?.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Format</span>
              <span className="font-medium text-foreground">SCORM {scormVersion} + HTML</span>
            </div>
          </div>

          {isExporting && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Building package…</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !modules?.length}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Generating…" : "Download SCORM Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
