import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import * as eventsApi from "../api/events";
import { useBaby } from "../context/BabyContext";
import { formatEventTime, getEventSummary } from "../utils/eventSummary";
import { btnPrimaryClass, inputClass, labelClass } from "../components/ui/form";

interface SearchValues {
  q: string;
  from: string;
  to: string;
  includeDeleted: boolean;
}

export default function Search() {
  const { activeBaby } = useBaby();
  const [draft, setDraft] = useState<SearchValues>({ q: "", from: "", to: "", includeDeleted: false });
  const [search, setSearch] = useState<SearchValues>(draft);
  const { data: events = [], isFetching } = useQuery({
    queryKey: ["event-search", activeBaby?.id, search],
    queryFn: async () => {
      const response = await eventsApi.listEvents(activeBaby!.id, {
        q: search.q || undefined,
        from: search.from ? new Date(`${search.from}T00:00:00`).toISOString() : undefined,
        to: search.to ? new Date(`${search.to}T23:59:59.999`).toISOString() : undefined,
        includeDeleted: search.includeDeleted,
        limit: 100,
      });
      return response.data;
    },
    enabled: !!activeBaby,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setSearch(draft);
  }

  if (!activeBaby) return <div className="rounded-2xl border border-theme bg-theme-surface p-6 text-theme-muted">Add a baby profile to search events.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-theme-body">Search events</h1>
      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-theme bg-theme-surface-95 p-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className={labelClass} htmlFor="event-query">Text query</label>
          <input id="event-query" className={inputClass} value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} placeholder="Notes, medication, event details…" />
        </div>
        <div><label className={labelClass} htmlFor="from">From</label><input id="from" type="date" className={inputClass} value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} /></div>
        <div><label className={labelClass} htmlFor="to">To</label><input id="to" type="date" className={inputClass} value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm text-theme-body"><input type="checkbox" checked={draft.includeDeleted} onChange={(e) => setDraft({ ...draft, includeDeleted: e.target.checked })} /> Include deleted</label>
        <button className={btnPrimaryClass + " sm:col-span-3"} type="submit">Search</button>
      </form>
      <div className="space-y-2">
        {isFetching ? <p className="text-theme-muted">Searching…</p> : events.length === 0 ? <p className="rounded-xl border border-theme bg-theme-surface p-5 text-center text-theme-muted">No matching events.</p> : events.map((event) => (
          <article key={event.id} className="rounded-xl border border-theme bg-theme-surface-95 p-3">
            <div className="flex justify-between gap-2"><strong className="text-theme-body">{getEventSummary(event)}</strong><time className="text-xs text-theme-muted">{new Date(event.occurredAt).toLocaleDateString()} {formatEventTime(event.occurredAt)}</time></div>
            {event.notes && <p className="mt-1 text-sm text-theme-muted">{event.notes}</p>}
            {Boolean((event as unknown as { deletedAt?: string | null }).deletedAt) && <span className="mt-2 inline-block text-xs font-semibold text-red-500">Deleted</span>}
          </article>
        ))}
      </div>
    </div>
  );
}
