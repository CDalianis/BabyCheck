import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { BabyEvent } from "@babycheck/shared";
import { useSearchParams } from "react-router-dom";
import * as eventsApi from "../api/events";
import BabyAvatar from "../components/baby/BabyAvatar";
import BabyPhotoModal from "../components/baby/BabyPhotoModal";
import DiaryGrid from "../components/diary/DiaryGrid";
import EventFilterSidebar from "../components/diary/EventFilterSidebar";
import UserTodoList from "../components/todo/UserTodoList";
import { btnPrimaryClass, btnSecondaryClass } from "../components/ui/form";
import { useBaby } from "../context/BabyContext";
import { useBabyProfileModal } from "../context/BabyProfileModalContext";
import { useLogEventModal } from "../context/LogEventModalContext";
import QuickLogPresets from "../components/events/QuickLogPresets";
import { useLocale } from "../context/LocaleContext";
import {
  addDays,
  formatWeekRange,
  startOfWeek,
  weekRangeIso,
} from "../utils/diary";
import {
  buildFilterCategories,
  computeFilterCounts,
  eventMatchesFilter,
  type EventFilterId,
} from "../utils/eventFilters";

export default function Diary() {
  const { activeBaby, loading: babyLoading } = useBaby();
  const { open: openLog } = useLogEventModal();
  const { open: openProfile } = useBabyProfileModal();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(searchParams.get("date") ? new Date(`${searchParams.get("date")}T12:00:00`) : new Date())
  );
  const [eventFilter, setEventFilter] = useState<EventFilterId>("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileTodoOpen, setMobileTodoOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const range = useMemo(() => weekRangeIso(weekStart), [weekStart]);

  const moveEventMutation = useMutation({
    mutationFn: ({ id, occurredAt }: { id: string; occurredAt: string }) =>
      eventsApi.updateEvent(id, { occurredAt }),
    onMutate: async ({ id, occurredAt }) => {
      await queryClient.cancelQueries({ queryKey: ["events"] });
      const previous = queryClient.getQueriesData<BabyEvent[]>({ queryKey: ["events"] });
      queryClient.setQueriesData<BabyEvent[]>({ queryKey: ["events"] }, (old) =>
        old?.map((event) => event.id === id ? { ...event, occurredAt } : event)
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events", activeBaby?.id, range.from, range.to],
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

  const filterCategories = useMemo(
    () => buildFilterCategories(events),
    [events]
  );

  const filterCounts = useMemo(
    () => computeFilterCounts(events, filterCategories),
    [events, filterCategories]
  );

  const filteredEvents = useMemo(() => {
    if (eventFilter === "all") return events;
    return events.filter((event) => eventMatchesFilter(event, eventFilter));
  }, [events, eventFilter]);

  useEffect(() => {
    if (eventFilter === "all") return;
    const stillValid = filterCategories.some(
      (category) =>
        eventFilter === category.type ||
        category.options.some((option) => option.id === eventFilter)
    );
    if (!stillValid) {
      setEventFilter("all");
    }
  }, [eventFilter, filterCategories]);

  function handleHourClick(date: Date, hour: number) {
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    openLog(d);
  }

  function handleEventMove(eventId: string, occurredAt: string) {
    moveEventMutation.mutate({ id: eventId, occurredAt });
  }

  if (babyLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-theme-muted">
        Loading...
      </div>
    );
  }

  if (!activeBaby) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-theme bg-theme-surface-95 p-6 text-center shadow-sm">
        <h2 className="text-lg font-bold text-theme-body">Welcome to BabyCheck</h2>
        <p className="mt-2 text-sm text-theme-muted">
          Create a baby profile to open the diary.
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

  return (
    <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-4">
      <div className="min-w-0 lg:flex lg:w-56 lg:flex-col lg:self-stretch xl:w-60">
        <EventFilterSidebar
          value={eventFilter}
          onChange={setEventFilter}
          counts={filterCounts}
          categories={filterCategories}
          mobileOpen={mobileFilterOpen}
          onMobileOpen={() => setMobileFilterOpen(true)}
          onMobileClose={() => setMobileFilterOpen(false)}
        />
      </div>

      <div className="col-span-2 min-w-0 space-y-4 lg:col-auto lg:flex-1">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <BabyAvatar
              baby={activeBaby}
              size="lg"
              onClick={
                activeBaby.photoUrl ? () => setPhotoModalOpen(true) : undefined
              }
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-theme-brand">{t("babyDiary")}</p>
              <h1 className="truncate text-xl font-bold text-theme-body sm:text-2xl">
                {activeBaby.name}
              </h1>
              <p className="text-sm text-theme-muted">{formatWeekRange(weekStart)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              className={btnSecondaryClass + " px-3 py-2 text-xs sm:text-sm"}
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className={btnSecondaryClass + " px-3 py-2 text-xs sm:text-sm"}
            >
              {t("today")}
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              className={btnSecondaryClass + " px-3 py-2 text-xs sm:text-sm"}
            >
              Next →
            </button>
            <button
              type="button"
              onClick={() => openLog()}
              className={btnPrimaryClass + " w-auto px-4 py-2 text-xs sm:text-sm"}
            >
              + {t("log")}
            </button>
            <button
              type="button"
              onClick={openProfile}
              className={
                btnSecondaryClass + " hidden w-auto px-3 py-2 text-xs sm:inline-flex sm:text-sm"
              }
            >
              {t("profile")}
            </button>
          </div>
        </header>
        <QuickLogPresets compact />

        {isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            Could not load events. Try refreshing the page.
          </div>
        ) : isLoading ? (
          <div className="rounded-xl border border-theme bg-theme-surface-95 p-8 text-center text-theme-muted">
            Loading diary...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-theme bg-theme-surface-95 p-8 text-center">
            <h2 className="font-bold text-theme-body">Nothing logged here yet</h2>
            <p className="mt-1 text-sm text-theme-muted">Start with a quick preset or add a detailed event.</p>
            <button type="button" onClick={() => openLog()} className={btnPrimaryClass + " mt-4 w-auto px-5"}>
              + {t("log")}
            </button>
          </div>
        ) : (
          <div className="w-full min-w-0">
            <DiaryGrid
              weekStart={weekStart}
              events={filteredEvents}
              onHourClick={handleHourClick}
              onEventMove={handleEventMove}
            />
          </div>
        )}

        <p className="text-center text-xs text-theme-muted">
          Tap an hour slot to log · Drag events to move · Tap an event to edit
        </p>
      </div>

      <div className="min-w-0 lg:flex lg:w-56 lg:flex-col lg:self-stretch xl:w-60">
        <UserTodoList
          mobileOpen={mobileTodoOpen}
          onMobileOpen={() => setMobileTodoOpen(true)}
          onMobileClose={() => setMobileTodoOpen(false)}
        />
      </div>

      <BabyPhotoModal
        baby={activeBaby}
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
      />
    </div>
  );
}
