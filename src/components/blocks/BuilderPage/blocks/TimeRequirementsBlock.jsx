import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function TimeRequirementsBlock({ block, onUpdate }) {
  const requiredMinutes = block.requiredMinutes ?? 2;
  const showProgress = block.showProgress !== false;
  const hideOnCompleted = block.hideOnCompleted ?? false;

  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  const requiredSeconds = requiredMinutes * 60;

  useEffect(() => {
    if (completed) return;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= requiredSeconds) {
          clearInterval(intervalRef.current);
          setCompleted(true);
          return requiredSeconds;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [completed, requiredSeconds]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const percentage = Math.min(100, Math.round((elapsed / requiredSeconds) * 100));

  const isEditMode = typeof onUpdate === "function";

  return (
    <div className="rounded-md border border-blue-500 border-l-4 bg-blue-50/20 dark:bg-blue-950/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-background/40">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Time Requirement
        </span>
      </div>

      {isEditMode && (
        <div className="p-3 space-y-3 border-b border-border/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Required Time (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={120}
                value={requiredMinutes}
                onChange={(e) =>
                  onUpdate(block.id, {
                    ...block,
                    requiredMinutes: Math.max(1, parseInt(e.target.value, 10) || 1),
                  })
                }
                className="h-7 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id={`${block.id}-show-progress`}
                checked={showProgress}
                onCheckedChange={(v) => onUpdate(block.id, { ...block, showProgress: v })}
              />
              <Label htmlFor={`${block.id}-show-progress`} className="text-xs cursor-pointer">
                Show progress
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`${block.id}-hide-completed`}
                checked={hideOnCompleted}
                onCheckedChange={(v) => onUpdate(block.id, { ...block, hideOnCompleted: v })}
              />
              <Label htmlFor={`${block.id}-hide-completed`} className="text-xs cursor-pointer">
                Hide when complete
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Preview / learner view */}
      {(!hideOnCompleted || !completed) && (
        <div className="px-3 py-3">
          {completed ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <Clock className="h-4 w-4" />
              Time requirement met — you may continue.
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please spend at least{" "}
                <strong className="text-foreground">
                  {requiredMinutes} minute{requiredMinutes !== 1 ? "s" : ""}
                </strong>{" "}
                on this section before continuing.
              </p>
              {showProgress && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(elapsed)} elapsed</span>
                    <span>{formatTime(requiredSeconds - elapsed)} remaining</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
