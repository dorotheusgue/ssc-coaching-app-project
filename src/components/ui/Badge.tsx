import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeColor = "emerald" | "blue" | "red" | "yellow" | "purple" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colorStyles: Record<BadgeColor, string> = {
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  red: "bg-red-500/15 text-red-400 border-red-500/20",
  yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
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
