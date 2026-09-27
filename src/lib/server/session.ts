import type { NextResponse } from "next/server"

import type { TokenPair } from "@/types/auth"

// Edge-safe (used from proxy.ts): no Node-only imports here.

export const ACCESS_COOKIE = "mindo_at"
export const REFRESH_COOKIE = "mindo_rt"
/**
 * "Ghi nhớ đăng nhập": the absolute deadline (epoch seconds) until which the
 * browser stays signed in, or "0" when the box was not ticked (session cookies
 * that die with the browser).
 *
 * A deadline rather than a flag because the session cookies are re-set on
 * every token rotation (every ~15 min of use). A plain `maxAge` would restart
 * the clock each time and keep an active browser signed in forever; the
 * deadline makes 7 days a hard cap counted from sign-in.
 */
export const REMEMBER_COOKIE = "mindo_rm"

/** Remember me keeps the browser signed in for at most 7 days from sign-in. */
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 7
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

/**
 * What a token rotation should keep: the deadline stored at sign-in, or
 * `false` when the user did not tick remember me.
 */
export function rememberFromCookie(value: string | undefined): number | false {
  const deadline = Number(value)
  if (Number.isFinite(deadline) && deadline > 1) return deadline
  // "1" was the old flag format: start a fresh 7-day window once, after which
  // the cookie holds a deadline and stops sliding.
  if (value === "1") return nowSeconds() + REMEMBER_MAX_AGE
  return false
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

/**
 * @param remember `true` at sign-in (starts the 7-day window), a deadline from
 *   `rememberFromCookie` on rotation, or `false` for browser-session cookies.
 */
export function setSessionCookies(
  res: NextResponse,
  tokens: Pick<TokenPair, "access_token" | "refresh_token">,
  remember: boolean | number
) {
  const now = nowSeconds()
  const deadline =
    remember === true ? now + REMEMBER_MAX_AGE : remember || undefined
  const rememberMaxAge =
    deadline === undefined ? undefined : Math.max(0, deadline - now)

  const exp = getJwtExp(tokens.access_token)
  const accessMaxAge = Math.min(
    exp ? Math.max(0, exp - now) : DEFAULT_ACCESS_MAX_AGE,
    rememberMaxAge ?? Infinity
  )

  res.cookies.set(ACCESS_COOKIE, tokens.access_token, {
    ...baseCookie,
    maxAge: accessMaxAge,
  })
  res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
    ...baseCookie,
    ...(rememberMaxAge !== undefined && { maxAge: rememberMaxAge }),
  })
  res.cookies.set(REMEMBER_COOKIE, deadline ? String(deadline) : "0", {
    ...baseCookie,
    ...(rememberMaxAge !== undefined && { maxAge: rememberMaxAge }),
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
