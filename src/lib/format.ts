const VN_TZ = "Asia/Ho_Chi_Minh"

/** "185000000" → "185.000.000đ". Works on decimal strings of any size. */
export function formatVnd(value: string | number | null | undefined, sign?: "+") {
  if (value === null || value === undefined || value === "") return "—"
  const raw = String(value).trim()
  const negative = raw.startsWith("-")
  const digits = raw.replace(/^[-+]/, "").split(".")[0].replace(/\D/g, "") || "0"
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${negative ? "-" : sign ?? ""}${grouped}đ`
}

const dateParts = (iso: string) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: VN_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return { d: get("day"), m: get("month"), y: get("year"), h: get("hour"), min: get("minute") }
}

/** ISO → "15/01/2025 · 16:40" (Vietnam time). */
export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—"
  const { d, m, y, h, min } = dateParts(iso)
  return `${d}/${m}/${y} · ${h}:${min}`
}

/** Epoch ms or ISO → "15/03/2026" (Vietnam time). */
export function formatDate(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—"
  const { d, m, y } = dateParts(new Date(value).toISOString())
  return `${d}/${m}/${y}`
}

/** "2025-01-31" → "31/01/2025" */
export function formatDateInput(value: string | undefined) {
  if (!value) return ""
  const [y, m, d] = value.split("-")
  return `${d}/${m}/${y}`
}

/** Initials for an avatar fallback: "Trần Ngọc Nam" → "TN". */
export function initials(name: string | null | undefined) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ""
  return (first + last).toUpperCase()
}
