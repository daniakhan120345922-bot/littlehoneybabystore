"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  Home,
  ScanLine,
  Shield,
  Circle,
  ChevronRight,
  Box,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

const ALL_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home, desc: "Store overview", roles: ["owner"] as UserRole[] },
  { href: "/cashier", label: "Cashier", icon: ScanLine, desc: "Point of sale", roles: ["owner", "cashier"] as UserRole[] },
  { href: "/owner", label: "Owner", icon: Shield, desc: "Inventory admin", roles: ["owner"] as UserRole[] },
  { href: "/products", label: "Your catalog", icon: Box, desc: "Registered products", roles: ["owner"] as UserRole[] },
  { href: "/settings", label: "Settings", icon: Settings, desc: "Accounts & alerts", roles: ["owner", "cashier"] as UserRole[] },
] as const;

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  fullBleed?: boolean;
};

export function AppShell({
  children,
  title,
  subtitle,
  headerRight,
  fullBleed,
}: AppShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const nav = ALL_NAV.filter((item) => role && item.roles.includes(role));
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const refreshAlerts = useCallback(async () => {
    if (role !== "owner") return;
    const res = await apiFetch<{ success: true; unreadCount: number }>("/api/settings");
    if ("data" in res) setUnreadAlerts(res.data.unreadCount);
  }, [role]);

  useEffect(() => {
    void refreshAlerts();
    const id = setInterval(() => void refreshAlerts(), 30000);
    return () => clearInterval(id);
  }, [refreshAlerts]);

  return (
    <div className="flex min-h-screen gradient-mesh">
      <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[var(--sidebar)] text-white shadow-2xl">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href={role === "owner" ? "/dashboard" : "/cashier"}>
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Workspace
          </p>
          {nav.map(({ href, label, icon: Icon, desc }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200",
                  active
                    ? "bg-[var(--sidebar-active)] text-white shadow-inner"
                    : "text-gray-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition",
                    active
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20"
                      : "bg-white/10 text-gray-300 group-hover:bg-white/20 group-hover:text-amber-400"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-100">{label}</p>
                  <p className="truncate text-[11px] text-gray-400 group-hover:text-gray-300">
                    {desc}
                  </p>
                </div>
                {active && <ChevronRight className="h-4 w-4 text-amber-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          {role === "owner" && unreadAlerts > 0 && (
            <Link
              href="/settings?tab=activity"
              className="flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2.5 ring-1 ring-amber-500/30 transition hover:bg-amber-500/25"
            >
              <Bell className="h-4 w-4 text-amber-300" />
              <span className="flex-1 text-xs font-medium text-amber-100">
                {unreadAlerts} new alert{unreadAlerts === 1 ? "" : "s"}
              </span>
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 ring-1 ring-emerald-500/20">
            <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-300">POS online</span>
          </div>
          {session?.user && (
            <div className="rounded-xl bg-white/5 px-3 py-2.5">
              <p className="truncate text-xs font-semibold text-white">
                {session.user.name}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-stone-500">
                {session.user.role}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            className="!text-stone-400 hover:!bg-white/10 hover:!text-white"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col pl-[260px]">
        {(title || headerRight) && (
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/60 bg-white/70 px-8 py-4 backdrop-blur-xl">
            <div>
              {title && (
                <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900">
                  {title}
                </h1>
              )}
              {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
            </div>
            {headerRight}
          </header>
        )}
        <main className={cn("flex-1", fullBleed ? "p-0" : "p-8")}>{children}</main>
      </div>
    </div>
  );
}
