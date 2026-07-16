import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isAppLocale, timeZone } from "./config";
import { messages } from "./messages";

const LANGUAGE_COOKIE = "app_language";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const locale = isAppLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale,
    timeZone,
    messages: messages[locale],
    formats: {
      number: {
        integer: { maximumFractionDigits: 0 },
        decimal: { maximumFractionDigits: 2 },
      },
      dateTime: {
        short: { dateStyle: "short" },
        medium: { dateStyle: "medium" },
      },
    },
  };
});
