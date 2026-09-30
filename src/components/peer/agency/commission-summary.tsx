import { InfoIcon, MapPinIcon } from "lucide-react"
import type * as React from "react"

import { PeriodSelect } from "@/components/peer/agency/period-select"
import { SummaryRow } from "@/components/peer/peer-shared"
import { Pagination } from "@/components/ui/pagination"
import { formatDate, formatUsd, formatVnd } from "@/lib/format"
import type { PageExtra } from "@/types/deposit"
import type { BranchSales } from "@/types/peer"

type SummaryProps = {
  /** All-time total. */
  totalUsd: string | undefined
  totalVnd: string | undefined
  periodLabel: string
  periodUsd: string | undefined
  directReferrals: number
  ratePercent: number
}

/** Desktop white card (Figma "Hoa hồng của bạn"). */
export function CommissionSummaryCard({ totalUsd, totalVnd, periodLabel, periodUsd, directReferrals, ratePercent }: SummaryProps) {
  return (
    <section className="hidden flex-col gap-3 rounded-block border border-border bg-card p-6 lg:flex">
      <h2 className="text-[17px] font-semibold text-foreground">Hoa hồng của bạn</h2>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-muted-foreground">Tổng đã nhận</span>
        <span className="text-[28px] leading-9 font-bold text-foreground">{formatUsd(totalUsd)}</span>
        <span className="text-xs text-muted-foreground">≈ {formatVnd(totalVnd)}</span>
      </div>
      <div className="h-px bg-border" />
      <SummaryRow label={periodLabel} valueClassName="font-semibold">
        {formatUsd(periodUsd)}
      </SummaryRow>
      <SummaryRow label="Người đã giới thiệu" valueClassName="font-semibold">
        {directReferrals} người
      </SummaryRow>
      <div className="rounded-control bg-info-soft px-3 py-2.5 text-xs leading-[18px] text-foreground">
        <p className="font-semibold text-referral-label">Cách tính</p>
        <p className="mt-0.5">
          {ratePercent}% × giá trị đơn (sau chiết khấu) của người bạn giới thiệu, cộng thẳng vào ví khi đơn hoàn tất.
        </p>
      </div>
    </section>
  )
}

/** Mobile navy card (Figma mobile "Thẻ · Hoa hồng của bạn"). */
export function CommissionSummaryHero({ totalUsd, totalVnd, periodLabel, periodUsd, directReferrals }: SummaryProps) {
  return (
    <section className="flex flex-col gap-3.5 rounded-panel bg-linear-145 from-profile-from to-profile-to to-70% px-5 py-[18px] text-white lg:hidden">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-on-dark-muted">Tổng hoa hồng đã nhận</span>
        <span className="text-[28px] leading-9 font-bold">{formatUsd(totalUsd)}</span>
        <span className="text-xs text-on-dark-muted">≈ {formatVnd(totalVnd)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <HeroStat label={periodLabel}>{formatUsd(periodUsd)}</HeroStat>
        <HeroStat label="Đã giới thiệu">{directReferrals} người</HeroStat>
      </div>
    </section>
  )
}

function HeroStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-control bg-white/8 px-3 py-2.5">
      <span className="truncate text-[11px] text-on-dark-muted">{label}</span>
      <span className="truncate text-[15px] font-bold">{children}</span>
    </div>
  )
}

/** Branch roots only: the downline's sales in the chosen period (Figma "Doanh số tuyến dưới", 1861:1768). */
export function DownlineCard({
  data,
  extra,
  months,
  period,
  onPeriodChange,
  span,
  page,
  onPageChange,
}: {
  data: BranchSales
  extra: PageExtra
  months: string[]
  period: string
  onPeriodChange: (value: string) => void
  /** "01/09 – 30/09", or "Toàn thời gian". */
  span: string
  page: number
  onPageChange: (page: number) => void
}) {
  const code = data.system_code
  const m = data.metrics
  return (
    <section className="flex flex-col gap-4 rounded-panel border border-referral-border bg-linear-140 from-referral-from to-referral-to p-4 lg:gap-5 lg:p-7">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-card shadow-icon-tile">
          <MapPinIcon className="size-5 text-foreground" strokeWidth={1.7} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate text-[15px] font-bold text-foreground lg:text-lg">
            Doanh số tuyến dưới{code.label ? ` · ${code.label}` : ""}
          </h2>
          <p className="truncate text-[11.5px] text-referral-muted lg:text-[13px]">Bạn là gốc nhánh {code.code}</p>
        </div>
        <PeriodSelect months={months} value={period} onChange={onPeriodChange} />
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3">
        <Stat
          label="TỔNG DOANH SỐ"
          value={formatUsd(m.total_sales_usd)}
          hint={`≈ ${formatVnd(m.total_sales_vnd)}`}
          className="col-span-2 lg:col-span-1"
        />
        <Stat label="TỔNG SỐ PEER" value={`${m.total_peer.toLocaleString("vi-VN")} Peer`} hint="toàn tuyến dưới" />
        <Stat label="KỲ ĐỐI CHIẾU" value={span} hint={`${m.order_count} đơn · ${m.downline_count} thành viên`} />
      </div>
      <SummaryRow label="Thưởng đầu nhánh trong kỳ" valueClassName="font-bold text-success-strong">
        {formatUsd(m.branch_reward_usd, "+")}
      </SummaryRow>

      {data.orders.length > 0 && (
        <div className="flex flex-col rounded-block bg-card px-4 py-1">
          <ul className="divide-y divide-border">
            {data.orders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-2.5 text-[13px]">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold text-foreground">{o.buyer.full_name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {o.quantity} Peer · {o.transaction_code}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="font-medium text-foreground">{formatUsd(o.amount_usd)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(o.occurred_at)}</span>
                </span>
              </li>
            ))}
          </ul>
          {extra.last_page > 1 && (
            <Pagination page={page} lastPage={extra.last_page} onPageChange={onPageChange} className="justify-center py-2" />
          )}
        </div>
      )}

      <p className="flex items-start gap-1.5 text-[11.5px] leading-4 text-referral-label lg:text-xs">
        <InfoIcon className="mt-px size-3.5 shrink-0" strokeWidth={1.8} />
        Số liệu gồm toàn bộ đơn sở hữu Peer của tuyến dưới trong kỳ — dùng để đối chiếu khi nhận thưởng.
      </p>
    </section>
  )
}

function Stat({ label, value, hint, className }: { label: string; value: string; hint?: string; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 rounded-block bg-card px-4 py-3 lg:px-5 lg:py-4 ${className ?? ""}`}>
      <span className="text-[10.5px] font-medium tracking-[0.5px] text-referral-label lg:text-[11.5px]">{label}</span>
      <span className="truncate text-lg font-bold text-foreground lg:text-[22px]">{value}</span>
      {hint && <span className="truncate text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  )
}
