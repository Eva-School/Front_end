import Script from "next/script";

export default function AccessibilityScript() {
  const script = `
    (function() {
      try {
        var savedMode = localStorage.getItem("app_theme_mode");
        var mode = savedMode === "light" || savedMode === "dark"
          ? savedMode
          : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.dataset.theme = mode;
      } catch (e) {}
    })();
  `;
  return <Script id="app-a11y-theme-init">{script}</Script>;
}
