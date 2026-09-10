import Script from "next/script";

export default function AccessibilityScript() {
  const script = `
    (function() {
      try {
        var savedLang = localStorage.getItem("app_language");
        if ((savedLang === "ar" || savedLang === "en") && !document.cookie.includes("app_language=")) {
          document.cookie = "app_language=" + savedLang + "; path=/; max-age=31536000; samesite=lax";
        }
        var savedMode = localStorage.getItem("app_theme_mode");
        var mode = savedMode === "light" || savedMode === "dark"
          ? savedMode
          : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.dataset.theme = mode;
        if ((mode === "light" || mode === "dark") && !document.cookie.includes("app_theme_mode=")) {
          document.cookie = "app_theme_mode=" + mode + "; path=/; max-age=31536000; samesite=lax";
        }
      } catch (e) {}
    })();
  `;
  return <Script id="app-a11y-theme-init" strategy="beforeInteractive">{script}</Script>;
}
