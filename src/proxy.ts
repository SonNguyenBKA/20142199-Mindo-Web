import { NextResponse, type NextRequest } from "next/server"

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REMEMBER_COOKIE,
  clearSessionCookies,
  isAccessTokenValid,
  refreshSession,
  setSessionCookies,
} from "@/lib/server/session"
import { APP_PATHS, AUTH_PATHS, HOME_PATH } from "@/lib/routes"


const matches = (pathname: string, prefixes: readonly string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const hasValidAccess = isAccessTokenValid(accessToken)

  // Logged-in users don't need the auth screens.
  if (matches(pathname, AUTH_PATHS)) {
    return hasValidAccess
      ? NextResponse.redirect(new URL(HOME_PATH, request.url))
      : NextResponse.next()
  }

  if (!matches(pathname, APP_PATHS) || hasValidAccess) {
    return NextResponse.next()
  }

  // Access token missing/expired → try a silent refresh before bouncing to login.
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  const tokens = refreshToken ? await refreshSession(refreshToken) : null

  if (!tokens) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", `${pathname}${search}`)
    const res = NextResponse.redirect(loginUrl)
    clearSessionCookies(res)
    return res
  }

  // Forward the fresh token to this request so server components see it.
  request.cookies.set(ACCESS_COOKIE, tokens.access_token)
  request.cookies.set(REFRESH_COOKIE, tokens.refresh_token)
  const res = NextResponse.next({ request: { headers: request.headers } })
  setSessionCookies(
    res,
    tokens,
    request.cookies.get(REMEMBER_COOKIE)?.value === "1"
  )
  return res
}

export const config = {
  matcher: [
    "/nap-tien/:path*",
    "/lich-su-nap/:path*",
    "/peer/:path*",
    "/lich-su-peer/:path*",
    "/tai-khoan/:path*",
    "/dang-ky-dai-ly/:path*",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
  ],
}
