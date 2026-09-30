"use client"

import { PeerTile } from "@/components/peer/peer-artwork"
import { remainingOf } from "@/lib/peer"
import type { NftProduct } from "@/types/peer"

/** Peer collections on sale (GET /nfts). */
export function ProductGrid({
  products,
  onSelect,
}: {
  products: NftProduct[]
  onSelect: (product: NftProduct) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-6">
      {products.map((p) => {
        const remaining = remainingOf(p)
        const soldOut = remaining === 0
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            disabled={soldOut}
            className="group rounded-block text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed"
          >
            <PeerTile
              title={p.name}
              subtitle={p.symbol}
              // Price is the same for every collection (25 USD × rate, tier discount) — show what differs.
              label="Còn lại"
              value={`${remaining.toLocaleString("vi-VN")} Peer`}
              muted={soldOut}
              badge={
                soldOut && (
                  <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-[10.5px] font-semibold text-destructive">
                    Hết hàng
                  </span>
                )
              }
            />
          </button>
        )
      })}
    </div>
  )
}
