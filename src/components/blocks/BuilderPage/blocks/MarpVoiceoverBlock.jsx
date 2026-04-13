import { Mic, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createVoiceoverSegment,
  normalizeVoiceoverBlock,
  parseVoiceoverScript,
  parseVoiceoverSsml,
  stringifyVoiceoverSegments,
  voiceoverSegmentsToSsml,
} from "@/lib/marp";

const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "de-DE", label: "German" },
  { value: "fr-FR", label: "French" },
  { value: "es-ES", label: "Spanish" },
  { value: "it-IT", label: "Italian" },
  { value: "nl-NL", label: "Dutch" },
  { value: "pl-PL", label: "Polish" },
];

const VOICE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "warm", label: "Warm" },
  { value: "clear", label: "Clear" },
];

const MODEL_OPTIONS = [
  { value: "kugelaudio/kugelaudio-0-open", label: "KugelAudio Open" },
];

const LOCALIZATION_RUNTIME_OPTIONS = [
  { value: "ollama", label: "Ollama (local)" },
  { value: "cloud-api", label: "Cloud API" },
];

const SCORM_PROFILE_OPTIONS = [
  { value: "scorm-1.2", label: "SCORM 1.2" },
  { value: "scorm-2004-4th", label: "SCORM 2004 4th" },
];

