// Plain route constants (no React/icon imports) so proxy.ts stays lightweight.

/** Where users land after login / when hitting "/". */
export const HOME_PATH = "/lich-su-nap"

export const ACCOUNT_PATH = "/tai-khoan"

export const AGENCY_APPLY_PATH = "/dang-ky-dai-ly"

/** App sections that require a session. */
export const APP_PATHS = [
  "/nap-tien",
  "/lich-su-nap",
  "/peer",
  "/lich-su-peer",
  ACCOUNT_PATH,
  AGENCY_APPLY_PATH,
] as const

export const AUTH_PATHS = ["/login", "/register", "/verify-email", "/forgot-password"] as const
