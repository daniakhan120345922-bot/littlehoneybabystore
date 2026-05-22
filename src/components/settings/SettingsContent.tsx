"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Save } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SettingsApiResponse, ActivityLogEntry } from "@/types/store-settings";

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100/80";

type Tab = "account" | "notifications" | "activity";

export function SettingsContent() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("account");

  useEffect(() => {
    const q = searchParams.get("tab") as Tab | null;
    if (q === "account" || q === "notifications" || q === "activity") {
      setTab(q);
    }
  }, [searchParams]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettingsApiResponse | null>(null);

  const [ownerForm, setOwnerForm] = useState({ email: "", displayName: "", password: "" });
  const [cashierForm, setCashierForm] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
  });
  const [selfForm, setSelfForm] = useState({
    currentPassword: "",
    email: "",
    displayName: "",
    password: "",
  });
  const [notifForm, setNotifForm] = useState({
    notifyOwnerOnCashierLogin: true,
    lowStockAlert: true,
    soundOnScan: false,
  });

  const load = useCallback(async () => {
    const res = await apiFetch<SettingsApiResponse>("/api/settings");
    if ("error" in res) {
      showToast(res.error.error, "error");
      setLoading(false);
      return;
    }
    const d = res.data;
    setData(d);
    setOwnerForm({
      email: d.owner.email,
      displayName: d.owner.displayName,
      password: "",
    });
    setCashierForm({
      username: d.cashier.username,
      email: d.cashier.email,
      displayName: d.cashier.displayName,
      password: "",
    });
    setSelfForm({
      currentPassword: "",
      email: d.cashier.email,
      displayName: d.cashier.displayName,
      password: "",
    });
    setNotifForm({ ...d.notifications });
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveOwner = async () => {
    setSaving(true);
    const res = await apiFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({
        action: "update_owner",
        email: ownerForm.email,
        displayName: ownerForm.displayName,
        ...(ownerForm.password ? { password: ownerForm.password } : {}),
      }),
    });
    setSaving(false);
    if ("error" in res) {
      showToast(res.error.error, "error");
      return;
    }
    showToast("Owner account updated. Use new credentials on next sign-in.", "success");
    setOwnerForm((f) => ({ ...f, password: "" }));
    await load();
  };

  const saveCashier = async () => {
    setSaving(true);
    const res = await apiFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({
        action: "update_cashier",
        username: cashierForm.username,
        email: cashierForm.email,
        displayName: cashierForm.displayName,
        ...(cashierForm.password ? { password: cashierForm.password } : {}),
      }),
    });
    setSaving(false);
    if ("error" in res) {
      showToast(res.error.error, "error");
      return;
    }
    showToast("Cashier account updated.", "success");
    setCashierForm((f) => ({ ...f, password: "" }));
    await load();
  };

  const saveSelf = async () => {
    if (!selfForm.currentPassword) {
      showToast("Enter your current password.", "error");
      return;
    }
    setSaving(true);
    const res = await apiFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({
        action: "update_self",
        currentPassword: selfForm.currentPassword,
        email: selfForm.email,
        displayName: selfForm.displayName,
        ...(selfForm.password ? { password: selfForm.password } : {}),
      }),
    });
    setSaving(false);
    if ("error" in res) {
      showToast(res.error.error, "error");
      return;
    }
    showToast("Your account was updated.", "success");
    setSelfForm((f) => ({ ...f, currentPassword: "", password: "" }));
    await load();
  };

  const saveNotifications = async () => {
    setSaving(true);
    const res = await apiFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ action: "update_notifications", ...notifForm }),
    });
    setSaving(false);
    if ("error" in res) {
      showToast(res.error.error, "error");
      return;
    }
    showToast("Notification settings saved.", "success");
    await load();
  };

  const markAllRead = async () => {
    await apiFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ action: "mark_activity_read" }),
    });
    await load();
  };

  const clearActivityLog = async () => {
    await apiFetch("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ action: "clear_activity_log" }),
    });
    showToast("Activity log cleared.", "success");
    await load();
  };

  const isOwner = role === "owner";
  const tabs: { id: Tab; label: string; ownerOnly?: boolean }[] = [
    { id: "account", label: "Account" },
    { id: "notifications", label: "Notifications", ownerOnly: true },
    { id: "activity", label: "Activity", ownerOnly: true },
  ];
  const visibleTabs = tabs.filter((t) => !t.ownerOnly || isOwner);

  return (
    <AppShell title="Settings" subtitle="Accounts, alerts, and store preferences">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap gap-2 rounded-xl bg-stone-100 p-1">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition",
                tab === t.id ? "bg-white text-amber-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
              )}
            >
              {t.label}
              {t.id === "activity" && data && data.unreadCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                  {data.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading settings…</p>
        ) : (
          <>
            {tab === "account" && isOwner && (
              <div className="space-y-6">
                <Card padding="lg">
                  <SectionHeader
                    title="Owner account"
                    description="Email and password used to sign in as owner"
                  />
                  <div className="mt-6 space-y-4">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        Display name
                      </span>
                      <input
                        value={ownerForm.displayName}
                        onChange={(e) => setOwnerForm((f) => ({ ...f, displayName: e.target.value }))}
                        className={cn(inputClass, "mt-1")}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        Email
                      </span>
                      <input
                        type="email"
                        value={ownerForm.email}
                        onChange={(e) => setOwnerForm((f) => ({ ...f, email: e.target.value }))}
                        className={cn(inputClass, "mt-1")}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        New password
                      </span>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={ownerForm.password}
                        onChange={(e) => setOwnerForm((f) => ({ ...f, password: e.target.value }))}
                        className={cn(inputClass, "mt-1")}
                      />
                    </label>
                    <Button
                      variant="primary"
                      leftIcon={<Save className="h-4 w-4" />}
                      disabled={saving}
                      onClick={() => void saveOwner()}
                    >
                      Save owner account
                    </Button>
                  </div>
                </Card>

                <Card padding="lg">
                  <SectionHeader
                    title="Cashier account"
                    description="Username, email, and password for cashier login"
                  />
                  <div className="mt-6 space-y-4">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        Display name
                      </span>
                      <input
                        value={cashierForm.displayName}
                        onChange={(e) =>
                          setCashierForm((f) => ({ ...f, displayName: e.target.value }))
                        }
                        className={cn(inputClass, "mt-1")}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        Username
                      </span>
                      <input
                        value={cashierForm.username}
                        onChange={(e) => setCashierForm((f) => ({ ...f, username: e.target.value }))}
                        className={cn(inputClass, "mt-1 font-mono")}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        Email
                      </span>
                      <input
                        type="email"
                        value={cashierForm.email}
                        onChange={(e) => setCashierForm((f) => ({ ...f, email: e.target.value }))}
                        className={cn(inputClass, "mt-1")}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                        New password
                      </span>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={cashierForm.password}
                        onChange={(e) => setCashierForm((f) => ({ ...f, password: e.target.value }))}
                        className={cn(inputClass, "mt-1")}
                      />
                    </label>
                    <Button
                      variant="primary"
                      leftIcon={<Save className="h-4 w-4" />}
                      disabled={saving}
                      onClick={() => void saveCashier()}
                    >
                      Save cashier account
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {tab === "account" && !isOwner && (
              <Card padding="lg">
                <SectionHeader
                  title="My account"
                  description="Update your cashier email, name, or password"
                />
                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Current password
                    </span>
                    <input
                      type="password"
                      required
                      value={selfForm.currentPassword}
                      onChange={(e) =>
                        setSelfForm((f) => ({ ...f, currentPassword: e.target.value }))
                      }
                      className={cn(inputClass, "mt-1")}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Display name
                    </span>
                    <input
                      value={selfForm.displayName}
                      onChange={(e) => setSelfForm((f) => ({ ...f, displayName: e.target.value }))}
                      className={cn(inputClass, "mt-1")}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      Email
                    </span>
                    <input
                      type="email"
                      value={selfForm.email}
                      onChange={(e) => setSelfForm((f) => ({ ...f, email: e.target.value }))}
                      className={cn(inputClass, "mt-1")}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                      New password
                    </span>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={selfForm.password}
                      onChange={(e) => setSelfForm((f) => ({ ...f, password: e.target.value }))}
                      className={cn(inputClass, "mt-1")}
                    />
                  </label>
                  <Button
                    variant="primary"
                    leftIcon={<Save className="h-4 w-4" />}
                    disabled={saving}
                    onClick={() => void saveSelf()}
                  >
                    Save my account
                  </Button>
                </div>
              </Card>
            )}

            {tab === "notifications" && isOwner && (
              <Card padding="lg">
                <SectionHeader
                  title="Store notifications"
                  description="Alerts and POS behavior for your team"
                />
                <ul className="mt-6 space-y-4">
                  <ToggleRow
                    label="Notify when cashier signs in"
                    desc="You will see an alert in Activity when a cashier logs in"
                    checked={notifForm.notifyOwnerOnCashierLogin}
                    onChange={(v) => setNotifForm((f) => ({ ...f, notifyOwnerOnCashierLogin: v }))}
                  />
                  <ToggleRow
                    label="Low stock reminders"
                    desc="Highlight products with 5 or fewer units on the dashboard"
                    checked={notifForm.lowStockAlert}
                    onChange={(v) => setNotifForm((f) => ({ ...f, lowStockAlert: v }))}
                  />
                  <ToggleRow
                    label="Scan sound (coming soon)"
                    desc="Play a short beep when a barcode is scanned at the cashier"
                    checked={notifForm.soundOnScan}
                    onChange={(v) => setNotifForm((f) => ({ ...f, soundOnScan: v }))}
                  />
                </ul>
                <Button
                  className="mt-6"
                  variant="primary"
                  leftIcon={<Save className="h-4 w-4" />}
                  disabled={saving}
                  onClick={() => void saveNotifications()}
                >
                  Save notifications
                </Button>
              </Card>
            )}

            {tab === "activity" && isOwner && (
              <Card padding="lg">
                <SectionHeader
                  title="Activity log"
                  description="Cashier sign-ins and settings changes"
                  action={
                    data && data.activityLog.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.unreadCount > 0 && (
                          <Button variant="secondary" size="sm" onClick={() => void markAllRead()}>
                            Mark all read
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => void clearActivityLog()}>
                          Clear log
                        </Button>
                      </div>
                    ) : undefined
                  }
                />
                <ActivityList entries={data?.activityLog ?? []} />
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        <p className="mt-0.5 text-xs text-stone-500">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-amber-500" : "bg-stone-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
            checked ? "left-5" : "left-0.5"
          )}
        />
      </button>
    </li>
  );
}

function ActivityList({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="mt-6 text-sm text-stone-500">No activity yet.</p>;
  }
  return (
    <ul className="mt-6 divide-y divide-stone-100">
      {entries.map((e) => (
        <li
          key={e.id}
          className={cn(
            "flex gap-3 py-3 first:pt-0",
            !e.read && "rounded-lg bg-amber-50/60 px-2 -mx-2"
          )}
        >
          <span
            className={cn(
              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
              e.read ? "bg-stone-300" : "bg-amber-500"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-stone-800">{e.message}</p>
            <p className="text-xs text-stone-400">
              {new Date(e.at).toLocaleString("en-PK", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
