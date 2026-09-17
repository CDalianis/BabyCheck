import { useEffect, useRef } from "react";

const STORAGE_KEY = "babycheck_feed_reminder_hours";
const NOTIFIED_KEY = "babycheck_feed_reminder_last";

export function getFeedReminderHours(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  const value = raw ? Number(raw) : 3;
  return Number.isFinite(value) && value > 0 ? value : 3;
}

export function setFeedReminderHours(hours: number) {
  localStorage.setItem(STORAGE_KEY, String(hours));
}

export function useFeedReminder(options: {
  enabled: boolean;
  babyName?: string;
  minutesSinceLastFeed: number | null | undefined;
}) {
  const lastNotifiedRef = useRef<string | null>(
    localStorage.getItem(NOTIFIED_KEY)
  );

  useEffect(() => {
    if (!options.enabled) return;
    if (options.minutesSinceLastFeed == null) return;

    const thresholdMinutes = getFeedReminderHours() * 60;
    if (options.minutesSinceLastFeed < thresholdMinutes) return;

    if (typeof Notification === "undefined") return;

    const stamp = `${Math.floor(options.minutesSinceLastFeed / 30)}`;
    if (lastNotifiedRef.current === stamp) return;

    async function notify() {
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") return;

      const hours = getFeedReminderHours();
      new Notification("BabyCheck feed reminder", {
        body: `${options.babyName ?? "Baby"} was last fed more than ${hours}h ago.`,
        tag: "babycheck-feed-reminder",
      });
      lastNotifiedRef.current = stamp;
      localStorage.setItem(NOTIFIED_KEY, stamp);
    }

    void notify();
  }, [
    options.enabled,
    options.babyName,
    options.minutesSinceLastFeed,
  ]);
}
