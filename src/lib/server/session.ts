import type { NextResponse } from "next/server"

import type { TokenPair } from "@/types/auth"

// Edge-safe (used from proxy.ts): no Node-only imports here.

export const ACCESS_COOKIE = "mindo_at"
export const REFRESH_COOKIE = "mindo_rt"
/** "1" when the user ticked "Ghi nhớ đăng nhập" – keeps refresh cookie persistent across rotations. */
export const REMEMBER_COOKIE = "mindo_rm"

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30d, matches JWT_REFRESH_TTL
const DEFAULT_ACCESS_MAX_AGE = 60 * 15 // 15m, matches JWT_ACCESS_TTL

export const API_URL = (process.env.API_URL ?? "http://localhost:4000/api/v1").replace(
  /\/+$/,
  ""
)

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

/** Reads the `exp` claim (seconds) of a JWT without verifying it. */
export function getJwtExp(token: string | undefined): number | undefined {
  if (!token) return undefined
  try {
    const payload = token.split(".")[1]
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number }
    return json.exp
  } catch {
    return undefined
  }
}

/** True when the access token exists and is not expiring in the next 10s. */
export function isAccessTokenValid(token: string | undefined) {
  const exp = getJwtExp(token)
  return !!exp && exp * 1000 > Date.now() + 10_000
}

export function setSessionCookies(
  res: NextResponse,
  tokens: Pick<TokenPair, "access_token" | "refresh_token">,
  remember: boolean
) {
  const exp = getJwtExp(tokens.access_token)
  const accessMaxAge = exp
    ? Math.max(0, exp - Math.floor(Date.now() / 1000))
    : DEFAULT_ACCESS_MAX_AGE

  res.cookies.set(ACCESS_COOKIE, tokens.access_token, {
    ...baseCookie,
    maxAge: accessMaxAge,
  })
  res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
    ...baseCookie,
    ...(remember && { maxAge: REFRESH_MAX_AGE }),
  })
  res.cookies.set(REMEMBER_COOKIE, remember ? "1" : "0", {
    ...baseCookie,
    ...(remember && { maxAge: REFRESH_MAX_AGE }),
  })
}

export function clearSessionCookies(res: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, REMEMBER_COOKIE]) {
    res.cookies.set(name, "", { ...baseCookie, maxAge: 0 })
  }
}

/** Exchanges a refresh token for a new pair. Returns null when the session is gone. */
export async function refreshSession(
  refreshToken: string
): Promise<TokenPair | null> {
  try {
    const res = await fetch(`${API_URL}/investor/auth/refresh-token`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: TokenPair }
    return json.data?.access_token ? json.data : null
  } catch {
    return null
  }
}
