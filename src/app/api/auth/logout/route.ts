import { NextResponse, type NextRequest } from "next/server"

import { backendFetch } from "@/lib/server/backend"
import { ACCESS_COOKIE, clearSessionCookies } from "@/lib/server/session"

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value
  if (token) {
    // Best effort: the session is cleared locally regardless of the BE result.
    await backendFetch("/investor/auth/logout", { method: "POST", token })
  }

  const res = NextResponse.json({
    code: 200,
    data: { logged_out: true },
    message: "Thành công",
  })
  clearSessionCookies(res)
  return res
}
