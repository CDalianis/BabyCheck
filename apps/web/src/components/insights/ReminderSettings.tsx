import { useState } from "react";
import {
  getFeedReminderHours,
  setFeedReminderHours,
} from "../../hooks/useFeedReminder";
import { btnSecondaryClass, inputClass, labelClass } from "../ui/form";

export default function ReminderSettings() {
  const [hours, setHours] = useState(() => getFeedReminderHours());
  const [status, setStatus] = useState<string | null>(null);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setStatus("Notifications are not supported in this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    setStatus(
      permission === "granted"
        ? "Browser notifications enabled."
        : "Notification permission was not granted."
    );
  }

  function save() {
    setFeedReminderHours(hours);
    setStatus(`Reminder set for ${hours}h since last feed.`);
  }

  return (
    <div className="rounded-2xl border border-theme bg-theme-surface-95 p-4 print:hidden">
      <h2 className="text-sm font-bold text-theme-body">Feed reminders</h2>
      <p className="mt-1 text-xs text-theme-muted">
        Get a browser notification when it has been too long since the last
        feed.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="reminderHours" className={labelClass}>
            Hours since last feed
          </label>
          <select
            id="reminderHours"
            className={inputClass + " w-28"}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          >
            {[2, 2.5, 3, 3.5, 4, 5, 6].map((value) => (
              <option key={value} value={value}>
                {value}h
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={save}
          className={btnSecondaryClass + " px-3 py-2 text-sm"}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => void enableNotifications()}
          className={btnSecondaryClass + " px-3 py-2 text-sm"}
        >
          Enable notifications
        </button>
      </div>
      {status && <p className="mt-2 text-xs text-theme-muted">{status}</p>}
    </div>
  );
}
