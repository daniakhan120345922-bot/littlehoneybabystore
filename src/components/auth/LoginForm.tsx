"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ScanLine, Shield, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("cashier");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username: username.trim(),
      password,
      role,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password for this role.");
      return;
    }

    if (role === "cashier") {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cashier_login_notify" }),
      });
    }

    router.push(role === "owner" ? "/dashboard" : "/cashier");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen gradient-mesh">
      <div className="flex w-full flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 px-8 py-16 text-white lg:px-16">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative max-w-md">
            <div className="mb-8 [&_p]:text-white [&_p:last-child]:text-stone-400">
              <Logo />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" />
              Secure staff access only
            </span>
            <h1 className="font-display mt-6 text-4xl font-bold leading-tight tracking-tight">
              Little Honey
              <span className="block text-transparent bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text">
                Baby Store
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-stone-300">
              Internal point of sale for authorized cashiers and store owners. Sign in to
              continue.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-3xl bg-white p-8 shadow-[var(--shadow-card)] ring-1 ring-stone-200/60">
              <div className="mb-6 flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                <h2 className="font-display text-xl font-semibold text-stone-900">Staff login</h2>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => setRole("cashier")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition",
                    role === "cashier"
                      ? "bg-white text-amber-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  <ScanLine className="h-4 w-4" />
                  Cashier
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition",
                    role === "owner"
                      ? "bg-white text-amber-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Owner
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    {role === "owner" ? "Email" : "Username"}
                  </label>
                  <input
                    required
                    type={role === "owner" ? "email" : "text"}
                    autoComplete={role === "owner" ? "email" : "username"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      role === "owner" ? "daniaowner@gmail.com" : "cashier"
                    }
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/80"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100/80"
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-200/60">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  leftIcon={
                    loading ? <Loader2 className="h-5 w-5 animate-spin" /> : undefined
                  }
                >
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-stone-400">
                Owner: sign in with your store email
                <br />
                Cashier: <code className="text-stone-600">cashier</code> /{" "}
                <code className="text-stone-600">cashier2024</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
