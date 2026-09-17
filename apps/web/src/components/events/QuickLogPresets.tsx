import type { CreateEventInput } from "@babycheck/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useBaby } from "../../context/BabyContext";
import { useToast } from "../../context/ToastContext";
import { createEventOrQueue } from "../../utils/offlineQueue";

const presets: { label: string; event: Omit<CreateEventInput, "occurredAt"> }[] = [
  { label: "Bottle 120ml", event: { type: "feeding", payload: { method: "bottle", amountMl: 120 } } },
  { label: "Breast feed", event: { type: "feeding", payload: { method: "breast" } } },
  { label: "Wet diaper", event: { type: "diaper", payload: { wet: true, dirty: false } } },
  { label: "Dirty diaper", event: { type: "diaper", payload: { wet: false, dirty: true } } },
  { label: "Nap 45min", event: { type: "sleep", payload: { durationMinutes: 45 } } },
  { label: "Nap 90min", event: { type: "sleep", payload: { durationMinutes: 90 } } },
];

export default function QuickLogPresets({ compact = false }: { compact?: boolean }) {
  const { activeBaby } = useBaby();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  async function logPreset(preset: (typeof presets)[number]) {
    if (!activeBaby) return;
    setPending(preset.label);
    try {
      const result = await createEventOrQueue(activeBaby.id, {
        ...preset.event,
        occurredAt: new Date().toISOString(),
      } as CreateEventInput);
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({ queryKey: ["today-stats"] });
      showToast({
        message: "queued" in result ? `${preset.label} queued offline` : `${preset.label} logged`,
      });
    } catch {
      showToast({ message: `Could not log ${preset.label}` });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={compact ? "flex gap-2 overflow-x-auto pb-1" : "grid grid-cols-2 gap-2 sm:grid-cols-3"}>
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          disabled={!activeBaby || pending !== null}
          onClick={() => void logPreset(preset)}
          className="shrink-0 rounded-lg border border-theme bg-theme-surface-elevated px-3 py-2 text-xs font-semibold text-theme-body hover:bg-theme-surface-hover disabled:opacity-50"
        >
          {pending === preset.label ? "Logging…" : preset.label}
        </button>
      ))}
    </div>
  );
}
