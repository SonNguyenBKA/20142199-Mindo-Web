"use client"

import { cn } from "cn"
import { InfoIcon, ReceiptTextIcon, RotateCwIcon } from "lucide-react"
import * as React from "react"

import { ReferralCard } from "@/components/account/referral-card"
import { useReferralDashboard } from "@/components/account/use-account"
import { AgencyCtaCard } from "@/components/agency/agency-cta"
import { EmptyState } from "@/components/app/empty-state"
import { CommissionDetailSheet } from "@/components/peer/agency/commission-detail-sheet"
import { CommissionListMobile, CommissionTable } from "@/components/peer/agency/commission-list"
import {
  CommissionSummaryCard,
  CommissionSummaryHero,
  DownlineCard,
} from "@/components/peer/agency/commission-summary"
import { isForbidden, monthRange, monthSpan, recentMonths } from "@/components/peer/agency/commission-utils"
import { ALL_PERIODS, PeriodSelect, periodLabel } from "@/components/peer/agency/period-select"
import { useBranchSales, useCommissions } from "@/components/peer/agency/use-referrals"
import { PeerToolbar, ToolbarPill } from "@/components/peer/peer-shared"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUsd } from "@/lib/format"
import type { Commission } from "@/types/peer"

type TypeFilter = "DIRECT" | "BRANCH" | undefined

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: undefined, label: "Tất cả" },
  { value: "DIRECT", label: "Trực tiếp" },
  { value: "BRANCH", label: "Đầu nhánh" },
]

const ALL_TIME = {}

