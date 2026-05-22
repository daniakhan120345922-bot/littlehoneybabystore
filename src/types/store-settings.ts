export type StoreNotificationSettings = {
  notifyOwnerOnCashierLogin: boolean;
  lowStockAlert: boolean;
  soundOnScan: boolean;
};

export type OwnerAccountSettings = {
  email: string;
  passwordHash: string;
  displayName: string;
};

export type CashierAccountSettings = {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
};

export type ActivityLogEntry = {
  id: string;
  type: "cashier_login" | "settings_updated";
  message: string;
  at: string;
  read: boolean;
};

export type StoreSettings = {
  owner: OwnerAccountSettings;
  cashier: CashierAccountSettings;
  notifications: StoreNotificationSettings;
  activityLog: ActivityLogEntry[];
};

export type PublicOwnerSettings = {
  email: string;
  displayName: string;
};

export type PublicCashierSettings = {
  username: string;
  email: string;
  displayName: string;
};

export type SettingsApiResponse = {
  success: true;
  owner: PublicOwnerSettings;
  cashier: PublicCashierSettings;
  notifications: StoreNotificationSettings;
  activityLog: ActivityLogEntry[];
  unreadCount: number;
};
