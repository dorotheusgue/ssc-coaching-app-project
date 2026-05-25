import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
 ({ className, label, error, id, ...props }, ref) => {
 const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

 return (
 <div className="w-full">
 {label && (
 <label
 htmlFor={inputId}
 className="block text-sm font-medium text-ink mb-1.5"
 >
 {label}
 </label>
 )}
 <input
 ref={ref}
 id={inputId}
 className={cn(
 "w-full border bg-bg px-3 py-2 text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-colors",
 error ? "border-red-500" : "border-line",
 className
 )}
 {...props}
 />
 {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
 </div>
 );
 }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
