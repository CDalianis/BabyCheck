export interface SleepWindowSuggestion {
  wakeWindow: string;
  naps: string;
}

export function getSleepWindowSuggestion(ageMonths: number): SleepWindowSuggestion {
  if (ageMonths < 2) return { wakeWindow: "45–60 minutes", naps: "5–6 naps" };
  if (ageMonths < 4) return { wakeWindow: "60–90 minutes", naps: "4–5 naps" };
  if (ageMonths < 6) return { wakeWindow: "1.5–2.5 hours", naps: "3–4 naps" };
  if (ageMonths < 9) return { wakeWindow: "2–3 hours", naps: "2–3 naps" };
  if (ageMonths < 12) return { wakeWindow: "2.5–3.5 hours", naps: "2 naps" };
  return { wakeWindow: "3–5 hours", naps: "1–2 naps" };
}
