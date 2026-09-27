import type { ReferralCommission } from "@/types/peer"

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

/** Distinct months present, newest first. */
export const monthsOf = (rows: ReferralCommission[]) =>
  [...new Set(rows.map((r) => monthKey(r.createdAt)))].sort().reverse()

export const sumVnd = (rows: ReferralCommission[]) =>
  rows.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + Number(r.amountVnd), 0)

export const ratePercent = (rate: string) => `${Math.round(Number(rate) * 1000) / 10}%`

export const COMMISSION_TYPE: Record<ReferralCommission["type"], string> = {
  DIRECT: "Giới thiệu trực tiếp",
  BRANCH: "Hoa hồng nhánh",
}

/** "21/09" */
export function dayMonth(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", { timeZone: VN_TZ, day: "2-digit", month: "2-digit" }).format(new Date(iso))
}
