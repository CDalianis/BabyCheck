import type { CreateEventInput, EventType } from "@babycheck/shared";
import { EVENT_TYPE_LABELS, EVENT_TYPES } from "@babycheck/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import * as eventsApi from "../../api/events";
import { buildPayloadFromForm, fieldName } from "../../utils/eventForm";
import { btnPrimaryClass, btnSecondaryClass, inputClass, labelClass } from "../ui/form";
import { useBaby } from "../../context/BabyContext";
import EventTypeFields from "./EventTypeFields";

interface LogEventEntry {
  id: string;
  type: EventType;
}

interface LogEventFormProps {
  defaultDateTime: string;
  onSuccess: () => void;
}

function createEntry(type: EventType = "feeding"): LogEventEntry {
  return { id: crypto.randomUUID(), type };
}

export default function LogEventForm({
  defaultDateTime,
  onSuccess,
}: LogEventFormProps) {
  const { activeBaby } = useBaby();
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<LogEventEntry[]>(() => [createEntry()]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (inputs: CreateEventInput[]) => {
      await Promise.all(
        inputs.map((input) => eventsApi.createEvent(activeBaby!.id, input))
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      onSuccess();
    },
    onError: () => setError("Failed to log one or more events"),
  });

  if (!activeBaby) {
    return (
      <p className="text-sm text-theme-muted">
        Add a baby profile before logging events.
      </p>
    );
  }

  function addEntry() {
    setEntries((prev) => [...prev, createEntry()]);
  }

  function removeEntry(id: string) {
    setEntries((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));
  }

  function updateEntryType(id: string, type: EventType) {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, type } : entry))
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const occurredAt = new Date(form.get("occurredAt") as string).toISOString();

    const inputs = entries.map((entry) => {
      const prefix = `entry-${entry.id}`;
      const notes = (form.get(fieldName(prefix, "notes")) as string) || undefined;
      return {
        type: entry.type,
        occurredAt,
        payload: buildPayloadFromForm(entry.type, form, prefix),
        notes,
      } as CreateEventInput;
    });

    mutation.mutate(inputs);
  }

  return (
    <form key={defaultDateTime} className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="occurredAt" className={labelClass}>
          When
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          className={inputClass}
          type="datetime-local"
          defaultValue={defaultDateTime}
          required
        />
        <p className="mt-1 text-xs text-theme-muted">
          All events below will be logged at this time.
        </p>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => {
          const prefix = `entry-${entry.id}`;
          return (
            <div
              key={entry.id}
              className="rounded-xl border border-theme bg-theme-surface-elevated p-3 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                  Event {index + 1}
                </p>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label htmlFor={fieldName(prefix, "type")} className={labelClass}>
                  Event type
                </label>
                <select
                  id={fieldName(prefix, "type")}
                  className={inputClass}
                  value={entry.type}
                  onChange={(e) =>
                    updateEntryType(entry.id, e.target.value as EventType)
                  }
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {EVENT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <EventTypeFields
                key={`${entry.id}-${entry.type}`}
                type={entry.type}
                fieldPrefix={prefix}
              />

              <div>
                <label htmlFor={fieldName(prefix, "notes")} className={labelClass}>
                  Notes
                </label>
                <textarea
                  id={fieldName(prefix, "notes")}
                  name={fieldName(prefix, "notes")}
                  className={inputClass}
                  rows={2}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className={btnSecondaryClass + " w-full"}
      >
        + Add another event
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className={btnPrimaryClass} type="submit" disabled={mutation.isPending}>
        {mutation.isPending
          ? "Saving..."
          : entries.length === 1
            ? "Save event"
            : `Save ${entries.length} events`}
      </button>
    </form>
  );
}
