/**
 * QR login ("Đăng nhập bằng mã QR") — thiết kế: docs/web-qr-login-design.md bên
 * Mindo-API.
 *
 * `createHttpQrAuthService` là bản thật: tạo mã qua BFF `/api/auth/qr`, rồi cứ
 * 2 giây hỏi `/api/auth/qr/poll`. Khoá để đổi mã lấy token nằm trong cookie
 * httpOnly bên BFF, và khi điện thoại duyệt thì BFF tự đặt cookie đăng nhập —
 * trang này không bao giờ cầm token.
 *
 * `createMockQrAuthService` chỉ còn phục vụ `?qrDemo=…` để xem trước từng
 * trạng thái Figma.
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
  /**
   * Ô "Ghi nhớ đăng nhập". Chỉ bản thật dùng; giá trị được đọc ở MỖI lần hỏi
   * nên đổi sau khi quét vẫn được tính tại đúng lúc nhận phiên.
   */
  setRemember?(value: boolean): void
}

/** Nhịp hỏi trạng thái — đủ nhanh để vô hình, vì sau khi quét người dùng còn phải bấm xác nhận */
const POLL_MS = 2_000

const FINAL: readonly QrStatus[] = ["approved", "rejected", "expired"]

type Envelope<T> = { data?: T }

/**
 * Bản thật. Giữ giá trị ô "Ghi nhớ đăng nhập" trong chính nó (`setRemember`)
 * thay vì nhận một `ref` từ component: đổi ô không phải tạo lại dịch vụ — tạo
 * lại là tạo luôn một mã QR mới.
 */
export function createHttpQrAuthService(): QrAuthService {
  let remember = false
  return {
    createsRealSession: true,

    setRemember(value) {
      remember = value
    },

    async createSession() {
      const res = await fetch("/api/auth/qr", { method: "POST" })
      if (!res.ok) throw new Error(`Không tạo được mã QR (${res.status})`)
      const json = (await res.json()) as Envelope<{
        session_id: string
        qr_value: string
        expires_at: string
      }>
      if (!json.data) throw new Error("Không tạo được mã QR")
      return {
        sessionId: json.data.session_id,
        qrValue: json.data.qr_value,
        expiresAt: Date.parse(json.data.expires_at),
      }
    },

    subscribe(session, onStatus) {
      let stopped = false
      let last: QrStatus = "pending"

      const emit = (status: QrStatus) => {
        if (stopped || status === last) return
        last = status
        onStatus(status)
        if (FINAL.includes(status)) stop()
      }

      const tick = async () => {
        if (stopped) return
        /* Mốc hết hạn phía trình duyệt, phòng mất mạng. Chỉ áp khi CHƯA quét:
           quét rồi thì server đã nới hạn thêm 60 giây, còn `expiresAt` ở đây
           vẫn là mốc cũ. */
        if (last === "pending" && Date.now() >= session.expiresAt) {
          emit("expired")
          return
        }
        try {
          const res = await fetch("/api/auth/qr/poll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: session.sessionId, remember }),
          })
          const json = (await res.json().catch(() => ({}))) as Envelope<{ status?: QrStatus }>
          const status = json.data?.status
          if (status) emit(status)
        } catch {
          /* Mất mạng: bỏ qua, thử lại ở nhịp sau */
        }
      }

      const timer = window.setInterval(() => void tick(), POLL_MS)
      function stop() {
        stopped = true
        window.clearInterval(timer)
      }
      void tick()
      return stop
    },
  }
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
