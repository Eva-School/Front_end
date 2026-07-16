import React from "react";
import { cookies } from "next/headers";
import AppProviders from "@/providers/AppProviders";
import AccessibilityScript from "@/providers/AccessibilityScript";
import type { AppLanguage } from "@/context/LanguageContext";
import type { ThemeMode } from "@/context/ThemeModeContext";
import { cairo, notoSans } from "@/styles/theme/font";
import { defaultLocale, isAppLocale } from "@/i18n/config";

const LANGUAGE_COOKIE = "app_language";
const THEME_COOKIE = "app_theme_mode";

function resolveLanguage(value: string | undefined): AppLanguage {
  return isAppLocale(value) ? value : defaultLocale;
}

function resolveTheme(value: string | undefined): ThemeMode {
  return value === "dark" ? "dark" : "light";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialLanguage = resolveLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const initialThemeMode = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);
  const dir = initialLanguage === "ar" ? "rtl" : "ltr";

  return (
    <html lang={initialLanguage} dir={dir} className={`${notoSans.variable} ${cairo.variable}`} suppressHydrationWarning>
      <body dir={dir}>
        <AccessibilityScript />
        <AppProviders initialLanguage={initialLanguage} initialThemeMode={initialThemeMode}>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
