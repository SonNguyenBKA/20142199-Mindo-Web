import { cn } from "cn"
import { AlertCircleIcon, ShieldAlertIcon } from "lucide-react"
import Link from "next/link"

import { AgencyTierBadge } from "@/components/account/agency-tier-badge"
import type { DiscountLine, OrderPricing } from "@/components/peer/buy/pricing"
import { SummaryRow } from "@/components/peer/peer-shared"
import { Button, buttonVariants } from "@/components/ui/button"
import { tierByCode } from "@/lib/agency-tier"
import { formatUsd, formatVnd } from "@/lib/format"

export type SummaryProps = {
  pricing: OrderPricing
  /** False while the server has not confirmed this exact order, or a referral code is being rejected. */
  canBuy: boolean
  buying: boolean
  onBuy: () => void
}

const FOOTNOTE = "Số bản được cấp tự động sau khi thanh toán."

/** "Chiết khấu (−20%)" for one run; "Peer 41–49 (−20%)" when the order crosses a tier line. */
const discountLabel = (d: DiscountLine, many: boolean) =>
  many ? `Peer ${d.from}–${d.to} (−${d.discountPercent}%)` : `Chiết khấu (−${d.discountPercent}%)`

const rateLine = (rate: number) => `Tỷ giá tạm tính 1 USD = ${formatVnd(rate)}`

/** Desktop right column (Figma "Thẻ · Tóm tắt đơn", 1859:1628). */
export function OrderSummaryCard({ pricing, canBuy, buying, onBuy }: SummaryProps) {
  const tier = tierByCode(pricing.attained)
  const short = pricing.shortageVnd > 0
  const discounts = pricing.discounts.filter((d) => d.discountUsd > 0)
  return (
    <section className="hidden flex-col gap-3.5 rounded-block border border-border bg-card p-6 lg:flex">
      <h2 className="text-base font-semibold text-foreground">Tóm tắt đơn</h2>
      <SummaryRow label="Số lượng">{pricing.quantity} Peer</SummaryRow>
      <SummaryRow label="Giá niêm yết">{formatUsd(pricing.grossUsd)}</SummaryRow>
      {tier && (
        <SummaryRow label="Cấp đại lý" valueClassName="flex items-center gap-1.5">
          <AgencyTierBadge tier={tier} size={20} />
          {tier.name}
        </SummaryRow>
      )}
      {discounts.map((d) => (
        <SummaryRow key={d.from} label={discountLabel(d, discounts.length > 1)} valueClassName="font-semibold text-success-strong">
          {formatUsd(d.discountUsd, "−")}
        </SummaryRow>
      ))}
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-muted-foreground">Thành tiền</span>
        <span className="text-[30px] leading-10 font-bold text-foreground">{formatUsd(pricing.netUsd)}</span>
        <span className="text-[13px] text-muted-foreground">≈ {formatVnd(pricing.netVnd)}</span>
        <span className="text-[11px] text-placeholder">{rateLine(pricing.usdVndRate)}</span>
      </div>
      <div className="h-px bg-border" />
      <SummaryRow label="Số dư ví" valueClassName={cn(short && "font-semibold text-destructive")}>
        {formatVnd(pricing.balanceVnd)}
      </SummaryRow>
      <Notices pricing={pricing} />
      {short && (
        <Link href="/nap-tien" className={buttonVariants({ size: "xl" })}>
          Nạp thêm tiền
        </Link>
      )}
      <Button size="xl" disabled={!canBuy} loading={buying} onClick={onBuy}>
        Sở hữu {pricing.quantity} Peer
      </Button>
      <p className="text-xs text-muted-foreground">{FOOTNOTE}</p>
    </section>
  )
}

/** Mobile inline summary + actions (Figma mobile "Tóm tắt đơn", 1875:1688). */
export function OrderSummaryInline({ pricing, canBuy, buying, onBuy }: SummaryProps) {
  const short = pricing.shortageVnd > 0
  const discounts = pricing.discounts.filter((d) => d.discountUsd > 0)
  return (
    <div className="flex flex-col gap-3.5 lg:hidden">
      <div className="flex flex-col gap-2 rounded-block bg-muted px-4 py-3.5">
        <SummaryRow
          label={`Giá niêm yết (${pricing.quantity} × ${formatUsd(pricing.unitUsd)})`}
          className="text-[12.5px]"
        >
          {formatUsd(pricing.grossUsd)}
        </SummaryRow>
        {discounts.map((d) => (
          <SummaryRow
            key={d.from}
            label={
              discounts.length > 1
                ? discountLabel(d, true)
                : `${tierByCode(d.tier)?.name ?? "Chiết khấu"} (−${d.discountPercent}%)`
            }
            className="text-[12.5px]"
            valueClassName="font-semibold text-success-strong"
          >
            {formatUsd(d.discountUsd, "−")}
          </SummaryRow>
        ))}
        <div className="h-px bg-border" />
        <div className="flex items-end justify-between text-[12.5px]">
          <span className="text-muted-foreground">Thành tiền</span>
          <span className="flex flex-col items-end">
            <span className="text-[22px] leading-7 font-bold text-foreground">{formatUsd(pricing.netUsd)}</span>
            <span className="text-[11.5px] text-muted-foreground">≈ {formatVnd(pricing.netVnd)}</span>
          </span>
        </div>
        <SummaryRow
          label="Số dư ví"
          className="text-[12.5px]"
          valueClassName={cn(short && "font-semibold text-destructive")}
        >
          {formatVnd(pricing.balanceVnd)}
        </SummaryRow>
      </div>
      <Notices pricing={pricing} />
      <div className="flex gap-2.5">
        <Button size="xl" disabled={!canBuy} loading={buying} onClick={onBuy} className={cn(short && "w-auto flex-1")}>
          {short ? "Sở hữu Peer" : `Sở hữu ${pricing.quantity} Peer`}
        </Button>
        {short && (
          <Link href="/nap-tien" className={cn(buttonVariants({ size: "xl" }), "w-auto flex-1")}>
            Nạp thêm tiền
          </Link>
        )}
      </div>
      <p className="text-[11.5px] text-muted-foreground">{FOOTNOTE}</p>
    </div>
  )
}

function Notices({ pricing }: { pricing: OrderPricing }) {
  return (
    <>
      {!pricing.kycVerified && (
        <div className="flex gap-2 rounded-control bg-warning-soft px-3 py-2.5 text-xs leading-[18px] text-warning-foreground">
          <ShieldAlertIcon className="mt-px size-4 shrink-0" strokeWidth={1.8} />
          <span>Cần xác minh danh tính (KYC) trên ứng dụng Mindo trước khi sở hữu Peer.</span>
        </div>
      )}
      {pricing.shortageVnd > 0 && (
        <div className="flex gap-2 rounded-control bg-warning-soft px-3 py-2.5 text-xs leading-[18px] text-warning-foreground">
          <AlertCircleIcon className="mt-px size-4 shrink-0" strokeWidth={1.8} />
          <span>Thiếu {formatVnd(pricing.shortageVnd)} để hoàn tất đơn này. Nạp thêm hoặc giảm số lượng.</span>
        </div>
      )}
    </>
  )
}
