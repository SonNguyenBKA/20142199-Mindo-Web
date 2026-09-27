import { NextResponse, type NextRequest } from "next/server"

import {
  REFRESH_COOKIE,
  REMEMBER_COOKIE,
  clearSessionCookies,
  refreshSession,
  setSessionCookies,
} from "@/lib/server/session"

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  const tokens = refreshToken ? await refreshSession(refreshToken) : null

  if (!tokens) {
    const res = NextResponse.json(
      { code: "AUTH_REFRESH_INVALID", message: "Phiên đăng nhập đã hết hạn." },
      { status: 401 }
    )
    clearSessionCookies(res)
    return res
  }

  const res = NextResponse.json({
    code: 200,
    data: { user: tokens.user },
    message: "Thành công",
  })
  setSessionCookies(
    res,
    tokens,
    request.cookies.get(REMEMBER_COOKIE)?.value === "1"
  )
  return res
}
