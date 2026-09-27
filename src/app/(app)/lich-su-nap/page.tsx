import type { Metadata } from "next"
import { Suspense } from "react"

import { DepositHistoryView } from "@/components/deposit/deposit-history-view"

export const metadata: Metadata = { title: "Lịch sử nạp tiền · Mindo" }

export default function DepositHistoryPage() {
  return (
    <Suspense>
      <DepositHistoryView />
    </Suspense>
  )
}
