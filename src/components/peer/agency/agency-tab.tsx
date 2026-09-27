"use client"

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
import { monthKey, monthsOf, sumVnd } from "@/components/peer/agency/commission-utils"
import { ALL_PERIODS, PeriodSelect, periodLabel } from "@/components/peer/agency/period-select"
import { PeerToolbar, ToolbarPill } from "@/components/peer/peer-shared"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVnd } from "@/lib/format"
import type { ReferralCommission } from "@/types/peer"

export function AgencyTab({ tabs }: { tabs: React.ReactNode }) {
  const referrals = useReferralDashboard()
  const data = referrals.data
  const rows = React.useMemo(() => data?.recent_commissions ?? [], [data])
  const months = React.useMemo(() => monthsOf(rows), [rows])
  const [picked, setPicked] = React.useState<string | null>(null)
  // Default to the newest month with data, or the current month when there is none.
  const period = picked ?? months[0] ?? monthKey(new Date().toISOString())
  const [selected, setSelected] = React.useState<ReferralCommission | null>(null)

  const visible = period === ALL_PERIODS ? rows : rows.filter((r) => monthKey(r.createdAt) === period)
  const periodVnd = sumVnd(visible)
  const label = periodLabel(period)

  return (
    <>
      <PeerToolbar tabs={tabs}>
        {data && (
          <ToolbarPill className="hidden lg:flex">
            <InfoIcon className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
            <span className="text-muted-foreground">Hoa hồng giới thiệu</span>
            <b className="font-bold text-foreground lg:text-sm">{data.settings.direct_rate_percent}% giá trị đơn</b>
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
            {data.is_branch_root && <DownlineCard data={data} />}
            <CommissionSummaryHero data={data} periodLabel={label} periodVnd={periodVnd} />
            <div className="lg:hidden">
              <ReferralCard />
            </div>

            <section className="flex flex-col gap-3 lg:gap-4 lg:rounded-block lg:border lg:border-border lg:bg-card lg:px-8 lg:pt-7 lg:pb-8">
              <div className="flex items-center justify-between gap-3 pt-1 lg:pt-0">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-[15px] font-semibold text-foreground lg:text-lg">Lịch sử hoa hồng</h2>
                  <p className="hidden text-[13px] text-muted-foreground lg:block">
                    Khi người bạn giới thiệu sở hữu Peer · 20 giao dịch gần nhất
                  </p>
                </div>
                {months.length > 0 && <PeriodSelect months={months} value={period} onChange={setPicked} />}
              </div>

              {visible.length === 0 ? (
                <EmptyState
                  icon={<ReceiptTextIcon strokeWidth={1.6} />}
                  title="Chưa có hoa hồng"
                  description="Chia sẻ mã giới thiệu để nhận hoa hồng khi người được giới thiệu sở hữu Peer."
                  className="rounded-block border border-border bg-card lg:border-0"
                />
              ) : (
                <div className="flex flex-col rounded-block border border-border bg-card px-4 pt-1 pb-3 lg:border-0 lg:p-0">
                  <CommissionTable rows={visible} onSelect={setSelected} />
                  <CommissionListMobile rows={visible} onSelect={setSelected} />
                  <div className="mt-1 flex items-center justify-between rounded-tile bg-info-soft px-3 py-2.5 lg:mt-3 lg:px-4 lg:py-3">
                    <span className="text-[12.5px] font-medium text-referral-label lg:text-[13px]">
                      Tổng {period === ALL_PERIODS ? `${visible.length} giao dịch` : label.toLowerCase()}
                    </span>
                    <span className="text-sm font-bold text-success-strong lg:text-[15px]">
                      {formatVnd(periodVnd, periodVnd > 0 ? "+" : undefined)}
                    </span>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="hidden flex-col gap-6 lg:flex">
            <ReferralCard />
            <CommissionSummaryCard data={data} periodLabel={label} periodVnd={periodVnd} />
          </div>
        </div>
      )}

      <CommissionDetailSheet row={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  )
}