export default function MarpVoiceoverBlock({ block, onUpdate }) {
  const normalizedBlock = normalizeVoiceoverBlock(block);
  const ssmlImportRef = useRef(null);
  const segments =
    normalizedBlock.segments?.length > 0
      ? normalizedBlock.segments
      : [createVoiceoverSegment()];

  const updateBlock = (updates) => {
    onUpdate(block.id, normalizeVoiceoverBlock({ ...normalizedBlock, ...updates }));
  };

  const updateSegments = (nextSegments) => {
    const content = stringifyVoiceoverSegments(nextSegments);
    updateBlock({ segments: nextSegments, content });
  };

  const updateSegment = (segmentId, field, value) => {
    const nextSegments = segments.map((segment) =>
      segment.id === segmentId
        ? {
            ...segment,
            [field]: field === "pauseAfterMs" ? Number.parseInt(value, 10) || 0 : value,
          }
        : segment
    );
    updateSegments(nextSegments);
  };

  const addSegment = () => {
    updateSegments([...segments, createVoiceoverSegment()]);
  };

  const removeSegment = (segmentId) => {
    const nextSegments = segments.filter((segment) => segment.id !== segmentId);
    updateSegments(nextSegments.length > 0 ? nextSegments : [createVoiceoverSegment()]);
  };

  const syncSegmentsFromScript = () => {
    const parsed = parseVoiceoverScript(normalizedBlock.content);
    updateBlock({
      segments: parsed.length > 0 ? parsed : [createVoiceoverSegment()],
      content: normalizedBlock.content,
    });
  };

  const handleExportSsml = () => {
    const ssml = voiceoverSegmentsToSsml(segments, {
      language: normalizedBlock.sourceLocale,
      voice: normalizedBlock.voice,
    });
    const blob = new Blob([ssml], { type: "application/ssml+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `slide-narration-${block.id}.ssml`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSsml = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseVoiceoverSsml(text);
    updateBlock({
      content: stringifyVoiceoverSegments(parsed),
      segments: parsed.length > 0 ? parsed : [createVoiceoverSegment()],
      interchangeFormat: "ssml",
    });
    event.target.value = "";
  };

  const toggleScormProfile = (profile) => {
    const profiles = normalizedBlock.scormProfiles || [];
    const nextProfiles = profiles.includes(profile)
      ? profiles.filter((value) => value !== profile)
      : [...profiles, profile];
    updateBlock({ scormProfiles: nextProfiles });
  };

  return (
    <div className="group relative rounded-md border border-border bg-background transition-all focus-within:border-ring">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/10">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Mic className="h-3.5 w-3.5" />
          <span>Slide Narration</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-3 w-3" />
          SSML + Worker
        </div>
      </div>

      <div className="p-3 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs text-muted-foreground">Narration Script</Label>
            <div className="flex items-center gap-1">
              <input
                ref={ssmlImportRef}
                type="file"
                accept=".ssml,.xml,text/xml,application/xml"
                className="hidden"
                onChange={handleImportSsml}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px]"
                onClick={() => ssmlImportRef.current?.click()}
              >
                Import SSML
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px]"
                onClick={handleExportSsml}
              >
                Export SSML
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px]"
                onClick={syncSegmentsFromScript}
              >
                Sync Segments
              </Button>
            </div>
          </div>
          <Textarea
            value={normalizedBlock.content}
            onChange={(event) => updateBlock({ content: event.target.value })}
            placeholder="Add narration here. Use [PAUSE:1000] to insert a one-second pause. English is the default authoring locale."
            className="min-h-24 resize-y bg-muted/20 border-0 focus-visible:ring-1"
          />
          <p className="text-[10px] text-muted-foreground/70">
            This block is the narration source of truth. The worker derives canonical SSML, downstream localization tasks, subtitles, and packaging work from it.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Canonical SSML</Label>
          <Textarea
            value={normalizedBlock.ssml}
            readOnly
            className="min-h-28 resize-y bg-muted/10 border-0 font-mono text-[11px] focus-visible:ring-0"
          />
          <p className="text-[10px] text-muted-foreground/70">
            SSML 1.1 is the interchange format for external AI narration workflows and worker automation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Source Locale</Label>
            <Select value={normalizedBlock.sourceLocale} onValueChange={(value) => updateBlock({ sourceLocale: value, language: value })}>
              <SelectTrigger className="h-8 text-xs bg-muted/20 border-0 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Voice</Label>
            <Select value={normalizedBlock.voice} onValueChange={(value) => updateBlock({ voice: value })}>
              <SelectTrigger className="h-8 text-xs bg-muted/20 border-0 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Provider</Label>
            <Input
              value={normalizedBlock.provider}
              onChange={(event) => updateBlock({ provider: event.target.value })}
              className="h-8 text-xs bg-muted/20 border-0 focus-visible:ring-1"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Model</Label>
            <Select value={normalizedBlock.model} onValueChange={(value) => updateBlock({ model: value })}>
              <SelectTrigger className="h-8 text-xs bg-muted/20 border-0 focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <Switch
              id={`voiceover-ollama-${block.id}`}
              checked={!!normalizedBlock.useOllama}
              onCheckedChange={(checked) => updateBlock({ useOllama: checked })}
            />
            <Label htmlFor={`voiceover-ollama-${block.id}`} className="text-xs cursor-pointer">
              Clean and segment with Ollama
            </Label>
          </div>
          <span className="text-[10px] text-muted-foreground/70">
            Local LLM assistance only. Subtitle timing still comes from the final audio manifest.
          </span>
        </div>

        <div className="rounded-md border border-border/50 bg-muted/10 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs text-muted-foreground">Background Localization</Label>
            <div className="flex items-center gap-2">
              <Switch
                id={`voiceover-localize-${block.id}`}
                checked={!!normalizedBlock.autoLocalize}
                onCheckedChange={(checked) => updateBlock({ autoLocalize: checked })}
              />
              <Label htmlFor={`voiceover-localize-${block.id}`} className="text-xs cursor-pointer">
                Queue automatically
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-muted-foreground">Target Locales</Label>
              <Input
                value={(normalizedBlock.targetLocales || []).join(", ")}
                onChange={(event) => updateBlock({ targetLocales: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
                placeholder="fr-FR, de-DE, es-ES"
                className="h-8 text-xs bg-background border-border/50"
              />
              <p className="text-[10px] text-muted-foreground/70">
                The worker will treat missing or stale locales as autonomous jobs instead of expecting manual authoring.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Localization Runtime</Label>
              <Select value={normalizedBlock.localizationRuntime} onValueChange={(value) => updateBlock({ localizationRuntime: value })}>
                <SelectTrigger className="h-8 text-xs bg-background border-border/50 focus:ring-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALIZATION_RUNTIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Localization Model</Label>
              <Input
                value={normalizedBlock.localizationModel}
                onChange={(event) => updateBlock({ localizationModel: event.target.value })}
                className="h-8 text-xs bg-background border-border/50"
                placeholder="translategemma"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Localization Provider</Label>
              <Input
                value={normalizedBlock.localizationProvider}
                onChange={(event) => updateBlock({ localizationProvider: event.target.value })}
                className="h-8 text-xs bg-background border-border/50"
                placeholder="google-translategemma"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cloud API URL</Label>
              <Input
                value={normalizedBlock.localizationApiUrl || ""}
                onChange={(event) => updateBlock({ localizationApiUrl: event.target.value })}
                className="h-8 text-xs bg-background border-border/50"
                placeholder="https://api.example.com/v1/translate"
                disabled={normalizedBlock.localizationRuntime !== "cloud-api"}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border/50 bg-muted/10 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs text-muted-foreground">Background Packaging</Label>
            <div className="flex items-center gap-2">
              <Switch
                id={`voiceover-scorm-${block.id}`}
                checked={!!normalizedBlock.autoScormPackaging}
                onCheckedChange={(checked) => updateBlock({ autoScormPackaging: checked })}
              />
              <Label htmlFor={`voiceover-scorm-${block.id}`} className="text-xs cursor-pointer">
                Queue SCORM automatically
              </Label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {SCORM_PROFILE_OPTIONS.map((option) => {
              const selected = (normalizedBlock.scormProfiles || []).includes(option.value);
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-[10px]"
                  onClick={() => toggleScormProfile(option.value)}
                  disabled={!normalizedBlock.autoScormPackaging}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground/70">
            Packaging is treated as worker-owned output. Missing or stale SCORM bundles can be re-queued without asking the author to do manual export work.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs text-muted-foreground">Segment Overrides</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addSegment}
              className="h-7 px-2 text-[10px] gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Segment
            </Button>
          </div>

          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div key={segment.id} className="rounded-md border border-border/50 bg-muted/10 p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Segment {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSegment(segment.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Textarea
                  value={segment.text}
                  onChange={(event) => updateSegment(segment.id, "text", event.target.value)}
                  placeholder="Narration segment"
                  className="min-h-16 resize-y bg-background border-border/50"
                />

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Pause After (ms)</Label>
                  <Input
                    value={segment.pauseAfterMs}
                    onChange={(event) => updateSegment(segment.id, "pauseAfterMs", event.target.value)}
                    inputMode="numeric"
                    className="h-8 text-xs bg-background border-border/50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}