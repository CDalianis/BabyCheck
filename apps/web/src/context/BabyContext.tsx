import type { Baby } from "@babycheck/shared";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import * as babiesApi from "../api/babies";

interface BabyContextValue {
  babies: Baby[];
  activeBaby: Baby | null;
  loading: boolean;
  refetch: () => void;
}

const BabyContext = createContext<BabyContextValue | null>(null);

export function BabyProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["babies"],
    queryFn: async () => {
      const res = await babiesApi.listBabies();
      return res.data;
    },
  });

  const babies = data ?? [];
  const activeBaby = babies[0] ?? null;

  const value = useMemo(
    () => ({
      babies,
      activeBaby,
      loading: isLoading,
      refetch: () => {
        void refetch();
      },
    }),
    [babies, activeBaby, isLoading, refetch]
  );

  return <BabyContext.Provider value={value}>{children}</BabyContext.Provider>;
}

export function useBaby() {
  const ctx = useContext(BabyContext);
  if (!ctx) {
    throw new Error("useBaby must be used within BabyProvider");
  }
  return ctx;
}
