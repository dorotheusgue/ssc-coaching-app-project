import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
 label?: string;
 error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, label, error, id, ...props }, ref) => {
 const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

 return (
 <div className="w-full">
 {label && (
 <label
 htmlFor={textareaId}
 className="block text-sm font-medium text-ink mb-1.5"
 >
 {label}
 </label>
 )}
 <textarea
 ref={ref}
 id={textareaId}
 className={cn(
 "w-full border bg-bg px-3 py-2 text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-colors resize-y min-h-[80px]",
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

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
