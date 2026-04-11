import { Film, Square } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useVideoExport } from "@/hooks/useVideoExport";

const RESOLUTIONS = [
  { label: "720p (1280×720)", value: "720p", width: 1280, height: 720 },
  { label: "1080p (1920×1080)", value: "1080p", width: 1920, height: 1080 },
];

const FPS_OPTIONS = [
  { label: "15 FPS", value: 15 },
  { label: "24 FPS", value: 24 },
  { label: "30 FPS", value: 30 },
];

export default function VideoExportDialog({ open, onOpenChange, marpRef }) {
  const [secondsPerSlide, setSecondsPerSlide] = useState(3);
  const [resolution, setResolution] = useState("720p");
  const [fps, setFps] = useState(24);
  const { startRecording, stopRecording, isRecording, progress } = useVideoExport();
  const [error, setError] = useState(null);

  const selectedRes = RESOLUTIONS.find((r) => r.value === resolution) || RESOLUTIONS[0];

  const handleStart = async () => {
    setError(null);
    const timestamp = new Date().toISOString().split("T")[0];
    try {
      await startRecording(marpRef, {
        secondsPerSlide,
        fps,
        width: selectedRes.width,
        height: selectedRes.height,
        filename: `courseforge-presentation-${timestamp}.webm`,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStop = () => {
    stopRecording();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isRecording) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            Export Presentation as Video
          </DialogTitle>
          <DialogDescription>
            Records each slide and downloads a <code>.webm</code> video file.
            Best supported in Chrome and Edge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Seconds per slide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Seconds per slide</Label>
              <span className="text-sm text-muted-foreground tabular-nums">{secondsPerSlide}s</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[secondsPerSlide]}
              onValueChange={([v]) => setSecondsPerSlide(v)}
              disabled={isRecording}
            />
          </div>

          {/* Resolution */}
          <div className="space-y-1.5">
            <Label className="text-sm">Resolution</Label>
            <Select value={resolution} onValueChange={setResolution} disabled={isRecording}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frame rate */}
          <div className="space-y-1.5">
            <Label className="text-sm">Frame rate</Label>
            <Select
              value={String(fps)}
              onValueChange={(v) => setFps(Number(v))}
              disabled={isRecording}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FPS_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={String(f.value)}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          {isRecording && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Recording…</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <Progress value={progress * 100} className="h-2" />
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          {isRecording ? (
            <Button variant="destructive" onClick={handleStop} className="gap-2">
              <Square className="h-3.5 w-3.5 fill-current" />
              Stop Recording
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleStart} className="gap-2">
                <Film className="h-3.5 w-3.5" />
                Start Recording
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
