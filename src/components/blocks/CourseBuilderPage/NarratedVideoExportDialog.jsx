import { AlertCircle, CheckCircle2, Film, LoaderCircle, Server, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createNarratedVideoJob,
  getNarratedVideoArtifactUrl,
  getNarratedVideoJob,
  getNarratedVideoWorkerBaseUrl,
  getNarratedVideoWorkerDoctor,
  getNarratedVideoWorkerHealth,
} from "@/lib/narratedVideoWorker";

const TERMINAL_STATES = new Set(["completed", "failed", "canceled"]);
const DEPENDENCY_ORDER = ["ffmpeg", "ffprobe", "marp", "python", "uv", "ollama"];

export default function NarratedVideoExportDialog({ open, onOpenChange, blocks, title }) {
  const [health, setHealth] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [job, setJob] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [voice, setVoice] = useState("default");
  const [model, setModel] = useState("kugelaudio/kugelaudio-0-open");
  const [useOllama, setUseOllama] = useState(false);

  const dependencyRows = useMemo(() => {
    if (!doctor?.dependencies) return [];
    return DEPENDENCY_ORDER.map((key) => doctor.dependencies[key]).filter(Boolean);
  }, [doctor]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setJob(null);
      setJobId(null);
      return;
    }

    let cancelled = false;
    setLoadingStatus(true);

    Promise.allSettled([getNarratedVideoWorkerHealth(), getNarratedVideoWorkerDoctor()])
      .then((results) => {
        if (cancelled) return;

        const [healthResult, doctorResult] = results;
        if (healthResult.status === "fulfilled") {
          setHealth(healthResult.value);
        } else {
          setHealth(null);
          setError(healthResult.reason?.message || "Worker is offline.");
        }

        if (doctorResult.status === "fulfilled") {
          setDoctor(doctorResult.value);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingStatus(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !jobId || TERMINAL_STATES.has(job?.status)) {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const nextJob = await getNarratedVideoJob(jobId);
        setJob(nextJob);
      } catch (pollError) {
        setError(pollError.message);
      }
    }, 1200);

    return () => window.clearInterval(timer);
  }, [job?.status, jobId, open]);

  const handleStart = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const createdJob = await createNarratedVideoJob({
        title,
        blocks,
        language,
        voice,
        model,
        useOllama,
      });
      setJob(createdJob);
      setJobId(createdJob.id);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const workerOffline = !health;
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            Narrated Video Pipeline
            <Badge variant="outline" className="ml-1 text-[10px] uppercase tracking-wide">
              Worker Beta
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Runs the local Windows/Linux worker. This implementation slice validates the current MARP deck and writes the
            normalized presentation, narration SSML, transcript, and background-task artifacts that the video, localization,
            and packaging stages will consume next.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="rounded-lg border bg-muted/10 p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Local Worker</span>
              </div>
              {loadingStatus ? (
                <Badge variant="secondary" className="gap-1.5">
                  <LoaderCircle className="h-3 w-3 animate-spin" />
                  Checking
                </Badge>
              ) : health ? (
                <Badge variant="secondary" className="gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Online
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  Offline
                </Badge>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Endpoint: {getNarratedVideoWorkerBaseUrl()}</p>
              <p>Current scope: artifact preparation only. Final MP4 composition is not wired into the worker yet.</p>
            </div>

            {workerOffline && !loadingStatus && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                Start the local worker with <strong>npm run video:worker</strong>, then reopen this dialog.
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-medium">Render Settings</Label>
                <Badge variant="outline" className="gap-1 text-[10px] uppercase tracking-wide">
                  <Sparkles className="h-3 w-3" />
                  KugelAudio
                </Badge>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="clear">Clear</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kugelaudio/kugelaudio-0-open">KugelAudio Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-2">
                <div className="space-y-0.5">
                  <Label className="text-xs">Use Ollama cleanup</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Keeps the scope local. Timing still comes from the measured audio manifest.
                  </p>
                </div>
                <Switch checked={useOllama} onCheckedChange={setUseOllama} />
              </div>

              <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                The worker currently prepares <strong>presentation.md</strong>, <strong>narration.ssml</strong>, <strong>transcript.json</strong>, and a
                background work plan for localization and SCORM packaging. Those artifacts are the exact inputs the upcoming render and automation stages will use.
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-sm font-medium">Dependency Doctor</Label>
              {dependencyRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Dependency checks will appear here when the worker is reachable.
                </p>
              ) : (
                <div className="space-y-2">
                  {dependencyRows.map((dependency) => (
                    <div key={dependency.name} className="flex items-center justify-between gap-2 rounded-md bg-muted/10 px-2.5 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide">{dependency.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {dependency.resolvedPath || dependency.error || dependency.command}
                        </p>
                      </div>
                      <Badge
                        variant={dependency.available ? "secondary" : dependency.required ? "destructive" : "outline"}
                        className="shrink-0"
                      >
                        {dependency.available ? "Ready" : dependency.required ? "Missing" : "Optional"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {job && (
            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Job Status</p>
                  <p className="text-xs text-muted-foreground">{job.id}</p>
                </div>
                <Badge variant={job.status === "completed" ? "secondary" : job.status === "failed" ? "destructive" : "outline"}>
                  {job.stage}
                </Badge>
              </div>

              {job.error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {job.error}
                </div>
              )}

              {Array.isArray(job.warnings) && job.warnings.length > 0 && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  {job.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}

              {job.artifacts && (
                <div className="flex flex-wrap gap-2">
                  {Object.values(job.artifacts).map((artifact) => (
                    <Button key={artifact.key} variant="outline" size="sm" asChild>
                      <a href={getNarratedVideoArtifactUrl(job.id, artifact.key)} target="_blank" rel="noreferrer">
                        {artifact.label}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && !job?.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleStart} disabled={workerOffline || !hasBlocks || isSubmitting || loadingStatus} className="gap-2">
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
            Prepare Render Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}