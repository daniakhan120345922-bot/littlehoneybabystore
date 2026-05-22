import { cn } from "@/lib/utils";

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 font-bold text-white shadow-lg shadow-amber-500/30",
          compact ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm"
        )}
      >
        LH
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="font-display truncate text-sm font-semibold leading-tight text-white">
            Little Honey
          </p>
          <p className="truncate text-[11px] font-medium text-stone-400">Baby Store POS</p>
        </div>
      )}
    </div>
  );
}
