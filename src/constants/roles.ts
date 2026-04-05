/**
 * Application role enum (backend `User.roles`). See integration guide §8.1.
 * Self-signup defaults to CASHIER unless an admin changes it.
 */
export const APP_ROLES = [
  "ADMIN",
  "FINANCE",
  "SALES",
  "CASHIER",
  "PRODUCTION",
  "STORE_KEEPER",
  "QUALITY_CONTROL",
  "PURCHASER",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const DEFAULT_SIGNUP_ROLE: AppRole = "CASHIER";
