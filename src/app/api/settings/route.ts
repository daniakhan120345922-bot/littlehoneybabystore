export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import {
  appendSettingsActivity,
  clearActivityLog,
  getUnreadCount,
  logCashierLogin,
  markAllActivityRead,
  readStoreSettings,
  toPublicCashier,
  toPublicOwner,
  updateCashierAccount,
  updateCashierSelf,
  updateNotificationSettings,
  updateOwnerAccount,
} from "@/lib/settings";
import type { SettingsApiResponse } from "@/types/store-settings";
import type { ApiError } from "@/types/inventory";

function errorResponse(message: string, status: number): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error: message }, { status });
}

/** GET /api/settings — account & notification settings (role-aware) */
export async function GET() {
  const session = await requireRole("owner", "cashier");
  if (!session) return errorResponse("Unauthorized", 401);

  const settings = await readStoreSettings();
  const isOwner = session.user.role === "owner";

  const body: SettingsApiResponse = {
    success: true,
    owner: toPublicOwner(settings.owner),
    cashier: toPublicCashier(settings.cashier),
    notifications: settings.notifications,
    activityLog: isOwner ? settings.activityLog : [],
    unreadCount: isOwner ? getUnreadCount(settings.activityLog) : 0,
  };

  return NextResponse.json(body);
}

type PatchBody =
  | { action: "update_owner"; email?: string; password?: string; displayName?: string }
  | {
      action: "update_cashier";
      username?: string;
      email?: string;
      password?: string;
      displayName?: string;
    }
  | {
      action: "update_self";
      currentPassword: string;
      email?: string;
      password?: string;
      displayName?: string;
    }
  | {
      action: "update_notifications";
      notifyOwnerOnCashierLogin?: boolean;
      lowStockAlert?: boolean;
      soundOnScan?: boolean;
    }
  | { action: "cashier_login_notify" }
  | { action: "mark_activity_read" }
  | { action: "clear_activity_log" };

/** PATCH /api/settings — update credentials, notifications, or activity */
export async function PATCH(req: Request) {
  const session = await requireRole("owner", "cashier");
  if (!session) return errorResponse("Unauthorized", 401);

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const role = session.user.role;

  if (body.action === "cashier_login_notify") {
    if (role !== "cashier") return errorResponse("Forbidden", 403);
    await logCashierLogin();
    return NextResponse.json({ success: true });
  }

  if (body.action === "mark_activity_read") {
    if (role !== "owner") return errorResponse("Forbidden", 403);
    await markAllActivityRead();
    return NextResponse.json({ success: true });
  }

  if (body.action === "clear_activity_log") {
    if (role !== "owner") return errorResponse("Forbidden", 403);
    await clearActivityLog();
    return NextResponse.json({ success: true });
  }

  if (body.action === "update_notifications") {
    if (role !== "owner") return errorResponse("Forbidden", 403);
    await updateNotificationSettings({
      notifyOwnerOnCashierLogin: body.notifyOwnerOnCashierLogin,
      lowStockAlert: body.lowStockAlert,
      soundOnScan: body.soundOnScan,
    });
    await appendSettingsActivity("Store notification settings were updated");
    return NextResponse.json({ success: true });
  }

  if (body.action === "update_owner") {
    if (role !== "owner") return errorResponse("Forbidden", 403);
    if (!body.email?.trim() && !body.password && !body.displayName?.trim()) {
      return errorResponse("Nothing to update", 400);
    }
    await updateOwnerAccount({
      email: body.email,
      password: body.password,
      displayName: body.displayName,
    });
    await appendSettingsActivity("Owner account credentials were updated");
    return NextResponse.json({ success: true });
  }

  if (body.action === "update_cashier") {
    if (role !== "owner") return errorResponse("Forbidden", 403);
    if (
      !body.username?.trim() &&
      !body.email?.trim() &&
      !body.password &&
      !body.displayName?.trim()
    ) {
      return errorResponse("Nothing to update", 400);
    }
    await updateCashierAccount({
      username: body.username,
      email: body.email,
      password: body.password,
      displayName: body.displayName,
    });
    await appendSettingsActivity("Cashier account credentials were updated");
    return NextResponse.json({ success: true });
  }

  if (body.action === "update_self") {
    if (role !== "cashier") return errorResponse("Forbidden", 403);
    if (!body.currentPassword) return errorResponse("Current password required", 400);
    const result = await updateCashierSelf(body.currentPassword, {
      email: body.email,
      password: body.password,
      displayName: body.displayName,
    });
    if (result === "invalid_password") {
      return errorResponse("Current password is incorrect", 400);
    }
    return NextResponse.json({ success: true });
  }

  return errorResponse("Unknown action", 400);
}
