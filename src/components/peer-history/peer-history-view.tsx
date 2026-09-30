"use client"

import { cn } from "cn"
import { HexagonIcon, ListFilterIcon, WifiIcon } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { EmptyState } from "@/components/app/empty-state"
import { HeaderIconButton, MobileHeader } from "@/components/app/mobile-header"
import { DepositFilterPanel, DepositFilterSheet, type FilterLabels } from "@/components/deposit/deposit-filters"
import { StatCard } from "@/components/deposit/deposit-summary"
import { useDepositSearchParams } from "@/components/deposit/use-deposit-history"
import { PeerHistoryDetailSheet } from "@/components/peer-history/peer-history-detail-sheet"
import {
  PeerHistoryMobileList,
  PeerHistoryMobileSkeleton,
  PeerHistoryTable,
  PeerHistoryTableHeader,
  PeerHistoryTableSkeleton,
} from "@/components/peer-history/peer-history-list"
import { usePeerHistory } from "@/components/peer-history/use-peer-history"
import { usePeerProducts } from "@/components/peer/use-peer"
import { Button, buttonVariants } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { formatUsd } from "@/lib/format"
import { PEER_HISTORY_PAGE_SIZE } from "@/services/peer-history.service"

const LABELS: FilterLabels = {
  source: "Bộ sưu tập",
  sourcePlaceholder: "Tất cả bộ sưu tập",
  sheetTitle: "Bộ lọc lịch sử Peer",
}

/**
 * `/lich-su-peer` (Figma 1077:7), purchases only: the BE has no Peer sales yet,
 * so "Tổng tiền đã thu", "Lãi/lỗ" and the transaction-type filter are left out.
 * Filters live in the URL like the deposit history (`source` = collection id).
 */
export function PeerHistoryView() {
  const params = useDepositSearchParams()
  const history = usePeerHistory(params.filters, params.page)
  const products = usePeerProducts()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const listTopRef = React.useRef<HTMLDivElement>(null)

  const loading = history.isPending
  const error = history.isError && !history.data
  const empty = !loading && !error && history.groups.length === 0
  const nothingYet = history.summary?.total_nfts_owned === 0
  const filtersDisabled = loading || error || (nothingYet && !params.hasFilters)

  const { page, setPage } = params
  React.useEffect(() => {
    if (history.data && !history.isPlaceholderData && page > history.lastPage) setPage(history.lastPage)
  }, [history.data, history.isPlaceholderData, history.lastPage, page, setPage])

  const goToPage = (next: number) => {
    setPage(next)
    const top = listTopRef.current
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const collections = (products.data ?? []).map((p) => ({ value: p.id, label: p.name }))
  const filterProps = {
    value: params.filters,
    sources: collections,
    active: params.hasFilters,
    onApply: params.applyFilters,
    onReset: params.resetFilters,
    labels: LABELS,
  }

  const body = loading ? null : error ? (
    <EmptyState
      tone="danger"
      icon={<WifiIcon />}
      title="Không tải được lịch sử"
      description="Kiểm tra kết nối mạng của bạn rồi thử lại."
      action={
        <Button size="action" className="w-[180px]" loading={history.isRefetching} onClick={() => history.refetch()}>
          Thử lại
        </Button>
      }
      className="flex-1"
    />
  ) : empty ? (
    params.hasFilters ? (
      <EmptyState
        icon={<ListFilterIcon />}
        title="Không có giao dịch phù hợp"
        description="Thử thay đổi hoặc đặt lại bộ lọc."
        action={
          <Button size="action" variant="outline" className="w-[180px]" onClick={params.resetFilters}>
            Đặt lại bộ lọc
          </Button>
        }
        className="flex-1"
      />
    ) : (
      <EmptyState
        icon={<HexagonIcon />}
        title="Chưa có giao dịch Peer nào"
        description="Các lần sở hữu Peer của bạn sẽ hiển thị tại đây."
        action={
          <Link href="/peer" className={cn(buttonVariants({ size: "action" }), "w-[200px]")}>
            Sở hữu Peer
          </Link>
        }
        className="flex-1"
      />
    )
  ) : null

  const shownPage = history.data?.extra.page ?? page
  const from = (shownPage - 1) * PEER_HISTORY_PAGE_SIZE + 1
  const to = Math.min(shownPage * PEER_HISTORY_PAGE_SIZE, history.total)
  const pager = (
    <div className="mt-auto flex flex-col items-center gap-3 pt-6 sm:flex-row sm:justify-between">
      <p className="text-xs leading-[18px] text-muted-foreground">
        Hiển thị {from}–{to} trên {history.total} giao dịch
      </p>
      <Pagination page={page} lastPage={history.lastPage} onPageChange={goToPage} disabled={history.isPlaceholderData} />
    </div>
  )
  const dim = history.isPlaceholderData && "opacity-50 transition-opacity"
  const s = history.summary

  return (
    <>
      <MobileHeader
        actions={
          <HeaderIconButton
            aria-label="Bộ lọc"
            disabled={filtersDisabled}
            onClick={() => setSheetOpen(true)}
            className="disabled:opacity-50"
          >
            <ListFilterIcon strokeWidth={2} />
            {params.hasFilters && (
              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-success" />
            )}
          </HeaderIconButton>
        }
      />

      <main className="flex flex-1 flex-col gap-6 px-6 pb-8 lg:px-8 lg:py-8">
        {!error && (
          <div className="grid grid-cols-2 gap-3 lg:gap-6">
            <StatCard
              label="Tổng tiền đã chi"
              hint={s ? `${s.total_nfts_owned.toLocaleString("vi-VN")} Peer đã sở hữu` : undefined}
              loading={loading}
            >
              {formatUsd(s?.total_spent_usd)}
            </StatCard>
            <StatCard label="Peer đang nắm giữ" hint="toàn bộ bộ sưu tập" loading={loading}>
              {s ? `${s.holding_nfts.toLocaleString("vi-VN")} Peer` : "—"}
            </StatCard>
          </div>
        )}

        <div
          ref={listTopRef}
          className="flex flex-1 scroll-mt-24 flex-col gap-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start"
        >
          <DepositFilterPanel {...filterProps} disabled={filtersDisabled} />

          <section
            aria-label="Giao dịch Peer"
            className="hidden min-h-[626px] flex-col rounded-panel border border-border bg-card px-[23px] pt-[11px] pb-4 lg:flex"
          >
            <PeerHistoryTableHeader />
            {loading ? (
              <PeerHistoryTableSkeleton />
            ) : (
              body ?? (
                <>
                  <div className={cn(dim)}>
                    <PeerHistoryTable groups={history.groups} onSelect={params.openDetail} />
                  </div>
                  {pager}
                </>
              )
            )}
          </section>

          <section aria-label="Giao dịch Peer" className="flex flex-1 flex-col lg:hidden">
            {loading ? (
              <PeerHistoryMobileSkeleton />
            ) : (
              body ?? (
                <>
                  <div className={cn(dim)}>
                    <PeerHistoryMobileList groups={history.groups} onSelect={params.openDetail} />
                  </div>
                  {pager}
                </>
              )
            )}
          </section>
        </div>
      </main>

      <DepositFilterSheet {...filterProps} open={sheetOpen} onOpenChange={setSheetOpen} />
      <PeerHistoryDetailSheet id={params.selectedId} onClose={params.closeDetail} />
    </>
  )
}
