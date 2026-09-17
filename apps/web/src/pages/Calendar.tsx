import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as eventsApi from "../api/events";
import { useBaby } from "../context/BabyContext";
import { btnSecondaryClass } from "../components/ui/form";

export default function Calendar() {
  const { activeBaby } = useBaby();
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const range = useMemo(() => {
    const from = new Date(month);
    from.setDate(from.getDate() - from.getDay());
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    to.setDate(to.getDate() + (6 - to.getDay()));
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }, [month]);
  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events", activeBaby?.id, range.from.toISOString(), range.to.toISOString()],
    queryFn: async () => (await eventsApi.listEvents(activeBaby!.id, { from: range.from.toISOString(), to: range.to.toISOString(), limit: 200 })).data,
    enabled: !!activeBaby,
  });
  const counts = useMemo(() => {
    const result = new Map<string, number>();
    events.forEach((event) => {
      const date = new Date(event.occurredAt);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      result.set(key, (result.get(key) ?? 0) + 1);
    });
    return result;
  }, [events]);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(range.from);
    date.setDate(date.getDate() + index);
    return date;
  });

  if (!activeBaby) return <div className="rounded-2xl border border-theme bg-theme-surface p-6 text-theme-muted">Add a baby profile to view the calendar.</div>;
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="flex items-center justify-between">
        <button className={btnSecondaryClass + " px-3"} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button>
        <h1 className="text-xl font-bold text-theme-body">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h1>
        <button className={btnSecondaryClass + " px-3"} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-theme-muted">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => <div key={day}>{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const count = counts.get(key) ?? 0;
          return <button key={date.toISOString()} type="button" onClick={() => navigate(`/?date=${date.toISOString().slice(0, 10)}`)} className={`min-h-16 rounded-lg border border-theme p-1 text-left text-sm ${date.getMonth() === month.getMonth() ? "bg-theme-surface-95 text-theme-body" : "bg-theme-page text-theme-muted opacity-60"}`}><span>{date.getDate()}</span>{count > 0 && <span className="mt-1 block rounded-full bg-theme-brand/15 px-1 text-center text-xs text-theme-brand-strong">{count}</span>}</button>;
        })}
      </div>
    </div>
  );
}
