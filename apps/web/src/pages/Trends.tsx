import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as eventsApi from "../api/events";
import { btnSecondaryClass } from "../components/ui/form";
import { useBaby } from "../context/BabyContext";
import {
  aggregateDailyTrends,
  buildDayRange,
  downloadTextFile,
  eventsToCsv,
  formatDurationMinutes,
} from "../utils/insights";
import { ageInMonths, getWeightReference } from "../utils/growth";

export default function Trends() {
  const { activeBaby } = useBaby();
  const [days, setDays] = useState(7);

  const range = useMemo(() => buildDayRange(days), [days]);

  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ["trends", activeBaby?.id, range.from, range.to],
    queryFn: async () => {
      const res = await eventsApi.listEvents(activeBaby!.id, {
        from: range.from,
        to: range.to,
        limit: 100,
      });
      return res.data;
    },
    enabled: !!activeBaby,
  });

  const chartData = useMemo(
    () => aggregateDailyTrends(events, days),
    [events, days]
  );

  const weightPoints = chartData.filter((d) => d.weightKg != null);
  const latestWeightEvent = [...events]
    .filter((event) => event.type === "weight")
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
  const babyAgeMonths = ageInMonths(activeBaby?.birthDate ?? new Date().toISOString().slice(0, 10));
  const growthReference = getWeightReference(activeBaby?.gender ?? null, babyAgeMonths);

  if (!activeBaby) {
    return (
      <div className="rounded-2xl border border-theme bg-theme-surface-95 p-6 text-center text-theme-muted">
        Add a baby profile to view trends.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-theme-brand">Trends</p>
          <h1 className="text-xl font-bold text-theme-body sm:text-2xl">
            {activeBaby.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {[7, 14, 30].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDays(value)}
              className={
                btnSecondaryClass +
                ` px-3 py-1.5 text-xs ${days === value ? "border-theme-brand bg-theme-brand/10" : ""}`
              }
            >
              {value}d
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                `${activeBaby.name}-trends.csv`,
                eventsToCsv(events)
              )
            }
            className={btnSecondaryClass + " px-3 py-1.5 text-xs"}
          >
            Export CSV
          </button>
        </div>
      </header>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Could not load trend data.
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-theme bg-theme-surface-95 p-6 text-center text-theme-muted">
          Loading charts...
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
            <h2 className="mb-3 text-sm font-bold text-theme-body">
              Feedings & diapers / day
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="feedings" fill="#f43f5e" name="Feedings" />
                  <Bar dataKey="diapers" fill="#f59e0b" name="Diapers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
            <h2 className="mb-3 text-sm font-bold text-theme-body">
              Sleep minutes / day
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) =>
                      formatDurationMinutes(Number(value ?? 0))
                    }
                  />
                  <Bar
                    dataKey="sleepMinutes"
                    fill="#6366f1"
                    name="Sleep"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
            <h2 className="mb-3 text-sm font-bold text-theme-body">
              Weight over time
            </h2>
            {weightPoints.length === 0 ? (
              <p className="text-sm text-theme-muted">
                No weight events in this range.
              </p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10 }}
                      unit="kg"
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weightKg"
                      stroke="#10b981"
                      strokeWidth={2}
                      connectNulls
                      name="Weight (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
            <h2 className="text-sm font-bold text-theme-body">Growth (WHO approx)</h2>
            <p className="mt-2 text-sm text-theme-muted">
              Age {babyAgeMonths} months · reference p3 {growthReference.p3} kg,
              median {growthReference.median} kg, p97 {growthReference.p97} kg.
            </p>
            <p className="mt-2 text-lg font-bold text-theme-body">
              Latest weight: {latestWeightEvent ? `${(latestWeightEvent.payload as { weightKg: number }).weightKg} kg` : "No weight recorded"}
            </p>
            <p className="mt-1 text-xs text-theme-muted">
              Approximate reference only; consult a healthcare professional for growth assessment.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
