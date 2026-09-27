import type { Metadata } from "next"
import { Suspense } from "react"

import { TopupView } from "@/components/topup/topup-view"

export const metadata: Metadata = { title: "Nạp tiền · Mindo" }

export default function TopupPage() {
  return (
    <Suspense>
      <TopupView />
    </Suspense>
  )
}
