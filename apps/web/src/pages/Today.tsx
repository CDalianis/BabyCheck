import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as eventsApi from "../api/events";
import BabyAvatar from "../components/baby/BabyAvatar";
import ReminderSettings from "../components/insights/ReminderSettings";
import { btnPrimaryClass, btnSecondaryClass } from "../components/ui/form";
import { useBaby } from "../context/BabyContext";
import { useBabyProfileModal } from "../context/BabyProfileModalContext";
import { useLogEventModal } from "../context/LogEventModalContext";
import { useFeedReminder } from "../hooks/useFeedReminder";
import {
  downloadTextFile,
  eventsToCsv,
  formatDurationMinutes,
  formatTimeSince,
  buildDayRange,
} from "../utils/insights";
import { formatEventTime, getEventSummary } from "../utils/eventSummary";
import { ageInMonths } from "../utils/growth";
import { getSleepWindowSuggestion } from "../utils/sleepWindows";
import { useLocale } from "../context/LocaleContext";

export default function Today() {
  const { activeBaby, loading: babyLoading } = useBaby();
  const { open: openLog } = useLogEventModal();
  const { open: openProfile } = useBabyProfileModal();
  const { t } = useLocale();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["today-stats", activeBaby?.id],
    queryFn: async () => {
      const res = await eventsApi.getTodayStats(activeBaby!.id);
      return res.stats;
    },
    enabled: !!activeBaby,
    refetchInterval: 60_000,
  });

  const { data: weekEvents = [] } = useQuery({
    queryKey: ["events-export", activeBaby?.id],
    queryFn: async () => {
      const range = buildDayRange(30);
      const res = await eventsApi.listEvents(activeBaby!.id, {
        from: range.from,
        to: range.to,
        limit: 100,
      });
      return res.data;
    },
    enabled: !!activeBaby,
  });

  useFeedReminder({
    enabled: !!activeBaby,
    babyName: activeBaby?.name,
    minutesSinceLastFeed: stats?.minutesSinceLastFeed,
  });

  if (babyLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-theme-muted">
        Loading...
      </div>
    );
  }

  if (!activeBaby) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-theme bg-theme-surface-95 p-6 text-center">
        <h2 className="text-lg font-bold text-theme-body">{t("today")}</h2>
        <p className="mt-2 text-sm text-theme-muted">
          Create a baby profile to see today&apos;s stats.
        </p>
        <button
          type="button"
          onClick={openProfile}
          className={`mt-4 ${btnPrimaryClass} w-auto px-6`}
        >
          Add baby profile
        </button>
      </div>
    );
  }

  function handleExportCsv() {
    const csv = eventsToCsv(weekEvents);
    downloadTextFile(
      `${activeBaby!.name.toLowerCase().replace(/\s+/g, "-")}-events.csv`,
      csv
    );
  }

  function handlePrintPdf() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BabyAvatar baby={activeBaby} size="lg" />
          <div>
            <p className="text-sm font-medium text-theme-brand">{t("today")}</p>
            <h1 className="text-xl font-bold text-theme-body sm:text-2xl">
              {activeBaby.name}
            </h1>
            <p className="text-sm text-theme-muted">
              {stats?.date ?? new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={() => openLog()}
            className={btnPrimaryClass + " w-auto px-4 py-2 text-sm"}
          >
            + {t("log")}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className={btnSecondaryClass + " px-3 py-2 text-sm"}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className={btnSecondaryClass + " px-3 py-2 text-sm"}
          >
            Print / PDF
          </button>
        </div>
      </header>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Could not load today&apos;s stats.
        </div>
      ) : isLoading || !stats ? (
        <div className="rounded-xl border border-theme bg-theme-surface-95 p-6 text-center text-theme-muted">
          Loading stats...
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-theme bg-theme-brand/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
              Time since last feed
            </p>
            <p className="mt-1 text-2xl font-bold text-theme-brand-strong">
              {formatTimeSince(stats.minutesSinceLastFeed)}
            </p>
            {stats.lastFeeding && (
              <p className="mt-1 text-sm text-theme-muted">
                Last: {formatEventTime(stats.lastFeeding.occurredAt)} ·{" "}
                {getEventSummary(stats.lastFeeding)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Feeds", value: String(stats.feedingCount) },
              { label: "Diapers", value: String(stats.diaperCount) },
              {
                label: "Sleep",
                value: formatDurationMinutes(stats.sleepTotalMinutes),
              },
              { label: "Meds", value: String(stats.medicationCount) },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-theme bg-theme-surface-95 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                  {card.label}
                </p>
                <p className="mt-1 text-xl font-bold text-theme-body">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
              <p className="text-sm font-semibold text-theme-body">Last diaper</p>
              <p className="mt-1 text-sm text-theme-muted">
                {stats.lastDiaper
                  ? `${formatEventTime(stats.lastDiaper.occurredAt)} · ${getEventSummary(stats.lastDiaper)}`
                  : "None today"}
              </p>
            </div>
            <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
              <p className="text-sm font-semibold text-theme-body">Last sleep</p>
              <p className="mt-1 text-sm text-theme-muted">
                {stats.lastSleep
                  ? `${formatEventTime(stats.lastSleep.occurredAt)} · ${getEventSummary(stats.lastSleep)}`
                  : "None today"}
              </p>
            </div>
            <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
              <p className="text-sm font-semibold text-theme-body">Pumping today</p>
              <p className="mt-1 text-sm text-theme-muted">
                {stats.pumpingTotalMl > 0
                  ? `${stats.pumpingTotalMl} ml`
                  : "None today"}
              </p>
            </div>
            <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
              <p className="text-sm font-semibold text-theme-body">Last medication</p>
              <p className="mt-1 text-sm text-theme-muted">
                {stats.lastMedication
                  ? `${formatEventTime(stats.lastMedication.occurredAt)} · ${getEventSummary(stats.lastMedication)}`
                  : "None today"}
              </p>
            </div>
          </div>

          <ReminderSettings />

          <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4">
            <h2 className="text-sm font-bold text-theme-body">Sleep window suggestion</h2>
            {(() => {
              const age = ageInMonths(activeBaby.birthDate);
              const suggestion = getSleepWindowSuggestion(age);
              return (
                <p className="mt-1 text-sm text-theme-muted">
                  At about {age} months: aim for {suggestion.wakeWindow} awake between sleeps and {suggestion.naps} daily.
                </p>
              );
            })()}
            <p className="mt-1 text-xs text-theme-muted">General guidance only; follow your baby&apos;s cues.</p>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Link
              to="/trends"
              className={btnSecondaryClass + " px-4 py-2 text-sm"}
            >
              View trends
            </Link>
            <Link
              to="/milestones"
              className={btnSecondaryClass + " px-4 py-2 text-sm"}
            >
              Milestones
            </Link>
            <Link to="/" className={btnSecondaryClass + " px-4 py-2 text-sm"}>
              Open diary
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
