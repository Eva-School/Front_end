"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "@/styles/theme";
import { useLanguage } from "@/context/LanguageContext";

export type ThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = "app_theme_mode";
const COOKIE_KEY = "app_theme_mode";
const ltrCache = createCache({ key: "mui" });
const rtlCache = createCache({ key: "mui-rtl", stylisPlugins: [rtlPlugin] });

function resolveInitialMode(initialMode: ThemeMode): ThemeMode {
  if (typeof window === "undefined") return initialMode;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeModeProvider({
  initialMode,
  children,
}: {
  initialMode: ThemeMode;
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  const [mode, setModeState] = useState<ThemeMode>(() => resolveInitialMode(initialMode));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    document.cookie = `${COOKIE_KEY}=${mode}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      setMode: setModeState,
      toggleMode: () => setModeState((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode, language), [mode, language]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <CacheProvider value={language === "ar" ? rtlCache : ltrCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              ":root": {
                colorScheme: mode,
              },
            }}
          />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}
