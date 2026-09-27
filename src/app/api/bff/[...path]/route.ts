import { NextResponse, type NextRequest } from "next/server"

import { forwardWithSession, type ForwardMethod } from "@/lib/server/forward"

const ID = "[\\w-]+"
const rules = (...patterns: string[]) => patterns.map((p) => new RegExp(`^${p}$`))

/** Public (non-investor) endpoints, forwarded as `/<endpoint>`. */
const PUBLIC_GET = rules("nfts")

/** Investor endpoints the browser may reach through the BFF, per method. */
const ALLOWED: Record<ForwardMethod, RegExp[]> = {
  GET: rules(
    "me",
    "me/nfts",
    "account",
    "account/settings",
    "account/sessions",
    "referrals/dashboard",
    "agency/me",
    "history/deposits",
    `history/deposits/${ID}`,
    `history/deposits/${ID}/receipt`,
    `history/nfts/${ID}`
  ),
  POST: rules("auth/update-password", "files/upload", "invest/snapshot-price", "invest", "agency/applications"),
  PATCH: rules("account/profile", "account/settings"),
  DELETE: rules("account/sessions", `account/sessions/${ID}`),
}

type Ctx = RouteContext<"/api/bff/[...path]">

function handler(method: ForwardMethod) {
  return async (request: NextRequest, ctx: Ctx) => {
    const { path } = await ctx.params
    const endpoint = path.join("/")

    if (method === "GET" && PUBLIC_GET.some((re) => re.test(endpoint))) {
      return forwardWithSession(request, `/${endpoint}`, method)
    }
    if (!ALLOWED[method].some((re) => re.test(endpoint))) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }

    return forwardWithSession(request, `/investor/${endpoint}`, method)
  }
}

export const GET = handler("GET")
export const POST = handler("POST")
export const PATCH = handler("PATCH")
export const DELETE = handler("DELETE")
