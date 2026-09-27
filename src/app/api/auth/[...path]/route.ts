import { NextResponse, type NextRequest } from "next/server"

import { backendFetch } from "@/lib/server/backend"

/** Public (token-less) auth endpoints the browser may reach through the BFF. */
const PASS_THROUGH = new Set([
  "register",
  "register/otp",
  "verify-account",
  "forgot-password",
  "forgot-password/verify-otp",
  "reset-password",
])

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/auth/[...path]">
) {
  const { path } = await ctx.params
  const endpoint = path.join("/")

  if (!PASS_THROUGH.has(endpoint)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  const result = await backendFetch(`/investor/auth/${endpoint}`, {
    method: "POST",
    body,
  })

  return NextResponse.json(result.body, { status: result.status })
}
