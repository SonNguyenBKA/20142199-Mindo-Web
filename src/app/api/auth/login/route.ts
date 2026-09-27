import { NextResponse, type NextRequest } from "next/server"

import { backendFetch } from "@/lib/server/backend"
import { setSessionCookies } from "@/lib/server/session"
import type { LoginRequest, TokenPair } from "@/types/auth"

export async function POST(request: NextRequest) {
  const input = (await request.json().catch(() => ({}))) as Partial<LoginRequest>
  const remember = input.remember_me === true

  const result = await backendFetch<TokenPair>("/investor/auth/login/email", {
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
      remember_me: remember,
      device_type: "desktop",
      device_info: request.headers.get("user-agent")?.slice(0, 255) ?? "web",
    },
  })

  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status })
  }

  const { user, ...tokens } = result.body.data
  const res = NextResponse.json({ ...result.body, data: { user } })
  setSessionCookies(res, tokens, remember)
  return res
}
