import type { Metadata } from "next"
import { Suspense } from "react"

import { PeerHistoryView } from "@/components/peer-history/peer-history-view"

export const metadata: Metadata = { title: "Lịch sử Mindo Peer · Mindo" }

export default function Page() {
  return (
    <Suspense>
      <PeerHistoryView />
    </Suspense>
  )
}
