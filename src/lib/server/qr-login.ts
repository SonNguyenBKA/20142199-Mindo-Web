import type { NextRequest, NextResponse } from "next/server"

/**
 * Cookie giữ khoá của mã QR đang chờ — xem docs/web-qr-login-design.md bên
 * Mindo-API.
 *
 * Mã QR chỉ in `session_id`. Muốn đổi yêu cầu đã được duyệt lấy token phải có
 * thêm KHOÁ mà API trả lúc tạo mã; khoá nằm ở đây, httpOnly, nên JS của trang
 * và người chụp lén màn hình đều không thấy. `path` chỉ mở cho hai route QR.
 *
 * Chỉ giữ mã MỚI NHẤT: mở hai tab QR thì tab cũ tự báo hết hạn và có nút "Tạo
 * mã mới" — giới hạn đã chấp nhận trong spec.
 */
export const QR_COOKIE = "mindo_qr"

const qrCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth/qr",
}

/** Khoá sống lâu hơn mã một chút: mã 60 giây, quét thì API cộng thêm 60 */
const QR_COOKIE_MAX_AGE = 180

export function setQrCookie(res: NextResponse, sessionId: string, secret: string) {
  res.cookies.set(QR_COOKIE, `${sessionId}.${secret}`, {
    ...qrCookie,
    maxAge: QR_COOKIE_MAX_AGE,
  })
}

export function clearQrCookie(res: NextResponse) {
  res.cookies.set(QR_COOKIE, "", { ...qrCookie, maxAge: 0 })
}

/** `null` nếu không có cookie hoặc cookie hỏng. UUID và base64url đều không chứa dấu chấm. */
export function readQrCookie(request: NextRequest) {
  const [sessionId, secret] = (request.cookies.get(QR_COOKIE)?.value ?? "").split(".")
  return sessionId && secret ? { sessionId, secret } : null
}

/**
 * User-agent và IP của TRÌNH DUYỆT, chuyển tiếp cho API.
 *
 * API chạy sau BFF nên tự nó chỉ thấy máy chủ Next. Hai thứ này hiện lên màn
 * xác nhận của điện thoại ("Chrome trên macOS · <IP>") để người dùng nhận ra
 * máy mình trước khi bấm Đăng nhập. API tin một chặng proxy (`trust proxy 1`).
 */
export function browserHeaders(request: NextRequest): HeadersInit {
  const userAgent = request.headers.get("user-agent")
  const forwardedFor = request.headers.get("x-forwarded-for")
  return {
    ...(userAgent && { "User-Agent": userAgent }),
    ...(forwardedFor && { "X-Forwarded-For": forwardedFor }),
  }
}
