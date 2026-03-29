import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: ReactNode;
}

function Card({ className, title, actions, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-neutral-800 border border-neutral-700 rounded-xl",
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export { Card };
export type { CardProps };
