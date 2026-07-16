export const locales = ["en", "ar"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

// Keep server and browser formatting deterministic during SSR and hydration.
export const timeZone = "Africa/Cairo";

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
