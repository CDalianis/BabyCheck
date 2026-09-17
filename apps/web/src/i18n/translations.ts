export type Locale = "en" | "el";

export const translations = {
  en: {
    today: "Today",
    diary: "Diary",
    trends: "Trends",
    notes: "Notes",
    search: "Search",
    calendar: "Calendar",
    log: "Log",
    profile: "Profile",
    logout: "Logout",
    more: "More",
    babyDiary: "Baby diary",
  },
  el: {
    today: "Σήμερα",
    diary: "Ημερολόγιο",
    trends: "Τάσεις",
    notes: "Σημειώσεις",
    search: "Αναζήτηση",
    calendar: "Ημερολόγιο μήνα",
    log: "Καταγραφή",
    profile: "Προφίλ",
    logout: "Αποσύνδεση",
    more: "Περισσότερα",
    babyDiary: "Ημερολόγιο μωρού",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
