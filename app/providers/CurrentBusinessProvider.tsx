"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultBusinessPreference,
  readStoredBusiness,
  writeStoredBusiness,
  type StoredBusinessPreference,
} from "../../lib/business/currentBusinessStorage";

type CurrentBusinessContextValue = {
  isHydrated: boolean;
  /** Preferred Business / Tenant (not App Workspace) */
  currentBusiness: StoredBusinessPreference;
  setCurrentBusiness: (next: StoredBusinessPreference) => void;
  /** Clear preference → default ตั้งเตา — does not touch currentWorkspace */
  clearCurrentBusiness: () => void;
};

const CurrentBusinessContext =
  createContext<CurrentBusinessContextValue | null>(null);

/**
 * Business / Tenant preference — storage key separate from App Workspace.
 * Multi-business switcher can call setCurrentBusiness without clearing Workspace Context.
 */
export function CurrentBusinessProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentBusiness, setCurrentBusinessState] =
    useState<StoredBusinessPreference>(defaultBusinessPreference);

  useEffect(() => {
    setCurrentBusinessState(readStoredBusiness() ?? defaultBusinessPreference());
    setIsHydrated(true);
  }, []);

  const setCurrentBusiness = useCallback((next: StoredBusinessPreference) => {
    setCurrentBusinessState(next);
    writeStoredBusiness(next);
  }, []);

  const clearCurrentBusiness = useCallback(() => {
    const fallback = defaultBusinessPreference();
    setCurrentBusinessState(fallback);
    writeStoredBusiness(fallback);
  }, []);

  const value = useMemo<CurrentBusinessContextValue>(
    () => ({
      isHydrated,
      currentBusiness,
      setCurrentBusiness,
      clearCurrentBusiness,
    }),
    [isHydrated, currentBusiness, setCurrentBusiness, clearCurrentBusiness]
  );

  return (
    <CurrentBusinessContext.Provider value={value}>
      {children}
    </CurrentBusinessContext.Provider>
  );
}

export function useCurrentBusiness() {
  const ctx = useContext(CurrentBusinessContext);
  if (!ctx) {
    throw new Error(
      "useCurrentBusiness must be used within CurrentBusinessProvider"
    );
  }
  return ctx;
}
