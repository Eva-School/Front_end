"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { isAppLocale, timeZone, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

export type AppLanguage = AppLocale;

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

function TranslationContextBridge({
  language,
  setLanguage,
  toggleLanguage,
  children,
}: {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  children: React.ReactNode;
}) {
  const translate = useTranslations();
  const value = useMemo<LanguageContextValue>(() => ({
    language,
    dir: language === "ar" ? "rtl" : "ltr",
    setLanguage,
    toggleLanguage,
    // Compatibility bridge for existing components. New components should use
    // next-intl's useTranslations(namespace) directly to benefit from typed keys.
    t: (key, fallback) => translate.has(key as never) ? translate(key as never) : (fallback ?? key),
  }), [language, setLanguage, toggleLanguage, translate]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
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
    return isAppLocale(saved) ? saved : initialLanguage;
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

  useEffect(() => {
    const direction = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
    document.documentElement.style.setProperty(
      "--app-font-family",
      language === "ar"
        ? "var(--font-cairo), Arial, sans-serif"
        : "var(--font-noto-sans), Arial, sans-serif"
    );
  }, [language]);

  return (
    <NextIntlClientProvider locale={language} timeZone={timeZone} messages={messages[language]}>
      <TranslationContextBridge language={language} setLanguage={setLanguage} toggleLanguage={toggleLanguage}>
        {children}
      </TranslationContextBridge>
    </NextIntlClientProvider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
