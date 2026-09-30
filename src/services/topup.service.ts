/**
 * Top-up ("Nạp tiền") service.
 *
 * - create      → POST /investor/deposits { amount_vnd } + Idempotency-Key (one key per "Tiếp tục")
 * - getStatus   → poll GET /investor/history/deposits/:id every ~3s (no websocket)
 * - cancel      → POST /investor/deposits/:id/cancel; money that still arrives is credited by the BE
 * - QR expiry   → `expires_at` from the BE (VIETQR_QR_TTL_MINUTES, 5–60 minutes)
 *
 * `createMockTopupService` stays for `?demo=` in development.
 */

import { api } from "@/lib/axios"
import { ApiError } from "@/lib/api-error"
import { depositService } from "@/services/deposit.service"
import type { ApiEnvelope } from "@/types/auth"

export type TopupStatus = "pending" | "completed" | "failed" | "cancelled"

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
  /** How long the QR lives in total, for the progress bar. */
  ttlSeconds: number
}

export type TopupResult = {
  status: TopupStatus
  paidAt?: string
  balanceAfter?: number
}

/** What happened on cancel: cancelled, or the money had already landed (keep polling). */
export type CancelOutcome = "cancelled" | "already-settled"

export interface TopupService {
  /** `key` makes a double click create one deposit, not two. */
  create(amount: number, key: string): Promise<TopupOrder>
  getStatus(order: TopupOrder): Promise<TopupResult>
  /** Marks that the user says they transferred (the BE reconciles on its own). */
  markTransferred(order: TopupOrder): Promise<void>
  cancel(order: TopupOrder): Promise<CancelOutcome>
}

export const QR_TTL_SECONDS = 15 * 60

/** `POST /investor/deposits` — the raw Deposit row plus VietQR and expiry. */
type DepositCreated = {
  id: string
  transferCode: string
  amountVnd: string
  createdAt: string
  expires_at: string | null
  vietqr: {
    bank_name: string
    bank_account: string
    user_bank_name: string
    content: string
    amount: number
    qr_code: string
  }
}

export function createVietQrTopupService(): TopupService {
  return {
    async create(amount, key) {
      const res = await api.post<ApiEnvelope<DepositCreated>>(
        "/bff/deposits",
        { amount_vnd: String(amount) },
        { headers: { "Idempotency-Key": key } }
      )
      const d = res.data.data
      const createdAt = Date.parse(d.createdAt)
      const expiresAt = d.expires_at ? Date.parse(d.expires_at) : createdAt + QR_TTL_SECONDS * 1000
      return {
        id: d.id,
        code: d.transferCode,
        amount: Number(d.amountVnd),
        bankName: d.vietqr.bank_name,
        accountNumber: d.vietqr.bank_account,
        accountName: d.vietqr.user_bank_name,
        transferContent: d.vietqr.content,
        qrValue: d.vietqr.qr_code,
        // Quick-link mode returns an img.vietqr.io URL; API mode returns the EMV payload.
        qrIsImage: /^https?:\/\//.test(d.vietqr.qr_code),
        createdAt: d.createdAt,
        expiresAt,
        ttlSeconds: Math.max(1, Math.round((expiresAt - createdAt) / 1000)),
      }
    },

    async getStatus(order) {
      const d = await depositService.detail(order.id)
      if (d.status === "completed") {
        const after = d.wallet_credit.balance_after_vnd
        return { status: "completed", paidAt: d.occurred_at, balanceAfter: after ? Number(after) : undefined }
      }
      return { status: d.status }
    },

    async markTransferred() {},

    async cancel(order) {
      try {
        await api.post(`/bff/deposits/${encodeURIComponent(order.id)}/cancel`)
        return "cancelled"
      } catch (error) {
        // 409: paid in the meantime — the next poll shows the success screen.
        if (error instanceof ApiError && error.status === 409) return "already-settled"
        throw error
      }
    },
  }
}

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
        ttlSeconds: opts.demo === "expired" ? 10 : QR_TTL_SECONDS,
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
      return "cancelled"
    },
  }
}
