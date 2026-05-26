"use client";

import {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useRef,
 useState,
} from "react";
import { Check, X, AlertCircle } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type Toast = {
 id: number;
 kind: ToastKind;
 message: string;
};

type ToastContextValue = {
 push: (message: string, kind?: ToastKind) => void;
 success: (message: string) => void;
 error: (message: string) => void;
 info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
 const [toasts, setToasts] = useState<Toast[]>([]);
 const idRef = useRef(0);

 const remove = useCallback((id: number) => {
 setToasts((prev) => prev.filter((t) => t.id !== id));
 }, []);

 const push = useCallback(
 (message: string, kind: ToastKind = "info") => {
 const id = ++idRef.current;
 setToasts((prev) => [...prev, { id, kind, message }]);
 setTimeout(() => remove(id), 4000);
 },
 [remove]
 );

 const value: ToastContextValue = {
 push,
 success: (m) => push(m, "success"),
 error: (m) => push(m, "error"),
 info: (m) => push(m, "info"),
 };

 return (
 <ToastContext.Provider value={value}>
 {children}
 <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs print:hidden">
 {toasts.map((t) => (
 <ToastView key={t.id} toast={t} onDismiss={() => remove(t.id)} />
 ))}
 </div>
 </ToastContext.Provider>
 );
}

function ToastView({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
 useEffect(() => {
 // animation-in handled by Tailwind transition on mount via key
 }, []);

 const Icon =
 toast.kind === "success"
 ? Check
 : toast.kind === "error"
 ? AlertCircle
 : AlertCircle;

 return (
 <div
 role="status"
 className={`flex items-start gap-2 border bg-surface text-ink px-3 py-2 shadow-lg ${
 toast.kind === "error"
 ? "border-red-500/40"
 : "border-line"
 }`}
 >
 <Icon
 className={`w-4 h-4 mt-0.5 shrink-0 ${
 toast.kind === "error" ? "text-red-400" : "text-ink"
 }`}
 />
 <p className="text-sm flex-1 min-w-0">{toast.message}</p>
 <button
 onClick={onDismiss}
 className="text-mute hover:text-ink transition-colors cursor-pointer"
 aria-label="Dismiss"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 );
}

export function useToast(): ToastContextValue {
 const ctx = useContext(ToastContext);
 if (!ctx) {
 // Fall back to no-op so consumers can be used outside the provider
 // (e.g. SSR, isolated tests) without crashing.
 return {
 push: () => {},
 success: () => {},
 error: () => {},
 info: () => {},
 };
 }
 return ctx;
}
