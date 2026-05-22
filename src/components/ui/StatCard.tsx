import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  subtext,
  icon,
  accent = "amber",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  accent?: "amber" | "emerald" | "sky" | "violet";
}) {
  const accents = {
    amber: "from-amber-500/15 to-orange-500/5 text-amber-600",
    emerald: "from-emerald-500/15 to-teal-500/5 text-emerald-600",
    sky: "from-sky-500/15 to-blue-500/5 text-sky-600",
    violet: "from-violet-500/15 to-purple-500/5 text-violet-600",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-stone-200/60 transition hover:shadow-[var(--shadow-card)]">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition group-hover:opacity-80" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            {label}
          </p>
          <p className="font-display mt-2 text-3xl font-bold tracking-tight text-stone-900">
            {value}
          </p>
          {subtext && <p className="mt-1.5 text-xs text-stone-500">{subtext}</p>}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-white/50",
            accents[accent]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
