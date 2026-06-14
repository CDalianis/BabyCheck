import type { BabyEvent, UpdateEventInput } from "@babycheck/shared";
import { EVENT_TYPE_LABELS } from "@babycheck/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import * as eventsApi from "../../api/events";
import { buildPayloadFromForm, toLocalDateTimeInput } from "../../utils/eventForm";
import { btnPrimaryClass, btnSecondaryClass, inputClass, labelClass } from "../ui/form";
import EventTypeFields from "./EventTypeFields";

interface EditEventFormProps {
  event: BabyEvent;
  onSuccess: () => void;
}

export default function EditEventForm({ event, onSuccess }: EditEventFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (body: {
      occurredAt: string;
      payload: BabyEvent["payload"];
      notes: string | null;
    }) =>
      eventsApi.updateEvent(event.id, {
        occurredAt: body.occurredAt,
        payload: body.payload as unknown as UpdateEventInput["payload"],
        notes: body.notes,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      onSuccess();
    },
    onError: () => setError("Failed to update event"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventsApi.deleteEvent(event.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      onSuccess();
    },
    onError: () => setError("Failed to delete event"),
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const occurredAt = new Date(form.get("occurredAt") as string).toISOString();
    const notes = (form.get("notes") as string) || null;
    const payload = buildPayloadFromForm(event.type, form);

    updateMutation.mutate({ occurredAt, payload, notes });
  }

  function handleDelete() {
    if (!window.confirm("Delete this event?")) return;
    setError(null);
    deleteMutation.mutate();
  }

  const isPending = updateMutation.isPending || deleteMutation.isPending;

  return (
    <form key={event.id} className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className={labelClass}>Event type</label>
        <p className="rounded-xl border border-theme bg-theme-surface-elevated px-3 py-2.5 text-sm font-medium text-theme-body">
          {EVENT_TYPE_LABELS[event.type]}
        </p>
      </div>

      <div>
        <label htmlFor="occurredAt" className={labelClass}>
          When
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          className={inputClass}
          type="datetime-local"
          defaultValue={toLocalDateTimeInput(event.occurredAt)}
          required
        />
      </div>

      <EventTypeFields type={event.type} event={event} />

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          className={inputClass}
          rows={2}
          defaultValue={event.notes ?? ""}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button className={btnPrimaryClass} type="submit" disabled={isPending}>
          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </button>
        <button
          className={btnSecondaryClass + " border-red-200 text-red-600 hover:bg-red-50"}
          type="button"
          onClick={handleDelete}
          disabled={isPending}
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </form>
  );
}
