import type { BabyEvent } from "@babycheck/shared";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface EventDetailModalContextValue {
  event: BabyEvent | null;
  isOpen: boolean;
  open: (event: BabyEvent) => void;
  close: () => void;
}

const EventDetailModalContext =
  createContext<EventDetailModalContextValue | null>(null);

export function EventDetailModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [event, setEvent] = useState<BabyEvent | null>(null);

  const open = useCallback((next: BabyEvent) => {
    setEvent(next);
  }, []);

  const close = useCallback(() => {
    setEvent(null);
  }, []);

  const value = useMemo(
    () => ({
      event,
      isOpen: event !== null,
      open,
      close,
    }),
    [event, open, close]
  );

  return (
    <EventDetailModalContext.Provider value={value}>
      {children}
    </EventDetailModalContext.Provider>
  );
}

export function useEventDetailModal() {
  const ctx = useContext(EventDetailModalContext);
  if (!ctx) {
    throw new Error(
      "useEventDetailModal must be used within EventDetailModalProvider"
    );
  }
  return ctx;
}
