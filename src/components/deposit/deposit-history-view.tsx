"use client"

import { cn } from "cn"
import { CreditCardIcon, ListFilterIcon, WifiIcon } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { EmptyState } from "@/components/app/empty-state"
import { HeaderIconButton, MobileHeader } from "@/components/app/mobile-header"
import { DepositDetailSheet } from "@/components/deposit/deposit-detail-sheet"
import { DepositFilterPanel, DepositFilterSheet } from "@/components/deposit/deposit-filters"
import {
  DepositMobileList,
  DepositMobileSkeleton,
  DepositTable,
  DepositTableHeader,
  DepositTableSkeleton,
} from "@/components/deposit/deposit-list"
import { statusLabel } from "@/components/deposit/deposit-status"
import { DepositStatCards, DepositSummaryCard } from "@/components/deposit/deposit-summary"
import { useDepositHistory, useDepositSearchParams } from "@/components/deposit/use-deposit-history"
import { Button, buttonVariants } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { DEPOSIT_PAGE_SIZE } from "@/services/deposit.service"
import type { DepositHistoryFilters, DepositSource } from "@/types/deposit"

export function DepositHistoryView() {
  const params = useDepositSearchParams()
  const history = useDepositHistory(params.filters, params.page)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const listTopRef = React.useRef<HTMLDivElement>(null)

  const loading = history.isPending
  const error = history.isError && !history.data
  const empty = !loading && !error && history.groups.length === 0
  // Nothing to filter when the account has no deposits at all.
  const noDeposits = history.summary?.total_count === 0
  const filtersDisabled = loading || error || (noDeposits && !params.hasFilters)

  // A stale ?page= beyond the last page (e.g. after data changed) → clamp.
  const { page, setPage } = params
  React.useEffect(() => {
    if (history.data && !history.isPlaceholderData && page > history.lastPage) setPage(history.lastPage)
  }, [history.data, history.isPlaceholderData, history.lastPage, page, setPage])

  const goToPage = (next: number) => {
    setPage(next)
    const top = listTopRef.current
    if (top && top.getBoundingClientRect().top < 0) {
      top.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const filterProps = {
    value: params.filters,
    sources: history.sources,
    active: params.hasFilters,
    onApply: params.applyFilters,
    onReset: params.resetFilters,
  }

  const body = loading ? null : error ? (
    <EmptyState
      tone="danger"
      icon={<WifiIcon />}
      title="Không tải được lịch sử"
      description="Kiểm tra kết nối mạng của bạn rồi thử lại."
      action={
        <Button
          size="action"
          className="w-[180px] lg:w-[146px]"
          loading={history.isRefetching}
          onClick={() => history.refetch()}
        >
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
        icon={<CreditCardIcon />}
        title="Chưa có giao dịch nạp nào"
        description="Các lần nạp tiền vào ví Mindo của bạn sẽ được hiển thị tại đây."
        action={
          <Link href="/nap-tien" className={cn(buttonVariants({ size: "action" }), "w-[200px]")}>
            Nạp tiền ngay
          </Link>
        }
        className="flex-1"
      />
    )
  ) : null

  // Range of the page actually on screen (the previous one stays while the next loads).
  const shownPage = history.data?.extra.page ?? page
  const from = (shownPage - 1) * DEPOSIT_PAGE_SIZE + 1
  const to = Math.min(shownPage * DEPOSIT_PAGE_SIZE, history.total)
  const pager = (
    <div className="mt-auto flex flex-col items-center gap-3 pt-6 sm:flex-row sm:justify-between">
      <p className="text-xs leading-[18px] text-muted-foreground">
        Hiển thị {from}–{to} trên {history.total} giao dịch
      </p>
      <Pagination
        page={page}
        lastPage={history.lastPage}
        onPageChange={goToPage}
        disabled={history.isPlaceholderData}
      />
    </div>
  )
  const dimWhileLoading = history.isPlaceholderData && "opacity-50 transition-opacity"

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
        {/* Summary */}
        <DepositStatCards summary={history.summary} loading={loading} error={error} />
        {!error && <DepositSummaryCard summary={history.summary} loading={loading} className="mt-1" />}

        <div
          ref={listTopRef}
          className="flex flex-1 scroll-mt-24 flex-col gap-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start"
        >
          <DepositFilterPanel {...filterProps} disabled={filtersDisabled} />

          {/* Desktop table */}
          <section
            aria-label="Giao dịch nạp"
            className="hidden min-h-[626px] flex-col rounded-panel border border-border bg-card px-[23px] pt-[11px] pb-4 lg:flex"
          >
            <DepositTableHeader />
            {loading ? (
              <DepositTableSkeleton />
            ) : body ?? (
              <>
                <div className={cn(dimWhileLoading)}>
                  <DepositTable groups={history.groups} onSelect={params.openDetail} />
                </div>
                {params.hasFilters && (
                  <p className="mt-6 text-xs leading-[18px] text-muted-foreground">
                    {describeFilters(params.filters, history.sources)} — {history.total} giao dịch
                  </p>
                )}
                {pager}
              </>
            )}
          </section>

          {/* Mobile list */}
          <section aria-label="Giao dịch nạp" className="flex flex-1 flex-col lg:hidden">
            {loading ? (
              <DepositMobileSkeleton />
            ) : body ?? (
              <>
                {params.hasFilters && (
                  <p className="mb-3 text-xs leading-[18px] text-muted-foreground">
                    {describeFilters(params.filters, history.sources)} — {history.total} giao dịch
                  </p>
                )}
                <div className={cn(dimWhileLoading)}>
                  <DepositMobileList groups={history.groups} onSelect={params.openDetail} />
                </div>
                {pager}
              </>
            )}
          </section>
        </div>
      </main>

      <DepositFilterSheet {...filterProps} open={sheetOpen} onOpenChange={setSheetOpen} />
      <DepositDetailSheet id={params.selectedId} onClose={params.closeDetail} />
    </>
  )
}

/** "Lọc: 01/01 – 31/01/2025 · VietQR · Thành công" */
function describeFilters(filters: DepositHistoryFilters, sources: DepositSource[]) {
  const dmy = (v: string) => v.split("-").reverse().join("/")
  const parts: string[] = []
  if (filters.from && filters.to) {
    const sameYear = filters.from.slice(0, 4) === filters.to.slice(0, 4)
    parts.push(`${sameYear ? dmy(filters.from).slice(0, 5) : dmy(filters.from)} – ${dmy(filters.to)}`)
  } else if (filters.from) parts.push(`Từ ${dmy(filters.from)}`)
  else if (filters.to) parts.push(`Đến ${dmy(filters.to)}`)
  if (filters.source) parts.push(sources.find((s) => s.value === filters.source)?.label ?? filters.source)
  if (filters.status) parts.push(statusLabel(filters.status))
  return `Lọc: ${parts.join(" · ")}`
}
