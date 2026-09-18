import type { BabyEvent } from "@babycheck/shared";

export function formatDurationMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatTimeSince(minutes: number | null | undefined): string {
  if (minutes == null) return "No feeds yet";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h ago`;
  return `${hours}h ${mins}m ago`;
}

export function toDateKeyLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildDayRange(days: number): { from: string; to: string } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function aggregateDailyTrends(events: BabyEvent[], days: number) {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(toDateKeyLocal(d));
  }

  const map = new Map(
    keys.map((key) => [
      key,
      { date: key, feedings: 0, diapers: 0, sleepMinutes: 0, weightKg: null as number | null },
    ])
  );

  for (const event of events) {
    const key = toDateKeyLocal(new Date(event.occurredAt));
    const bucket = map.get(key);
    if (!bucket) continue;
    if (event.type === "feeding") bucket.feedings += 1;
    if (event.type === "diaper") bucket.diapers += 1;
    if (event.type === "sleep") {
      bucket.sleepMinutes += (
        event.payload as { durationMinutes: number }
      ).durationMinutes;
    }
    if (event.type === "weight") {
      bucket.weightKg = (event.payload as { weightKg: number }).weightKg;
    }
  }

  return keys.map((key) => map.get(key)!);
}

export function eventsToCsv(events: BabyEvent[]): string {
  const header = ["occurredAt", "type", "summary", "notes"];
  const lines = [header.join(",")];

  for (const event of events) {
    const summary = JSON.stringify(event.payload).replaceAll('"', '""');
    const notes = (event.notes ?? "").replaceAll('"', '""');
    lines.push(
      [
        event.occurredAt,
        event.type,
        `"${summary}"`,
        `"${notes}"`,
      ].join(",")
    );
  }

  return lines.join("\n");
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/csv;charset=utf-8"
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
