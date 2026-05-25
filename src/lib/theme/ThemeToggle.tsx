"use client";

import { useTheme } from "./ThemeProvider";

/**
 * Reference UI for switching Paper ↔ Carbon.
 * Drop this anywhere in the app. Styling uses the theme tokens, so it
 * inverts cleanly with the active theme.
 */
export function ThemeToggle() {
 const { theme, setTheme } = useTheme();

 return (
 <div
 role="radiogroup"
 aria-label="Theme"
 className="inline-flex border border-line"
 >
 {(["paper", "carbon"] as const).map((opt) => {
 const active = theme === opt;
 return (
 <button
 key={opt}
 role="radio"
 aria-checked={active}
 onClick={() => setTheme(opt)}
 className={[
 "px-3 h-7 text-[11px] tracking-[-0.005em] capitalize",
 "transition-colors cursor-pointer",
 active
 ? "bg-ink text-bg"
 : "bg-transparent text-mute hover:text-ink",
 ].join(" ")}
 >
 {opt}
 </button>
 );
 })}
 </div>
 );
}
