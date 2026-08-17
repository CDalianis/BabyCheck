import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface BabyProfileModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const BabyProfileModalContext =
  createContext<BabyProfileModalContextValue | null>(null);

export function BabyProfileModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, open, close }),
    [isOpen, open, close]
  );

  return (
    <BabyProfileModalContext.Provider value={value}>
      {children}
    </BabyProfileModalContext.Provider>
  );
}

export function useBabyProfileModal() {
  const ctx = useContext(BabyProfileModalContext);
  if (!ctx) {
    throw new Error(
      "useBabyProfileModal must be used within BabyProfileModalProvider"
    );
  }
  return ctx;
}
