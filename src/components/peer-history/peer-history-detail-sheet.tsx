"use client"

import { cn } from "cn"
import { ChevronLeftIcon, WifiIcon, XIcon } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/app/empty-state"
import { HeaderIconButton } from "@/components/app/mobile-header"
import { statusSoftBg } from "@/components/deposit/deposit-status"
import { usePeerHistoryDetail } from "@/components/peer-history/use-peer-history"
import { SummaryRow } from "@/components/peer/peer-shared"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { tierByCode } from "@/lib/agency-tier"
import { formatDateTime, formatUsd, formatVnd } from "@/lib/format"
import { shortAssetCode } from "@/lib/peer"
import type { PeerHistoryDetail } from "@/types/peer-history"

/** Right drawer on desktop, full-screen sheet on mobile (Figma "Chi tiết giao dịch sở hữu", 1090:777). */
export function PeerHistoryDetailSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const detail = usePeerHistoryDetail(id)
  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
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
            Chi tiết giao dịch
          </SheetTitle>
          <SheetClose
            aria-label="Đóng"
            className="hidden size-8 items-center justify-center rounded-lg text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30 lg:flex"
          >
            <XIcon className="size-5" strokeWidth={2} />
          </SheetClose>
        </div>
        {detail.isPending ? (
          <div className="flex flex-col gap-4 px-6 pt-2 lg:px-8 lg:pt-6">
            <Skeleton className="h-24 rounded-block" />
            <Skeleton className="h-48 rounded-block" />
          </div>
        ) : detail.isError ? (
          <EmptyState
            tone="danger"
            icon={<WifiIcon />}
            title="Không tải được giao dịch"
            action={
              <Button size="action" onClick={() => detail.refetch()}>
                Thử lại
              </Button>
            }
            className="flex-1"
          />
        ) : (
          <Body d={detail.data} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function Body({ d }: { d: PeerHistoryDetail }) {
  const rate = d.usd_vnd_rate ? Number(d.usd_vnd_rate) : null
  const tier = tierByCode(d.agency_title)
  const codes = d.overview.nft_codes.map(shortAssetCode)
  const firstAsset = d.navigation.nft_asset_ids[0]
  return (
    <div className="flex flex-col gap-5 px-6 pt-2 pb-8 lg:px-8 lg:pt-6">
      <div className={cn("rounded-block px-4 py-4", statusSoftBg[d.status])}>
        <p className="text-[12.5px] font-semibold text-foreground">
          {d.status === "completed" ? "Sở hữu Peer thành công" : `Sở hữu Peer · ${d.status_label}`}
        </p>
        <p className="mt-1 text-[28px] leading-9 font-bold text-foreground">{formatUsd(d.amount_usd, "−")}</p>
        <p className="text-xs text-muted-foreground">
          ≈ {formatVnd(d.amount_vnd)} · {formatDateTime(d.occurred_at)}
        </p>
      </div>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-sm font-semibold text-foreground">Tổng quan giao dịch</h3>
        <SummaryRow label="Mã giao dịch">{d.transaction_code}</SummaryRow>
        <SummaryRow label="Bộ sưu tập">{d.overview.collection_name}</SummaryRow>
        <SummaryRow label="Loại giao dịch">Sở hữu Peer sơ cấp</SummaryRow>
        <SummaryRow label="Số lượng">{d.overview.quantity} Peer</SummaryRow>
        <SummaryRow label="Mã Peer">
          {codes.length > 1 ? `${codes[0]} – ${codes[codes.length - 1]}` : (codes[0] ?? "—")}
        </SummaryRow>
        {tier && <SummaryRow label="Cấp đại lý">{tier.name}</SummaryRow>}
        {d.referral_code && <SummaryRow label="Mã giới thiệu">{d.referral_code}</SummaryRow>}
      </section>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-sm font-semibold text-foreground">Giá và chiết khấu</h3>
        {d.unit_price_usd && <SummaryRow label="Giá niêm yết">{formatUsd(d.unit_price_usd)} / Peer</SummaryRow>}
        <SummaryRow label="Tổng giá niêm yết">{formatUsd(d.gross_amount_usd)}</SummaryRow>
        {rate &&
          d.pricing_breakdown.map((s) => (
            <SummaryRow
              key={s.from_package}
              label={`Peer ${s.from_package}–${s.to_package} (−${Math.round(s.discount_rate * 100)}%)`}
              valueClassName="font-semibold text-success-strong"
            >
              {formatUsd((s.gross_amount_vnd - s.net_amount_vnd) / rate, "−")}
            </SummaryRow>
          ))}
        <SummaryRow label="Thành tiền" valueClassName="font-bold">
          {formatUsd(d.amount_usd)}
        </SummaryRow>
        {rate && <SummaryRow label="Tỷ giá lúc mua">1 USD = {formatVnd(rate)}</SummaryRow>}
        <SummaryRow label="Thực hiện qua">{d.execution.executed_via}</SummaryRow>
        <SummaryRow label="Phí giao dịch">Miễn phí</SummaryRow>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {firstAsset ? (
          <Link href={`/peer/${firstAsset}`} className={buttonVariants({ size: "action" })}>
            Xem Peer
          </Link>
        ) : (
          <span />
        )}
        <Link href="/peer?tab=cua-toi" className={buttonVariants({ size: "action", variant: "outline" })}>
          Peer của tôi
        </Link>
      </div>
    </div>
  )
}
