import type { NextRequest } from "next/server"

import { forwardWithSession } from "@/lib/server/forward"

export function GET(request: NextRequest) {
  return forwardWithSession(request, "/investor/me")
}
