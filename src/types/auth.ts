export type UserRole = "owner" | "cashier";

export type AuthUser = {
  id: string;
  name: string;
  role: UserRole;
};
