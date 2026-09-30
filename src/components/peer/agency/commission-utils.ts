import { ApiError } from "@/lib/api-error"
import type { Commission } from "@/types/peer"

const VN_TZ = "Asia/Ho_Chi_Minh"

/** "2026-09" in Vietnam time. */
export function monthKey(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: VN_TZ, year: "numeric", month: "2-digit" }).formatToParts(
    new Date(iso)
  )
  const get = (t: string) => parts.find((p) => p.type === t)?.value
  return `${get("year")}-${get("month")}`
}

/** "2026-09" → "Tháng 9/2026" */
export const monthLabel = (key: string) => {
  const [y, m] = key.split("-")
  return `Tháng ${Number(m)}/${y}`
}

/** The last `count` months in Vietnam time, newest first. */
export function recentMonths(count = 12, now = new Date()) {
  const [y, m] = monthKey(now.toISOString()).split("-").map(Number)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - i, 1))
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
  })
}

/**
 * "2026-09" → the whole month in Vietnam time as ISO instants. The BE reads a
 * bare date as UTC, so send exact instants to keep 00:00–07:00 VN on the right day.
 */
export function monthRange(key: string) {
  const [y, m] = key.split("-").map(Number)
  const from = new Date(Date.UTC(y, m - 1, 1) - 7 * 3600_000)
  const to = new Date(Date.UTC(y, m, 1) - 7 * 3600_000 - 1)
  return { from: from.toISOString(), to: to.toISOString() }
}

/** "01/09 – 30/09" for a month key. */
export function monthSpan(key: string) {
  const [y, m] = key.split("-").map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const mm = String(m).padStart(2, "0")
  return `01/${mm} – ${last}/${mm}`
}

export const COMMISSION_TYPE: Record<Commission["type"], string> = {
  direct: "Giới thiệu trực tiếp",
  branch: "Hoa hồng nhánh",
}

/** USD of a VND amount at the rate the BE used. */
export const usdOf = (vnd: string | number, rate: string | number) => Number(vnd) / Number(rate)

/** "21/09" */
export function dayMonth(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", { timeZone: VN_TZ, day: "2-digit", month: "2-digit" }).format(new Date(iso))
}

/** `branch-sales` answers 403 to anyone who is not a branch root. */
export const isForbidden = (error: unknown) => error instanceof ApiError && error.status === 403
