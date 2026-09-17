import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import * as caregiversApi from "../api/caregivers";
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
  labelClass,
} from "../components/ui/form";
import { useBaby } from "../context/BabyContext";
import { toLocalDateTimeInput } from "../utils/eventForm";

export default function Milestones() {
  const { activeBaby } = useBaby();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [occurredAt, setOccurredAt] = useState(() =>
    toLocalDateTimeInput(new Date())
  );
  const [error, setError] = useState<string | null>(null);

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ["milestones", activeBaby?.id],
    queryFn: async () => {
      const res = await caregiversApi.listMilestones(activeBaby!.id);
      return res.data;
    },
    enabled: !!activeBaby,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      caregiversApi.createMilestone(activeBaby!.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        occurredAt: new Date(occurredAt).toISOString(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["milestones"] });
      setTitle("");
      setNotes("");
      setError(null);
    },
    onError: () => setError("Failed to save milestone"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => caregiversApi.deleteMilestone(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });

  if (!activeBaby) {
    return (
      <div className="rounded-2xl border border-theme bg-theme-surface-95 p-6 text-center text-theme-muted">
        Add a baby profile to track milestones.
      </div>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header>
        <p className="text-sm font-medium text-theme-brand">Milestones</p>
        <h1 className="text-xl font-bold text-theme-body sm:text-2xl">
          {activeBaby.name}&apos;s notes
        </h1>
        <p className="text-sm text-theme-muted">
          First smile, first tooth, or any special moment.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-2xl border border-theme bg-theme-surface-95 p-4"
      >
        <div>
          <label htmlFor="milestoneTitle" className={labelClass}>
            Title
          </label>
          <input
            id="milestoneTitle"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="First smile"
            required
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="milestoneWhen" className={labelClass}>
            When
          </label>
          <input
            id="milestoneWhen"
            type="datetime-local"
            className={inputClass}
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="milestoneNotes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="milestoneNotes"
            className={inputClass}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional details..."
            maxLength={2000}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className={btnPrimaryClass}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Saving..." : "Add milestone"}
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-theme-muted">Loading milestones...</p>
      ) : milestones.length === 0 ? (
        <p className="rounded-2xl border border-theme bg-theme-surface-95 p-6 text-center text-sm text-theme-muted">
          No milestones yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {milestones.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-theme bg-theme-surface-95 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-theme-body">{item.title}</p>
                  <p className="text-xs text-theme-muted">
                    {new Date(item.occurredAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      hour12: false,
                    })}
                  </p>
                  {item.notes && (
                    <p className="mt-2 text-sm text-theme-muted whitespace-pre-wrap">
                      {item.notes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this milestone?")) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                  className={
                    btnSecondaryClass +
                    " shrink-0 px-2 py-1 text-xs text-red-600"
                  }
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
