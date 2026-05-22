import fs from "fs/promises";
import path from "path";
import { hashPassword, verifyPassword } from "@/lib/password";
import type {
  ActivityLogEntry,
  CashierAccountSettings,
  OwnerAccountSettings,
  PublicCashierSettings,
  PublicOwnerSettings,
  StoreNotificationSettings,
  StoreSettings,
} from "@/types/store-settings";
import type { UserRole } from "@/types/auth";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(DATA_DIR, "store-settings.json");
const MAX_ACTIVITY = 50;

function envDefaults(): StoreSettings {
  return {
    owner: {
      email: (process.env.OWNER_EMAIL ?? "daniaowner@gmail.com").toLowerCase(),
      passwordHash: hashPassword(process.env.OWNER_PASSWORD ?? "dania1122"),
      displayName: "Dania — Owner",
    },
    cashier: {
      username: process.env.CASHIER_USERNAME ?? "cashier",
      email: process.env.CASHIER_EMAIL ?? "cashier@littlehoney.local",
      passwordHash: hashPassword(process.env.CASHIER_PASSWORD ?? "cashier2024"),
      displayName: "Cashier",
    },
    notifications: {
      notifyOwnerOnCashierLogin: true,
      lowStockAlert: true,
      soundOnScan: false,
    },
    activityLog: [],
  };
}

function newActivityId(): string {
  return `act-${Date.now().toString(36)}`;
}

/** Reads store settings from disk, seeding from env on first run */
export async function readStoreSettings(): Promise<StoreSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as StoreSettings;
    if (!parsed.owner?.passwordHash || !parsed.cashier?.passwordHash) {
      throw new Error("invalid settings");
    }
    return {
      ...envDefaults(),
      ...parsed,
      owner: { ...envDefaults().owner, ...parsed.owner },
      cashier: { ...envDefaults().cashier, ...parsed.cashier },
      notifications: { ...envDefaults().notifications, ...parsed.notifications },
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
    };
  } catch {
    const defaults = envDefaults();
    await writeStoreSettings(defaults);
    return defaults;
  }
}

export async function writeStoreSettings(settings: StoreSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

export function toPublicOwner(owner: OwnerAccountSettings): PublicOwnerSettings {
  return { email: owner.email, displayName: owner.displayName };
}

export function toPublicCashier(cashier: CashierAccountSettings): PublicCashierSettings {
  return { username: cashier.username, email: cashier.email, displayName: cashier.displayName };
}

export function getUnreadCount(log: ActivityLogEntry[]): number {
  return log.filter((e) => !e.read).length;
}

/** Validates login against persisted settings (falls back to env hashes on first boot) */
export async function verifyStaffLogin(
  login: string,
  password: string,
  role: UserRole
): Promise<{ id: string; name: string; email: string; role: UserRole } | null> {
  const settings = await readStoreSettings();
  if (role === "owner") {
    const email = login.trim().toLowerCase();
    if (
      email === settings.owner.email.toLowerCase() &&
      verifyPassword(password, settings.owner.passwordHash)
    ) {
      return {
        id: "owner-1",
        name: settings.owner.displayName,
        email: settings.owner.email,
        role: "owner",
      };
    }
  }
  if (role === "cashier") {
    const user = login.trim();
    const matchUsername = user === settings.cashier.username;
    const matchEmail = user.toLowerCase() === settings.cashier.email.toLowerCase();
    if (
      (matchUsername || matchEmail) &&
      verifyPassword(password, settings.cashier.passwordHash)
    ) {
      return {
        id: "cashier-1",
        name: settings.cashier.displayName,
        email: settings.cashier.email,
        role: "cashier",
      };
    }
  }
  return null;
}

export async function logCashierLogin(): Promise<ActivityLogEntry | null> {
  const settings = await readStoreSettings();
  if (!settings.notifications.notifyOwnerOnCashierLogin) return null;

  const entry: ActivityLogEntry = {
    id: newActivityId(),
    type: "cashier_login",
    message: `${settings.cashier.displayName} signed in to the POS`,
    at: new Date().toISOString(),
    read: false,
  };

  settings.activityLog = [entry, ...settings.activityLog].slice(0, MAX_ACTIVITY);
  await writeStoreSettings(settings);
  return entry;
}

export async function markAllActivityRead(): Promise<void> {
  const settings = await readStoreSettings();
  settings.activityLog = settings.activityLog.map((e) => ({ ...e, read: true }));
  await writeStoreSettings(settings);
}

export async function clearActivityLog(): Promise<void> {
  const settings = await readStoreSettings();
  settings.activityLog = [];
  await writeStoreSettings(settings);
}

export async function appendSettingsActivity(message: string): Promise<void> {
  const settings = await readStoreSettings();
  const entry: ActivityLogEntry = {
    id: newActivityId(),
    type: "settings_updated",
    message,
    at: new Date().toISOString(),
    read: false,
  };
  settings.activityLog = [entry, ...settings.activityLog].slice(0, MAX_ACTIVITY);
  await writeStoreSettings(settings);
}

export type UpdateOwnerInput = {
  email?: string;
  password?: string;
  displayName?: string;
};

export type UpdateCashierInput = {
  username?: string;
  email?: string;
  password?: string;
  displayName?: string;
};

export async function updateOwnerAccount(input: UpdateOwnerInput): Promise<OwnerAccountSettings> {
  const settings = await readStoreSettings();
  if (input.email) settings.owner.email = input.email.trim().toLowerCase();
  if (input.displayName) settings.owner.displayName = input.displayName.trim();
  if (input.password) settings.owner.passwordHash = hashPassword(input.password);
  await writeStoreSettings(settings);
  return settings.owner;
}

export async function updateCashierAccount(
  input: UpdateCashierInput
): Promise<CashierAccountSettings> {
  const settings = await readStoreSettings();
  if (input.username) settings.cashier.username = input.username.trim();
  if (input.email) settings.cashier.email = input.email.trim().toLowerCase();
  if (input.displayName) settings.cashier.displayName = input.displayName.trim();
  if (input.password) settings.cashier.passwordHash = hashPassword(input.password);
  await writeStoreSettings(settings);
  return settings.cashier;
}

export async function updateCashierSelf(
  currentPassword: string,
  input: UpdateCashierInput
): Promise<CashierAccountSettings | "invalid_password"> {
  const settings = await readStoreSettings();
  if (!verifyPassword(currentPassword, settings.cashier.passwordHash)) {
    return "invalid_password";
  }
  if (input.email) settings.cashier.email = input.email.trim().toLowerCase();
  if (input.displayName) settings.cashier.displayName = input.displayName.trim();
  if (input.password) settings.cashier.passwordHash = hashPassword(input.password);
  await writeStoreSettings(settings);
  return settings.cashier;
}

export async function updateNotificationSettings(
  patch: Partial<StoreNotificationSettings>
): Promise<StoreNotificationSettings> {
  const settings = await readStoreSettings();
  settings.notifications = { ...settings.notifications, ...patch };
  await writeStoreSettings(settings);
  return settings.notifications;
}
