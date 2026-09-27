import type { Metadata } from "next"

import { PeerDetailView } from "@/components/peer/owned/peer-detail-view"

export const metadata: Metadata = { title: "Chi tiết Peer · Mindo" }

export default async function PeerDetailPage({ params }: PageProps<"/peer/[id]">) {
  const { id } = await params
  return <PeerDetailView assetId={id} />
}
