import { NextResponse, type NextRequest } from "next/server"

import { backendFetch } from "@/lib/server/backend"
import { browserHeaders, clearQrCookie, readQrCookie } from "@/lib/server/qr-login"
import { setSessionCookies } from "@/lib/server/session"
import type { TokenPair } from "@/types/auth"

type PollResult =
  | { status: "pending" | "scanned" | "rejected" | "expired" }
  | ({ status: "approved" } & TokenPair)

const status = (value: string) => NextResponse.json({ data: { status: value } })

/**
 * Hỏi trạng thái mã QR — trình duyệt gọi mỗi 2 giây.
 *
 * Khi điện thoại đã duyệt, route này đặt cookie đăng nhập bằng ĐÚNG hàm của tab
 * Mật khẩu (`setSessionCookies`) rồi chỉ trả `status: "approved"` — token không
 * bao giờ xuống trình duyệt. `remember` đọc ngay lúc này chứ không phải lúc tạo
 * mã, nên đổi ý ô "Ghi nhớ đăng nhập" sau khi quét vẫn được tính.
 */
export async function POST(request: NextRequest) {
  const input = (await request.json().catch(() => ({}))) as {
    session_id?: string
    remember?: boolean
  }
  const held = readQrCookie(request)

  /* Không có khoá, hoặc khoá của một mã khác (tab khác đã tạo mã mới hơn) */
  if (!held || held.sessionId !== input.session_id) return status("expired")

  const result = await backendFetch<PollResult>(
    `/investor/auth/qr/${held.sessionId}/poll`,
    { method: "POST", body: { secret: held.secret }, headers: browserHeaders(request) }
  )

  if (!result.ok) {
    if (result.status === 404) {
      const res = status("expired")
      clearQrCookie(res)
      return res
    }
    /* Lỗi mạng / máy chủ: chuyển nguyên, trình duyệt thử lại ở nhịp sau */
    return NextResponse.json(result.body, { status: result.status })
  }

  const data = result.body.data
  if (data.status !== "approved") {
    const res = status(data.status)
    if (data.status === "rejected" || data.status === "expired") clearQrCookie(res)
    return res
  }

  const res = NextResponse.json({ data: { status: "approved", user: data.user } })
  setSessionCookies(res, data, input.remember === true)
  clearQrCookie(res)
  return res
}
