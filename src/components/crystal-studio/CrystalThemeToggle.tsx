"use client";

import { Moon, Sun } from "lucide-react";
import { useCrystalTheme } from "@/lib/crystal-theme";

export function CrystalThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useCrystalTheme();
  return (
    <button
      type="button"
      className={`crystal-theme-toggle ${className}`}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={theme === "dark"}
      title={theme === "light" ? "Dark mode" : "Light mode"}
      onClick={toggleTheme}
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
