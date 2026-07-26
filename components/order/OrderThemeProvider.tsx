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
  ORDER_THEME_STORAGE_KEY,
  persistOrderTheme,
  resolveInitialOrderTheme,
  type OrderThemeMode,
} from "../../lib/order/theme";
import { ORDER_THEME_CSS } from "../../lib/order/orderThemeCss";

type Ctx = {
  theme: OrderThemeMode;
  setTheme: (mode: OrderThemeMode) => void;
  toggleTheme: () => void;
  ready: boolean;
};

const OrderThemeContext = createContext<Ctx | null>(null);

export function OrderThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<OrderThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeState(resolveInitialOrderTheme());
    setReady(true);
  }, []);

  const setTheme = useCallback((mode: OrderThemeMode) => {
    setThemeState(mode);
    persistOrderTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      persistOrderTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, ready }),
    [theme, setTheme, toggleTheme, ready]
  );

  return (
    <OrderThemeContext.Provider value={value}>
      <style dangerouslySetInnerHTML={{ __html: ORDER_THEME_CSS }} />
      <div
        data-order-surface=""
        data-theme={theme}
        data-theme-ready={ready ? "1" : "0"}
        data-theme-key={ORDER_THEME_STORAGE_KEY}
        className="min-h-dvh antialiased transition-colors duration-200"
        style={{ background: "var(--order-bg)", color: "var(--order-text)" }}
      >
        {children}
      </div>
    </OrderThemeContext.Provider>
  );
}

export function useOrderTheme(): Ctx {
  const ctx = useContext(OrderThemeContext);
  if (!ctx) {
    throw new Error("useOrderTheme must be used within OrderThemeProvider");
  }
  return ctx;
}
