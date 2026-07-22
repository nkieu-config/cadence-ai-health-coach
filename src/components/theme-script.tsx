import { THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";

const script = `(function () {
  var key = ${JSON.stringify(THEME_STORAGE_KEY)};
  var colors = ${JSON.stringify(THEME_COLORS)};
  var query = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  function apply() {
    var stored = null;
    try { stored = localStorage.getItem(key); } catch (e) {}
    var theme = stored === "light" || stored === "dark" ? stored : query && query.matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", colors[theme]);
  }
  apply();
  if (query && query.addEventListener) query.addEventListener("change", apply);
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