export function AgencyTab({ tabs }: { tabs: React.ReactNode }) {
  const referrals = useReferralDashboard()
  const data = referrals.data
  const months = React.useMemo(() => recentMonths(12), [])
  const [period, setPeriod] = React.useState(months[0])
  const [type, setType] = React.useState<TypeFilter>(undefined)
  const [page, setPage] = React.useState(1)
  const [branchPage, setBranchPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Commission | null>(null)

  const range = React.useMemo(() => (period === ALL_PERIODS ? ALL_TIME : monthRange(period)), [period])
  const commissions = useCommissions(range, type, page)
  const allTime = useCommissions(ALL_TIME, undefined, 1)
  const isRoot = !!data?.is_branch_root
  const branch = useBranchSales(range, branchPage, isRoot)

  const changePeriod = (value: string) => {
    setPeriod(value)
    setPage(1)
    setBranchPage(1)
  }

  const label = periodLabel(period)
  const rows = commissions.data?.data.items ?? []
  const extra = commissions.data?.extra
  const summary = commissions.data?.data.summary
  const rate = data?.settings.direct_rate_percent ?? 10
  const summaryProps = {
    totalUsd: allTime.data?.data.summary.total_commission_usd,
    totalVnd: allTime.data?.data.summary.total_commission_vnd,
    periodLabel: label,
    periodUsd: summary?.total_commission_usd,
    directReferrals: data?.direct_referrals ?? 0,
    ratePercent: rate,
  }

  return (
    <>
      <PeerToolbar tabs={tabs}>
        {data && (
          <ToolbarPill className="hidden lg:flex">
            <InfoIcon className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
            <span className="text-muted-foreground">Hoa hồng giới thiệu</span>
            <b className="font-bold text-foreground lg:text-sm">{rate}% giá thực trả</b>
          </ToolbarPill>
        )}
      </PeerToolbar>

      {referrals.isPending ? (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
          <Skeleton className="h-[420px] rounded-block" />
          <Skeleton className="hidden h-[420px] rounded-block lg:block" />
        </div>
      ) : referrals.isError || !data ? (
        <EmptyState
          tone="danger"
          icon={<RotateCwIcon strokeWidth={1.8} />}
          title="Không tải được dữ liệu hoa hồng"
          action={
            <Button size="action" onClick={() => referrals.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-6">
          <div className="flex flex-col gap-4 lg:gap-6">
            <AgencyCtaCard />
            {isRoot && branch.data && (
              <DownlineCard
                data={branch.data.data}
                extra={branch.data.extra}
                months={months}
                period={period}
                onPeriodChange={changePeriod}
                span={period === ALL_PERIODS ? "Toàn thời gian" : monthSpan(period)}
                page={branchPage}
                onPageChange={setBranchPage}
              />
            )}
            {isRoot && branch.isError && !isForbidden(branch.error) && (
              <EmptyState
                tone="danger"
                icon={<RotateCwIcon strokeWidth={1.8} />}
                title="Không tải được doanh số tuyến dưới"
                action={
                  <Button size="action" onClick={() => branch.refetch()}>
                    Thử lại
                  </Button>
                }
                className="rounded-block border border-border bg-card"
              />
            )}
            <CommissionSummaryHero {...summaryProps} />
            <div className="lg:hidden">
              <ReferralCard />
            </div>

            <section className="flex flex-col gap-3 lg:gap-4 lg:rounded-block lg:border lg:border-border lg:bg-card lg:px-8 lg:pt-7 lg:pb-8">
              <div className="flex items-center justify-between gap-3 pt-1 lg:pt-0">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-[15px] font-semibold text-foreground lg:text-lg">Lịch sử hoa hồng</h2>
                  <p className="hidden text-[13px] text-muted-foreground lg:block">
                    Khi người bạn giới thiệu sở hữu Peer
                  </p>
                </div>
                <PeriodSelect months={months} value={period} onChange={changePeriod} />
              </div>

              {isRoot && (
                <div role="radiogroup" aria-label="Loại hoa hồng" className="flex gap-2">
                  {TYPE_OPTIONS.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      role="radio"
                      aria-checked={type === o.value}
                      onClick={() => {
                        setType(o.value)
                        setPage(1)
                      }}
                      className={cn(
                        "h-8 rounded-full px-3.5 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30",
                        type === o.value
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "border border-border bg-card font-medium text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}

              {commissions.isPending ? (
                <Skeleton className="h-60 rounded-block" />
              ) : commissions.isError ? (
                <EmptyState
                  tone="danger"
                  icon={<RotateCwIcon strokeWidth={1.8} />}
                  title="Không tải được lịch sử hoa hồng"
                  action={
                    <Button size="action" onClick={() => commissions.refetch()}>
                      Thử lại
                    </Button>
                  }
                  className="rounded-block border border-border bg-card lg:border-0"
                />
              ) : rows.length === 0 ? (
                <EmptyState
                  icon={<ReceiptTextIcon strokeWidth={1.6} />}
                  title="Chưa có hoa hồng"
                  description="Chia sẻ mã giới thiệu để nhận hoa hồng khi người được giới thiệu sở hữu Peer."
                  className="rounded-block border border-border bg-card lg:border-0"
                />
              ) : (
                <div className="flex flex-col rounded-block border border-border bg-card px-4 pt-1 pb-3 lg:border-0 lg:p-0">
                  <CommissionTable rows={rows} ratePercent={rate} onSelect={setSelected} />
                  <CommissionListMobile rows={rows} onSelect={setSelected} />
                  {extra && extra.last_page > 1 && (
                    <Pagination page={page} lastPage={extra.last_page} onPageChange={setPage} className="mt-3 justify-center" />
                  )}
                  <div className="mt-1 flex items-center justify-between rounded-tile bg-info-soft px-3 py-2.5 lg:mt-3 lg:px-4 lg:py-3">
                    <span className="text-[12.5px] font-medium text-referral-label lg:text-[13px]">
                      Hiển thị {rows.length} / {summary?.transaction_count ?? rows.length} giao dịch ·{" "}
                      {label.toLowerCase()}
                    </span>
                    <span className="text-sm font-bold text-success-strong lg:text-[15px]">
                      {formatUsd(summary?.total_commission_usd, "+")}
                    </span>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="hidden flex-col gap-6 lg:flex">
            <ReferralCard />
            <CommissionSummaryCard {...summaryProps} />
          </div>
        </div>
      )}

      <CommissionDetailSheet row={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  )
}
