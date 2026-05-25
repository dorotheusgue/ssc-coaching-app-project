"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, ThemeName } from "./theme";

const STORAGE_KEY = "ssc-theme";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Wrap the app in <ThemeProvider> (in `src/app/layout.tsx`) so all pages get
 * theme switching + persistence. The provider:
 *   - reads the user's last choice from localStorage
 *   - sets `data-theme` on the <html> element (so tokens.css selectors match)
 *   - exposes `useTheme()` for any component that needs to read or change it
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  // Hydrate from localStorage on mount (avoids SSR mismatch by deferring read)
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "paper" || stored === "carbon") {
      setThemeState(stored);
    }
  }, []);

  // Reflect to <html data-theme="..."> + persist
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === "paper" ? "carbon" : "paper"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
