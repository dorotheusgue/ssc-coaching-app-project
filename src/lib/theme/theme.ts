/**
 * SSC — Paper + Carbon themes (TypeScript mirror of tokens.css)
 *
 * Use only when you need to read token values in JS/TS (e.g. for inline-style
 * computed values, canvas/SVG colors, chart libs that don't accept CSS vars).
 * Otherwise prefer Tailwind utilities → `bg-surface`, `text-ink`, etc.
 *
 * Values must stay in sync with ./tokens.css.
 */

export type ThemeName = "paper" | "carbon";

export interface ThemeTokens {
 name: ThemeName;
 label: string;
 isDark: boolean;
 bg: string;
 surface: string;
 ink: string;
 mute: string;
 faint: string;
 line: string;
 rule: string;
 hover: string;
 chart: string;
 chartMute: string;
 accent: string;
}

export const PAPER: ThemeTokens = {
 name: "paper",
 label: "Paper",
 isDark: false,
 bg: "#f3f2ee",
 surface: "#ffffff",
 ink: "#0e0e0d",
 mute: "#88877f",
 faint: "#c3c1b8",
 line: "rgba(14, 14, 13, 0.09)",
 rule: "rgba(14, 14, 13, 0.20)",
 hover: "rgba(14, 14, 13, 0.045)",
 chart: "#0e0e0d",
 chartMute: "rgba(14, 14, 13, 0.16)",
 accent: "#0e0e0d",
};

export const CARBON: ThemeTokens = {
 name: "carbon",
 label: "Carbon",
 isDark: true,
 bg: "#0a0a09",
 surface: "#131312",
 ink: "#efece3",
 mute: "#7f7e77",
 faint: "#393937",
 line: "rgba(239, 236, 227, 0.10)",
 rule: "rgba(239, 236, 227, 0.24)",
 hover: "rgba(239, 236, 227, 0.05)",
 chart: "#efece3",
 chartMute: "rgba(239, 236, 227, 0.22)",
 accent: "#efece3",
};

export const THEMES: Record<ThemeName, ThemeTokens> = {
 paper: PAPER,
 carbon: CARBON,
};

export const DEFAULT_THEME: ThemeName = "paper";

/** Density scale — compact is the locked default. */
export const DENSITY = {
 compact: { pad: 14, row: 36, gap: 10, h1: 40, h2: 22, body: 12, micro: 9.5 },
 regular: { pad: 22, row: 44, gap: 18, h1: 52, h2: 26, body: 13, micro: 10.5 },
 airy: { pad: 34, row: 56, gap: 28, h1: 70, h2: 32, body: 14, micro: 11 },
} as const;

export type DensityName = keyof typeof DENSITY;
