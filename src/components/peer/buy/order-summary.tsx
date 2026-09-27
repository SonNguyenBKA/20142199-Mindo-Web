import { cn } from "cn"
import { AlertCircleIcon, ShieldAlertIcon } from "lucide-react"
import Link from "next/link"

import { SummaryRow } from "@/components/peer/peer-shared"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatVnd } from "@/lib/format"
import type { NftProduct } from "@/types/peer"

export type SummaryProps = {
  product: NftProduct
  quantity: number
  totalVnd: number
  balanceVnd: string
  /** KYC is required by the BE before buying. */
  kycDone: boolean
  buying: boolean
  onBuy: () => void
}

const shortOf = (total: number, balance: string) => total - Number(balance)

/** Desktop right column (Figma "Thẻ · Tóm tắt đơn"). */
export function OrderSummaryCard({ product, quantity, totalVnd, balanceVnd, kycDone, buying, onBuy }: SummaryProps) {
  const short = shortOf(totalVnd, balanceVnd)
  return (
    <section className="hidden flex-col gap-3.5 rounded-block border border-border bg-card p-6 lg:flex">
      <h2 className="text-base font-semibold text-foreground">Tóm tắt đơn</h2>
      <SummaryRow label="Peer">{product.name}</SummaryRow>
      <SummaryRow label="Số lượng">{quantity} Peer</SummaryRow>
      <SummaryRow label="Đơn giá">{formatVnd(product.unitPriceVnd)}</SummaryRow>
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-muted-foreground">Thành tiền</span>
        <span className="text-[28px] leading-9 font-bold text-foreground">{formatVnd(totalVnd)}</span>
      </div>
      <div className="h-px bg-border" />
      <SummaryRow label="Số dư ví" valueClassName={cn(short > 0 && "font-semibold text-destructive")}>
        {formatVnd(balanceVnd)}
      </SummaryRow>
      <Notices short={short} kycDone={kycDone} />
      {short > 0 && (
        <Link href="/nap-tien" className={buttonVariants({ size: "xl" })}>
          Nạp thêm tiền
        </Link>
      )}
      <Button size="xl" disabled={short > 0 || !kycDone} loading={buying} onClick={onBuy}>
        Sở hữu {quantity} Peer
      </Button>
      <p className="text-xs text-muted-foreground">Mã Peer được cấp tự động sau khi thanh toán.</p>
    </section>
  )
}

/** Mobile inline summary + actions (Figma mobile "Tóm tắt đơn"). */
export function OrderSummaryInline({ product, quantity, totalVnd, balanceVnd, kycDone, buying, onBuy }: SummaryProps) {
  const short = shortOf(totalVnd, balanceVnd)
  return (
    <div className="flex flex-col gap-3.5 lg:hidden">
      <div className="flex flex-col gap-2 rounded-block bg-muted px-4 py-3.5">
        <SummaryRow label={`Đơn giá (${quantity} × ${formatVnd(product.unitPriceVnd)})`} className="text-[12.5px]">
          {formatVnd(totalVnd)}
        </SummaryRow>
        <div className="h-px bg-border" />
        <div className="flex items-end justify-between text-[12.5px]">
          <span className="text-muted-foreground">Thành tiền</span>
          <span className="text-[22px] leading-7 font-bold text-foreground">{formatVnd(totalVnd)}</span>
        </div>
        <SummaryRow
          label="Số dư ví"
          className="text-[12.5px]"
          valueClassName={cn(short > 0 && "font-semibold text-destructive")}
        >
          {formatVnd(balanceVnd)}
        </SummaryRow>
      </div>
      <Notices short={short} kycDone={kycDone} />
      <div className="flex gap-2.5">
        <Button
          size="xl"
          disabled={short > 0 || !kycDone}
          loading={buying}
          onClick={onBuy}
          className={cn(short > 0 && "w-auto flex-1")}
        >
          {short > 0 ? "Sở hữu Peer" : `Sở hữu ${quantity} Peer`}
        </Button>
        {short > 0 && (
          <Link href="/nap-tien" className={cn(buttonVariants({ size: "xl" }), "w-auto flex-1")}>
            Nạp thêm tiền
          </Link>
        )}
      </div>
      <p className="text-[11.5px] text-muted-foreground">Mã Peer được cấp tự động sau khi thanh toán.</p>
    </div>
  )
}

function Notices({ short, kycDone }: { short: number; kycDone: boolean }) {
  return (
    <>
      {!kycDone && (
        <div className="flex gap-2 rounded-control bg-warning-soft px-3 py-2.5 text-xs leading-[18px] text-warning-foreground">
          <ShieldAlertIcon className="mt-px size-4 shrink-0" strokeWidth={1.8} />
          <span>Cần xác minh danh tính (KYC) trên ứng dụng Mindo trước khi sở hữu Peer.</span>
        </div>
      )}
      {short > 0 && (
        <div className="flex gap-2 rounded-control bg-warning-soft px-3 py-2.5 text-xs leading-[18px] text-warning-foreground">
          <AlertCircleIcon className="mt-px size-4 shrink-0" strokeWidth={1.8} />
          <span>Thiếu {formatVnd(short)} để hoàn tất đơn này. Nạp thêm hoặc giảm số lượng.</span>
        </div>
      )}
    </>
  )
}
