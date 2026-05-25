import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeColor = "emerald" | "blue" | "red" | "yellow" | "purple" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
 color?: BadgeColor;
}

const colorStyles: Record<BadgeColor, string> = {
 emerald: "bg-ink/15 text-ink border-line",
 blue: "bg-ink/15 text-ink border-line",
 red: "bg-red-500/15 text-red-400 border-red-500/20",
 yellow: "bg-ink/15 text-ink border-line",
 purple: "bg-ink/15 text-ink border-line",
 neutral: "bg-mute/15 text-mute border-mute/20",
};

function Badge({
 className,
 color = "neutral",
 children,
 ...props
}: BadgeProps) {
 return (
 <span
 className={cn(
 "inline-flex items-center border px-2.5 py-0.5 text-xs font-medium",
 colorStyles[color],
 className
 )}
 {...props}
 >
 {children}
 </span>
 );
}

export { Badge };
export type { BadgeProps, BadgeColor };
