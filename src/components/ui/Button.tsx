import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: ButtonVariant;
 size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
 primary: "bg-ink hover:bg-ink/90 text-bg",
 secondary: "bg-surface border border-line hover:bg-hover text-ink",
 danger: "bg-red-600 hover:bg-red-700 text-white",
 ghost: "bg-transparent hover:bg-hover text-ink",
};

const sizeStyles: Record<ButtonSize, string> = {
 sm: "px-3 py-1.5 text-sm",
 md: "px-4 py-2 text-sm",
 lg: "px-6 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
 return (
 <button
 ref={ref}
 disabled={disabled}
 className={cn(
 "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
 variantStyles[variant],
 sizeStyles[size],
 className
 )}
 {...props}
 >
 {children}
 </button>
 );
 }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
