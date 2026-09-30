import Link from "next/link"

import { PeerTile } from "@/components/peer/peer-artwork"
import { formatDate } from "@/lib/format"
import { shortAssetCode } from "@/lib/peer"
import type { OwnedPeer } from "@/types/peer"

/** Grid tile for one owned Peer (Figma "Thẻ / Peer #0017"). */
export function PeerGridCard({ peer }: { peer: OwnedPeer }) {
  return (
    <Link
      href={`/peer/${peer.id}`}
      className="group rounded-block outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      <PeerTile
        title={`${peer.product.name} ${shortAssetCode(peer.asset_code)}`}
        subtitle={peer.asset_code}
        label="Ngày sở hữu"
        value={formatDate(peer.issued_at)}
      />
    </Link>
  )
}
