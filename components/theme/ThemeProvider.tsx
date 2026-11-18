"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

export type Theme = {
  name: string;
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
};

export const palettes: Theme[] = [
  {
    name: "Electric Yellow",
    primary: "#151515",
    accent: "#FFE13B",
    background: "#F3F3F1",
    surface: "#FFFFFF",
    text: "#151515",
  },
  {
    name: "Acid Lime",
    primary: "#171B17",
    accent: "#C9FA65",
    background: "#F1F4ED",
    surface: "#FFFFFF",
    text: "#1C241B",
  },
  {
    name: "Digital Sky",
    primary: "#142B46",
    accent: "#91C8FF",
    background: "#EDF3F9",
    surface: "#FFFFFF",
    text: "#142B46",
  },
  {
    name: "Neo Lavender",
    primary: "#28243D",
    accent: "#C4B3FF",
    background: "#F1EFF8",
    surface: "#FFFFFF",
    text: "#28243D",
  },
  {
    name: "Electric Coral",
    primary: "#282422",
    accent: "#FFAC91",
    background: "#F8F1EB",
    surface: "#FFFFFF",
    text: "#282422",
  },
  {
    name: "Glacier Mint",
    primary: "#143C3B",
    accent: "#83E8D3",
    background: "#EDF6F4",
    surface: "#FFFFFF",
    text: "#173B37",
  },
  {
    name: "Midnight Yellow",
    primary: "#101010",
    accent: "#FFE13B",
    background: "#191919",
    surface: "#252525",
    text: "#F5F5F5",
  },
];

export const defaultTheme = palettes[0];

export function contrastColor(hex: string) {
  const rgb = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  return luminance > 0.179 ? "#111111" : "#FFFFFF";
}

type ThemeContextType = {
  theme: Theme;
  draft: Theme;
  studioOpen: boolean;
  livePreview: boolean;
  setDraft: (theme: Theme) => void;
  setLivePreview: (value: boolean) => void;
  openStudio: () => void;
  cancel: () => void;
  apply: (themeToApply?: any) => void;
  reset: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [draft, setDraft] = useState(defaultTheme);
  const [studioOpen, setStudioOpen] = useState(false);
  const [livePreview, setLivePreview] = useState(true);

  useEffect(() => {
    function loadTheme() {
      try {
        const stored = localStorage.getItem("bizlead-theme");
        if (!stored) return;
        const saved = JSON.parse(stored);
        const valid = [
          "primary",
          "accent",
          "background",
          "surface",
          "text",
        ].every(
          (key) =>
            typeof saved[key] === "string" && /^#[0-9a-f]{6}$/i.test(saved[key])
        );
        if (valid) {
          setTheme(saved);
          setDraft(saved);
        }
      } catch {
        // Fall back to the default theme.
      }
    }

    loadTheme();
    window.addEventListener("storage", loadTheme);
    window.addEventListener("bizlead-theme-change", loadTheme);
    return () => {
      window.removeEventListener("storage", loadTheme);
      window.removeEventListener("bizlead-theme-change", loadTheme);
    };
  }, []);

  const active = studioOpen && livePreview ? draft : theme;

  function openStudio() {
    setDraft({ ...theme });
    setStudioOpen(true);
  }

  function cancel() {
    setDraft({ ...theme });
    setStudioOpen(false);
  }

  function apply(themeToApply?: any) {
    const next =
      themeToApply && typeof themeToApply === "object" && "primary" in themeToApply
        ? (themeToApply as Theme)
        : draft;
    setTheme({ ...next });
    setDraft({ ...next });
    try {
      localStorage.setItem("bizlead-theme", JSON.stringify(next));
      window.dispatchEvent(new Event("bizlead-theme-change"));
    } catch {}
    setStudioOpen(false);
  }

  function reset() {
    setDraft({ ...defaultTheme });
    apply(defaultTheme);
  }

  const isDark = contrastColor(active.background) === "#FFFFFF";
  const styles = {
    "--primary": active.primary,
    "--accent": active.accent,
    "--background": active.background,
    "--surface": active.surface,
    "--text": active.text,
    "--on-primary": contrastColor(active.primary),
    "--on-accent": contrastColor(active.accent),
    "--color-success": isDark ? "#34d399" : "#047857",
    "--color-danger": isDark ? "#f87171" : "#dc2626",
    "--color-warning": isDark ? "#fbbf24" : "#b45309",
    "--color-info": isDark ? "#60a5fa" : "#2563eb",
    "--surface-secondary": isDark
      ? "color-mix(in srgb, var(--text) 7%, var(--surface))"
      : "color-mix(in srgb, var(--text) 4%, var(--surface))",
  } as CSSProperties;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--primary", active.primary);
    root.style.setProperty("--accent", active.accent);
    root.style.setProperty("--background", active.background);
    root.style.setProperty("--surface", active.surface);
    root.style.setProperty("--text", active.text);
    root.style.setProperty("--on-primary", contrastColor(active.primary));
    root.style.setProperty("--on-accent", contrastColor(active.accent));
    root.style.setProperty("--color-success", isDark ? "#34d399" : "#047857");
    root.style.setProperty("--color-danger", isDark ? "#f87171" : "#dc2626");
    root.style.setProperty("--color-warning", isDark ? "#fbbf24" : "#b45309");
    root.style.setProperty("--color-info", isDark ? "#60a5fa" : "#2563eb");
    root.style.setProperty(
      "--surface-secondary",
      isDark
        ? "color-mix(in srgb, var(--text) 7%, var(--surface))"
        : "color-mix(in srgb, var(--text) 4%, var(--surface))"
    );
  }, [active, isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        draft,
        studioOpen,
        livePreview,
        setDraft,
        setLivePreview,
        openStudio,
        cancel,
        apply,
        reset,
      }}
    >
      <div className="bizlead bl-root" style={styles}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
