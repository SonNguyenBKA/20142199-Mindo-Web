"use client"

import { CheckIcon, ChevronLeftIcon, XIcon } from "lucide-react"

import { HeaderIconButton } from "@/components/app/mobile-header"
import { COMMISSION_TYPE, usdOf } from "@/components/peer/agency/commission-utils"
import { SummaryRow } from "@/components/peer/peer-shared"
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { tierByCode } from "@/lib/agency-tier"
import { formatDateTime, formatUsd, formatVnd, initials } from "@/lib/format"
import type { Commission } from "@/types/peer"

/** Right drawer on desktop, full-screen sheet on mobile (Figma "Chi tiết hoa hồng"). */
export function CommissionDetailSheet({
  row,
  onOpenChange,
}: {
  row: Commission | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={!!row} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 overflow-y-auto border-0 bg-card p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none lg:data-[side=right]:w-[480px]"
      >
        <div className="relative flex h-[68px] shrink-0 items-center justify-center px-6 lg:h-auto lg:justify-between lg:px-8 lg:pt-7">
          <SheetClose render={<HeaderIconButton aria-label="Quay lại" className="absolute left-6 lg:hidden" />}>
            <ChevronLeftIcon strokeWidth={2} />
          </SheetClose>
          <SheetTitle className="text-[17px] leading-6 font-semibold lg:text-[19px] lg:leading-[26px] lg:font-bold">
            Chi tiết hoa hồng
          </SheetTitle>
          <SheetClose
            aria-label="Đóng"
            className="hidden size-8 items-center justify-center rounded-lg text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30 lg:flex"
          >
            <XIcon className="size-5" strokeWidth={2} />
          </SheetClose>
        </div>
        {row && <DetailBody row={row} />}
      </SheetContent>
    </Sheet>
  )
}

function DetailBody({ row }: { row: Commission }) {
  const rate = `${row.rate_percent}%`
  const usd = (vnd: string) => formatUsd(usdOf(vnd, row.usd_vnd_rate))
  const tier = tierByCode(row.order.agency_title)
  const discount = Number(row.order.discount_vnd)
  return (
    <div className="flex flex-col gap-5 px-6 pt-2 pb-8 lg:px-8 lg:pt-6">
      <div className="rounded-block border border-referral-border bg-linear-140 from-referral-from to-referral-to px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12.5px] text-muted-foreground">
            {COMMISSION_TYPE[row.type]} {rate}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
            <CheckIcon className="size-3" strokeWidth={2.4} />
            Đã cộng vào ví
          </span>
        </div>
        <p className="mt-1 text-[28px] leading-9 font-bold text-success-strong">{formatUsd(row.amount_usd, "+")}</p>
        <p className="text-xs text-muted-foreground">
          ≈ {formatVnd(row.amount_vnd)} · {formatDateTime(row.credited_at)}
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-block bg-muted px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-initials text-[13px] font-bold text-brand-deep">
          {initials(row.buyer.full_name)}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">{row.buyer.full_name}</span>
          <span className="truncate text-xs text-muted-foreground">{row.buyer.email}</span>
        </div>
      </div>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-sm font-semibold text-foreground">Đơn gốc</h3>
        <SummaryRow label="Mã đơn">{row.order.transaction_code}</SummaryRow>
        <SummaryRow label="Sản phẩm">
          {row.order.quantity} × {row.order.product.name}
        </SummaryRow>
        {tier && <SummaryRow label="Cấp đại lý của đơn">{tier.name}</SummaryRow>}
        {discount > 0 && (
          <SummaryRow
            label={`Chiết khấu (−${Number(row.order.discount_percent).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%)`}
          >
            − {usd(row.order.discount_vnd)}
          </SummaryRow>
        )}
        <SummaryRow label="Giá trị đơn" valueClassName="font-semibold">
          {usd(row.order.net_amount_vnd)}
        </SummaryRow>
      </section>

      <div className="rounded-block bg-info-soft px-4 py-3">
        <p className="text-[10.5px] font-semibold tracking-[0.6px] text-referral-label">CÁCH TÍNH</p>
        <p className="mt-1 text-[15px] font-bold text-foreground">
          {usd(row.order.net_amount_vnd)} × {rate} = {formatUsd(row.amount_usd)}
        </p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">Hoa hồng = {rate} giá trị đơn sau chiết khấu</p>
      </div>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-sm font-semibold text-foreground">Ghi nhận</h3>
        <SummaryRow label="Thời gian ghi nhận">{formatDateTime(row.credited_at)}</SummaryRow>
        <SummaryRow label="Số tiền vào ví">{formatVnd(row.amount_vnd)}</SummaryRow>
        <SummaryRow label="Tỷ giá">1 USD = {formatVnd(row.usd_vnd_rate)}</SummaryRow>
      </section>
    </div>
  )
}
