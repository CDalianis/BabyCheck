import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

function toLocalDateTimeInput(value?: Date | string): string {
  const date = value ? new Date(value) : new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

interface LogEventModalContextValue {
  isOpen: boolean;
  defaultDateTime: string;
  open: (dateTime?: Date | string) => void;
  close: () => void;
}

const LogEventModalContext = createContext<LogEventModalContextValue | null>(
  null
);

export function LogEventModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultDateTime, setDefaultDateTime] = useState(() =>
    toLocalDateTimeInput()
  );

  const open = useCallback((dateTime?: Date | string) => {
    setDefaultDateTime(toLocalDateTimeInput(dateTime));
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, defaultDateTime, open, close }),
    [isOpen, defaultDateTime, open, close]
  );

  return (
    <LogEventModalContext.Provider value={value}>
      {children}
    </LogEventModalContext.Provider>
  );
}

export function useLogEventModal() {
  const ctx = useContext(LogEventModalContext);
  if (!ctx) {
    throw new Error("useLogEventModal must be used within LogEventModalProvider");
  }
  return ctx;
}
