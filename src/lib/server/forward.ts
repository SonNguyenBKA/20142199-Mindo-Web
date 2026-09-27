import "server-only"

import { NextResponse, type NextRequest } from "next/server"

import {
  ACCESS_COOKIE,
  API_URL,
  REFRESH_COOKIE,
  REMEMBER_COOKIE,
  clearSessionCookies,
  isAccessTokenValid,
  refreshSession,
  setSessionCookies,
} from "@/lib/server/session"
import type { TokenPair } from "@/types/auth"

const PASS_HEADERS = ["content-type", "content-disposition", "cache-control"]

export type ForwardMethod = "GET" | "POST" | "PATCH" | "DELETE"

/**
 * Forwards an authenticated request to Mindo-API using the session cookies.
 * Refreshes the access token when expired / rejected and rotates cookies.
 * Request bodies (JSON or multipart) are passed through as raw bytes with
 * their content-type; non-JSON responses (e.g. receipt downloads) are
 * streamed back unchanged.
 */
export async function forwardWithSession(
  request: NextRequest,
  backendPath: string,
  method: ForwardMethod = "GET"
): Promise<NextResponse> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  const refresh = () =>
    refreshToken ? refreshSession(refreshToken) : Promise.resolve(null)

  const url = `${API_URL}${backendPath}${request.nextUrl.search}`
  // Read once so the body can be replayed after a token refresh.
  const raw = method === "GET" ? null : await request.arrayBuffer()
  const body = raw && raw.byteLength > 0 ? raw : undefined
  const contentType = request.headers.get("content-type")
  const call = (token: string | undefined) =>
    token
      ? fetch(url, {
          method,
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            ...(body && contentType ? { "Content-Type": contentType } : {}),
          },
          body,
        }).catch(() => null)
      : Promise.resolve(null)

  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  let rotated: TokenPair | null = isAccessTokenValid(accessToken)
    ? null
    : await refresh()
  if (rotated) accessToken = rotated.access_token

  let res = await call(accessToken)
  if (res?.status === 401 && !rotated) {
    rotated = await refresh()
    res = await call(rotated?.access_token)
  }

  if (!accessToken && !rotated) return unauthorized()
  if (!res) {
    return NextResponse.json(
      { code: "NETWORK_ERROR", message: "Không thể kết nối máy chủ. Vui lòng thử lại sau." },
      { status: 503 }
    )
  }
  if (res.status === 401) return unauthorized()

  const headers = new Headers()
  for (const name of PASS_HEADERS) {
    const value = res.headers.get(name)
    if (value) headers.set(name, value)
  }
  const out = new NextResponse(res.body, { status: res.status, headers })
  if (rotated) {
    setSessionCookies(out, rotated, request.cookies.get(REMEMBER_COOKIE)?.value === "1")
  }
  return out
}

function unauthorized() {
  const res = NextResponse.json(
    { message: "Phiên đăng nhập đã hết hạn." },
    { status: 401 }
  )
  clearSessionCookies(res)
  return res
}
