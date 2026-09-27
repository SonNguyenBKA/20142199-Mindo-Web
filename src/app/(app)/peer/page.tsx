import type { Metadata } from "next"
import { Suspense } from "react"

import { PeerView } from "@/components/peer/peer-view"

export const metadata: Metadata = { title: "Mindo Peer · Mindo" }

export default function PeerPage() {
  return (
    <Suspense>
      <PeerView />
    </Suspense>
  )
}
