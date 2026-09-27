/**
 * QR login ("Đăng nhập bằng mã QR").
 *
 * Mindo-API has no QR endpoints yet, so this ships a client-side MOCK behind a
 * stable interface. When the BE is ready, implement `QrAuthService` with real
 * calls (create session → poll/SSE status → on approval hit a BFF route that
 * sets the session cookies) and swap `qrAuthService` below.
 */

export type QrStatus = "pending" | "scanned" | "approved" | "rejected" | "expired"

export type QrSession = {
  sessionId: string
  /** Payload encoded in the QR image (scanned by the Mindo mobile app). */
  qrValue: string
  /** Epoch ms when the code stops being valid. */
  expiresAt: number
}

export interface QrAuthService {
  createSession(): Promise<QrSession>
  /** Streams status changes; returns an unsubscribe function. */
  subscribe(session: QrSession, onStatus: (status: QrStatus) => void): () => void
  /** True when an `approved` status also created a real web session (cookies). */
  readonly createsRealSession: boolean
}

export type QrDemoScenario = "scanned" | "approved" | "rejected" | "expired"

const QR_TTL_MS = 60_000
const STEP_MS = 3_000

/**
 * Mock implementation. Without a demo scenario the code simply waits and
 * expires after 60s. `?qrDemo=scanned|approved|rejected|expired` on /login
 * plays the corresponding flow so every Figma state can be previewed.
 */
export function createMockQrAuthService(demo?: QrDemoScenario | null): QrAuthService {
  return {
    createsRealSession: false,

    async createSession() {
      const sessionId = crypto.randomUUID()
      return {
        sessionId,
        qrValue: `mindo://web-login?session=${sessionId}`,
        expiresAt: Date.now() + QR_TTL_MS,
      }
    },

    subscribe(session, onStatus) {
      const timers: number[] = []
      const at = (ms: number, status: QrStatus) =>
        timers.push(window.setTimeout(() => onStatus(status), ms))

      switch (demo) {
        case "expired":
          at(STEP_MS, "expired")
          break
        case "scanned":
          at(STEP_MS, "scanned")
          break
        case "approved":
          at(STEP_MS, "scanned")
          at(STEP_MS * 2, "approved")
          break
        case "rejected":
          at(STEP_MS, "scanned")
          at(STEP_MS * 2, "rejected")
          break
        default:
          at(Math.max(0, session.expiresAt - Date.now()), "expired")
      }

      return () => timers.forEach((t) => window.clearTimeout(t))
    },
  }
}

export function parseQrDemo(value: string | null): QrDemoScenario | null {
  return value === "scanned" ||
    value === "approved" ||
    value === "rejected" ||
    value === "expired"
    ? value
    : null
}
