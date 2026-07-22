export const THEME_STORAGE_KEY = "cadence-theme";

export const THEME_COLORS = {
  light: "#ffffff",
  dark: "#0d1526",
} as const;

export type Theme = keyof typeof THEME_COLORS;

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
}

function withoutTransitions(update: () => void) {
  const override = document.createElement("style");
  override.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.append(override);
  update();
  document.body.getBoundingClientRect();
  requestAnimationFrame(() => override.remove());
}

export function toggleTheme() {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  withoutTransitions(() => applyTheme(next));
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    return;
  }
}
