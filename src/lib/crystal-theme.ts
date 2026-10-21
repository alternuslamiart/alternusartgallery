import { useSyncExternalStore } from "react";

export type CrystalTheme = "light" | "dark";
export const CRYSTAL_THEME_KEY = "crystal_studio_theme";
const THEME_EVENT = "crystal:theme-change";

function currentTheme(): CrystalTheme {
  if (typeof window === "undefined") return "dark";
  const applied = document.documentElement.dataset.crystalTheme;
  if (applied === "light" || applied === "dark") return applied;
  return storedTheme();
}

function storedTheme(): CrystalTheme {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(CRYSTAL_THEME_KEY) ?? window.localStorage.getItem("Coreforge_auth_theme");
  } catch {
    stored = document.documentElement.dataset.crystalTheme ?? null;
  }
  return stored === "light" ? "light" : "dark";
}

function subscribe(callback: () => void) {
  const onStorage = () => {
    document.documentElement.dataset.crystalTheme = storedTheme();
    callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

export function useCrystalTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "dark" as const);
  const setTheme = (next: CrystalTheme) => {
    try { window.localStorage.setItem(CRYSTAL_THEME_KEY, next); } catch { /* Theme remains usable without storage. */ }
    document.documentElement.dataset.crystalTheme = next;
    window.dispatchEvent(new Event(THEME_EVENT));
  };
  return { theme, setTheme, toggleTheme: () => setTheme(theme === "light" ? "dark" : "light") };
}
