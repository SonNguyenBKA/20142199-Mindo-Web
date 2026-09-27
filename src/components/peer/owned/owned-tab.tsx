"use client"

import { HexagonIcon, RotateCwIcon, SearchIcon } from "lucide-react"
import * as React from "react"

import { EmptyState } from "@/components/app/empty-state"
import { PeerGridCard } from "@/components/peer/owned/peer-grid-card"
import { PeerCard, PeerToolbar } from "@/components/peer/peer-shared"
import { useOwnedPeers } from "@/components/peer/use-peer"
import { shortAssetCode } from "@/lib/peer"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

const PAGE_SIZE = 8

export function OwnedTab({
  tabs,
  query,
  page,
  onQueryChange,
  onPageChange,
  onBuy,
}: {
  tabs: React.ReactNode
  query: string
  page: number
  onQueryChange: (q: string) => void
  onPageChange: (page: number) => void
  onBuy: () => void
}) {
  const owned = useOwnedPeers()
  const peers = React.useMemo(() => owned.data ?? [], [owned.data])
  const q = query.trim().toLowerCase()
  const filtered = q
    ? peers.filter((p) =>
        `${p.product.name} ${shortAssetCode(p.assetCode)} ${p.assetCode}`.toLowerCase().includes(q)
      )
    : peers
  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, lastPage)
  const items = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  return (
    <>
      <PeerToolbar tabs={tabs}>
        <div className="flex items-center gap-4 lg:flex-1 lg:justify-between">
          <label className="relative flex h-12 flex-1 items-center rounded-control border border-border bg-input-bg lg:max-w-[274px] lg:flex-none lg:bg-card">
            <SearchIcon className="pointer-events-none absolute left-4 size-4 text-muted-foreground lg:left-3.5" strokeWidth={1.8} />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Tìm trong kho Peer…"
              aria-label="Tìm Peer"
              className="size-full rounded-control bg-transparent pr-4 pl-11 text-[13px] text-foreground outline-none placeholder:text-placeholder focus-visible:ring-3 focus-visible:ring-ring/20 lg:pl-10"
            />
          </label>
          <span className="hidden text-[13px] text-muted-foreground lg:block">Số lượng {peers.length} Peer</span>
        </div>
      </PeerToolbar>

      <PeerCard className="flex flex-1 flex-col border-0 bg-transparent lg:border lg:bg-card lg:p-6">
        {owned.isPending ? (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="aspect-[5/6] rounded-block" />
            ))}
          </div>
        ) : owned.isError ? (
          <EmptyState
            tone="danger"
            icon={<RotateCwIcon strokeWidth={1.8} />}
            title="Không tải được Peer của bạn"
            action={
              <Button size="action" onClick={() => owned.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : peers.length === 0 ? (
          <EmptyState
            className="flex-1"
            icon={<HexagonIcon strokeWidth={1.6} />}
            title="Bạn chưa có Peer nào"
            description="Bắt đầu sở hữu chứng nhận tài sản số bằng cách sở hữu Peer đầu tiên."
            action={
              <Button size="action" className="w-[180px]" onClick={onBuy}>
                Sở hữu Peer
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            className="flex-1"
            icon={<SearchIcon strokeWidth={1.6} />}
            title="Không tìm thấy Peer"
            description={`Không có Peer nào khớp “${query.trim()}”.`}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-6">
              {items.map((peer) => (
                <PeerGridCard key={peer.id} peer={peer} />
              ))}
            </div>
            <Pagination page={current} lastPage={lastPage} onPageChange={onPageChange} className="mt-6 justify-center" />
          </>
        )}
      </PeerCard>

      {peers.length > 0 && (
        <Button size="xl" onClick={onBuy} className="lg:hidden">
          Sở hữu Peer
        </Button>
      )}
    </>
  )
}
