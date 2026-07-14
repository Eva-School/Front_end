"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

export type AppLanguage = "en" | "ar";

interface Dictionary {
  [key: string]: unknown;
}
const dictionaries: Record<AppLanguage, Dictionary> = { en, ar };

interface LanguageContextValue {
  language: AppLanguage;
  dir: "ltr" | "rtl";
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "app_language";
const COOKIE_KEY = "app_language";

function getNestedValue(dict: Dictionary, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, dict);
  return typeof value === "string" ? value : undefined;
}

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: AppLanguage;
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window === "undefined") return initialLanguage;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "ar" ? saved : initialLanguage;
  });

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
      document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const toggleLanguage = useCallback(
    () => setLanguage(language === "en" ? "ar" : "en"),
    [language, setLanguage]
  );

  const value = useMemo<LanguageContextValue>(() => {
    const dict = dictionaries[language];
    return {
      language,
      dir: language === "ar" ? "rtl" : "ltr",
      setLanguage,
      toggleLanguage,
      t: (key: string, fallback?: string) => getNestedValue(dict, key) ?? fallback ?? key,
    };
  }, [language, setLanguage, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
