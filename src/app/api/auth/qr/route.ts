import { NextResponse, type NextRequest } from "next/server"

import { backendFetch } from "@/lib/server/backend"
import { browserHeaders, setQrCookie } from "@/lib/server/qr-login"

type QrCreated = {
  session_id: string
  secret: string
  qr_value: string
  expires_at: string
}

/** Tạo mã QR đăng nhập. Trình duyệt nhận id + nội dung QR; KHOÁ ở lại trong cookie. */
export async function POST(request: NextRequest) {
  const result = await backendFetch<QrCreated>("/investor/auth/qr", {
    method: "POST",
    body: { device_info: request.headers.get("user-agent")?.slice(0, 255) },
    headers: browserHeaders(request),
  })

  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status })
  }

  const { secret, ...publicPart } = result.body.data
  const res = NextResponse.json({ ...result.body, data: publicPart })
  setQrCookie(res, publicPart.session_id, secret)
  return res
}
