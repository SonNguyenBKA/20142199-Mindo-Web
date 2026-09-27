import { InfoIcon, MapPinIcon } from "lucide-react"
import type * as React from "react"

import { SummaryRow } from "@/components/peer/peer-shared"
import { formatVnd } from "@/lib/format"
import type { ReferralDashboard } from "@/types/account"

type SummaryProps = {
  data: ReferralDashboard
  periodLabel: string
  periodVnd: number
}

/** Desktop white card (Figma "Hoa hồng của bạn"). */
export function CommissionSummaryCard({ data, periodLabel, periodVnd }: SummaryProps) {
  const rate = data.settings.direct_rate_percent
  return (
    <section className="hidden flex-col gap-3 rounded-block border border-border bg-card p-6 lg:flex">
      <h2 className="text-[17px] font-semibold text-foreground">Hoa hồng của bạn</h2>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-muted-foreground">Tổng đã nhận</span>
        <span className="text-[28px] leading-9 font-bold text-foreground">{formatVnd(data.total_commission_vnd)}</span>
      </div>
      <div className="h-px bg-border" />
      <SummaryRow label={periodLabel} valueClassName="font-semibold">
        {formatVnd(periodVnd)}
      </SummaryRow>
      <SummaryRow label="Người đã giới thiệu" valueClassName="font-semibold">
        {data.direct_referrals} người
      </SummaryRow>
      <div className="rounded-control bg-info-soft px-3 py-2.5 text-xs leading-[18px] text-foreground">
        <p className="font-semibold text-referral-label">Cách tính</p>
        <p className="mt-0.5">
          {rate}% × giá trị đơn của người bạn giới thiệu, cộng thẳng vào ví khi đơn hoàn tất.
        </p>
      </div>
    </section>
  )
}

/** Mobile navy card (Figma mobile "Thẻ · Hoa hồng của bạn"). */
export function CommissionSummaryHero({ data, periodLabel, periodVnd }: SummaryProps) {
  return (
    <section className="flex flex-col gap-3.5 rounded-panel bg-linear-145 from-profile-from to-profile-to to-70% px-5 py-[18px] text-white lg:hidden">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-on-dark-muted">Tổng hoa hồng đã nhận</span>
        <span className="text-[28px] leading-9 font-bold">{formatVnd(data.total_commission_vnd)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <HeroStat label={periodLabel}>{formatVnd(periodVnd)}</HeroStat>
        <HeroStat label="Đã giới thiệu">{data.direct_referrals} người</HeroStat>
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

/** Branch roots only: all-time downline figures (Figma "Doanh số tuyến dưới"). */
export function DownlineCard({ data }: { data: ReferralDashboard }) {
  const branch = data.system_code?.label || data.system_code?.code
  return (
    <section className="flex flex-col gap-4 rounded-panel border border-referral-border bg-linear-140 from-referral-from to-referral-to p-4 lg:gap-5 lg:p-7">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-card shadow-icon-tile">
          <MapPinIcon className="size-5 text-foreground" strokeWidth={1.7} />
        </span>
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-[15px] font-bold text-foreground lg:text-lg">
            Doanh số tuyến dưới{branch ? ` · ${branch}` : ""}
          </h2>
          <p className="truncate text-[11.5px] text-referral-muted lg:text-[13px]">
            Bạn là gốc nhánh {data.system_code?.code}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3">
        <Stat label="TỔNG DOANH SỐ" value={formatVnd(data.downline_sales_vnd)} className="col-span-2 lg:col-span-1" />
        <Stat label="THÀNH VIÊN" value={data.downline_count.toLocaleString("vi-VN")} hint="toàn tuyến dưới" />
        <Stat label="HOA HỒNG NHÁNH" value={formatVnd(data.branch_commission_vnd)} hint={`${data.settings.branch_rate_percent}% doanh số`} />
      </div>
      <p className="flex items-start gap-1.5 text-[11.5px] leading-4 text-referral-label lg:text-xs">
        <InfoIcon className="mt-px size-3.5 shrink-0" strokeWidth={1.8} />
        Số liệu tính từ trước đến nay trên toàn bộ đơn đã hoàn tất của tuyến dưới.
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
