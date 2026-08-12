export type ThemeMode = "shadcn" | "claude";

export const THEME_STORAGE_KEY = "serverless-ship-theme";
export const DEFAULT_THEME: ThemeMode = "claude";

export const themeOptions = {
  shadcn: {
    label: "shadcn/ui",
    shortLabel: "shadcn",
    description: "Light neutral theme",
  },
  claude: {
    label: "Claude Code",
    shortLabel: "Claude",
    description: "Light Claude-inspired theme",
  },
} satisfies Record<ThemeMode, { label: string; shortLabel: string; description: string }>;

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === "shadcn" || value === "claude";
}

export function getThemeInitScript() {
  return `
    (function () {
      try {
        var theme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
        if (theme === "shadcn" || theme === "claude") {
          document.documentElement.dataset.theme = theme;
          document.documentElement.style.colorScheme = "light";
        }
      } catch (error) {}
    })();
  `;
}
