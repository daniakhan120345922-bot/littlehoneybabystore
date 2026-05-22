"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

type Toast = { id: string; message: string; type: ToastType };

const ToastContext = createContext<{ showToast: (m: string, t?: ToastType) => void } | null>(null);

const config = {
  success: { icon: CheckCircle2, bar: "bg-emerald-500", ring: "ring-emerald-500/20" },
  error: { icon: AlertCircle, bar: "bg-red-500", ring: "ring-red-500/20" },
  info: { icon: Info, bar: "bg-amber-500", ring: "ring-amber-500/20" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismiss = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={useMemo(() => ({ showToast }), [showToast])}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-full max-w-md flex-col gap-3 px-4 sm:px-0">
        {toasts.map((t) => {
          const { icon: Icon, bar, ring } = config[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "animate-toast-in pointer-events-auto flex overflow-hidden rounded-2xl bg-white shadow-2xl ring-1",
                ring
              )}
            >
              <div className={cn("w-1 shrink-0", bar)} />
              <div className="flex flex-1 items-start gap-3 p-4">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", t.type === "success" && "text-emerald-500", t.type === "error" && "text-red-500", t.type === "info" && "text-amber-500")} />
                <p className="flex-1 text-sm font-medium text-stone-800">{t.message}</p>
                <button type="button" onClick={() => dismiss(t.id)} className="text-stone-400 hover:text-stone-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast requires ToastProvider");
  return ctx;
}
