/**
 * Top-up ("Nạp tiền") service — UI-only MOCK for now.
 *
 * Mapping to Mindo-API when wiring the real thing:
 * - create      → POST /investor/deposits { amount_vnd } (+ Idempotency-Key header)
 *                 bank info / qr come from `data.vietqr` { bank_name, bank_account,
 *                 user_bank_name, content, amount, qr_code (image URL or EMV payload) }
 * - getStatus   → poll GET /investor/history/deposits/:id every ~3s (no websocket)
 * - cancel      → no BE endpoint yet
 * - QR expiry   → BE has none; the 15-minute window is UI-only.
 */

export type TopupStatus = "pending" | "completed" | "failed"

export type TopupOrder = {
  id: string
  /** Short reference shown to the user, e.g. "TN8842". */
  code: string
  amount: number
  bankName: string
  accountNumber: string
  accountName: string
  transferContent: string
  /** Value encoded in the QR (EMV payload) — or an image URL when `qrIsImage`. */
  qrValue: string
  qrIsImage: boolean
  createdAt: string
  /** Epoch ms when the QR stops being valid. */
  expiresAt: number
}

export type TopupResult = {
  status: TopupStatus
  paidAt?: string
  balanceAfter?: number
}

export interface TopupService {
  create(amount: number): Promise<TopupOrder>
  getStatus(order: TopupOrder): Promise<TopupResult>
  /** Marks that the user says they transferred (mock uses it to start "reconciling"). */
  markTransferred(order: TopupOrder): Promise<void>
  cancel(order: TopupOrder): Promise<void>
}

export const QR_TTL_SECONDS = 15 * 60

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Mock: settles ~5s after "Tôi đã chuyển khoản".
 * `?demo=expired` → QR expires after 10s; `?demo=failed` → reconciliation fails.
 */
export function createMockTopupService(opts: {
  demo?: string | null
  balance?: number
}): TopupService {
  const transferredAt = new Map<string, number>()

  return {
    async create(amount) {
      await sleep(600)
      const code = `TN${Math.floor(1000 + Math.random() * 9000)}`
      const content = `MINDO NAP ${code}`
      return {
        id: crypto.randomUUID(),
        code,
        amount,
        bankName: "Vietcombank — CN Hà Nội",
        accountNumber: "0011 0042 8899",
        accountName: "CONG TY CO PHAN MINDO",
        transferContent: content,
        qrValue: `mindo-topup|970436|001100428899|${amount}|${content}`,
        qrIsImage: false,
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + (opts.demo === "expired" ? 10 : QR_TTL_SECONDS) * 1000,
      }
    },

    async markTransferred(order) {
      transferredAt.set(order.id, Date.now())
    },

    async getStatus(order) {
      await sleep(200)
      const at = transferredAt.get(order.id)
      if (!at || Date.now() - at < 5000) return { status: "pending" }
      if (opts.demo === "failed") return { status: "failed" }
      return {
        status: "completed",
        paidAt: new Date().toISOString(),
        balanceAfter: (opts.balance ?? 0) + order.amount,
      }
    },

    async cancel() {
      await sleep(300)
    },
  }
}
