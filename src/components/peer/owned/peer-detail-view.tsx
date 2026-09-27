"use client"

import { CheckIcon, HexagonIcon } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { EmptyState } from "@/components/app/empty-state"
import { MobileHeader } from "@/components/app/mobile-header"
import { PeerHero } from "@/components/peer/peer-artwork"
import { SummaryRow } from "@/components/peer/peer-shared"
import { useOwnedPeers, usePeerOrder } from "@/components/peer/use-peer"
import { buttonVariants } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatDateTime, formatVnd } from "@/lib/format"
import { shortAssetCode, txCode } from "@/lib/peer"

// Product copy from Figma "Peer · Quyền lợi".
const BENEFITS = [
  "Tăng hạn mức chat, dịch và tạo ảnh AI",
  "Tóm tắt nội dung bài viết",
  "Phân tích tác động thị trường theo thời gian thực",
  "Trao đổi, tư vấn cùng AI về bài viết",
]

type DetailTab = "attrs" | "benefits"

export function PeerDetailView({ assetId }: { assetId: string }) {
  const owned = useOwnedPeers()
  const peer = owned.data?.find((p) => p.id === assetId)
  const order = usePeerOrder(peer?.orderId)
  const [tab, setTab] = React.useState<DetailTab>("attrs")
  const unitPrice = order.data?.nft_source.unit_price_vnd ?? peer?.product.unitPriceVnd

  return (
    <>
      <MobileHeader title="Chi tiết Peer" hideMenu />
      <main className="flex flex-1 flex-col px-6 pb-10 lg:px-8 lg:py-8">
        {owned.isPending ? (
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[520px_minmax(0,1fr)] lg:gap-8">
            <Skeleton className="h-[272px] rounded-panel lg:h-[560px]" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-[92px] rounded-panel" />
              <Skeleton className="h-48 rounded-panel" />
            </div>
          </div>
        ) : !peer ? (
          <EmptyState
            className="flex-1"
            icon={<HexagonIcon strokeWidth={1.6} />}
            title="Không tìm thấy Peer"
            description="Peer này không thuộc tài khoản của bạn hoặc không còn tồn tại."
            action={
              <Link href="/peer?tab=cua-toi" className={buttonVariants({ size: "action" })}>
                Về Peer của tôi
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[520px_minmax(0,1fr)] lg:items-start lg:gap-8">
            <PeerHero label={shortAssetCode(peer.assetCode)} />

            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="hidden w-fit rounded-full bg-success-soft px-3 py-1 text-[11.5px] font-semibold text-foreground lg:inline-flex">
                  {peer.product.symbol}
                </span>
                <h1 className="text-[21px] leading-7 font-bold text-foreground lg:text-[30px] lg:leading-10">
                  {peer.product.name} {shortAssetCode(peer.assetCode)}
                </h1>
                <p className="truncate text-[13px] text-muted-foreground">
                  {peer.assetCode} · Sở hữu {formatDate(peer.issuedAt)}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-panel bg-muted px-5 py-3.5 lg:bg-card lg:px-6">
                <div className="flex flex-col">
                  <span className="text-[12.5px] text-muted-foreground">Giá sở hữu</span>
                  {order.isPending && !unitPrice ? (
                    <Skeleton className="my-1.5 h-7 w-36" />
                  ) : (
                    <span className="text-2xl leading-9 font-bold text-foreground lg:text-[28px]">
                      {formatVnd(unitPrice)}
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-surface-strong px-3.5 py-1.5 text-xs font-semibold text-foreground">
                  Đã sở hữu
                </span>
              </div>

              <SegmentedControl
                aria-label="Thông tin Peer"
                options={[
                  { value: "attrs", label: "Thuộc tính" },
                  { value: "benefits", label: "Quyền lợi" },
                ]}
                value={tab}
                onValueChange={setTab}
                itemClassName="text-[13.5px] data-[active=false]:text-muted-foreground"
                className="h-12"
              />

              {tab === "attrs" ? (
                <div className="flex flex-col divide-y divide-border border-b border-border *:py-3.5">
                  <SummaryRow label="Loại tài sản" valueClassName="font-semibold">Peer</SummaryRow>
                  <SummaryRow label="Bộ sưu tập" valueClassName="font-semibold">{peer.product.name}</SummaryRow>
                  <SummaryRow label="Mã Peer" valueClassName="font-semibold">{peer.assetCode}</SummaryRow>
                  <SummaryRow label="Nguồn cung" valueClassName="font-semibold">
                    {peer.product.totalSupply.toLocaleString("vi-VN")} Peer
                  </SummaryRow>
                  <SummaryRow label="Thời gian cấp" valueClassName="font-semibold">{formatDateTime(peer.issuedAt)}</SummaryRow>
                  <SummaryRow label="Mã giao dịch" valueClassName="font-semibold">
                    {order.data?.transaction_code ?? txCode(peer.orderId)}
                  </SummaryRow>
                </div>
              ) : (
                <div className="rounded-action bg-benefit-soft px-4 py-4">
                  <h2 className="text-sm font-bold text-foreground">Quyền lợi</h2>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {BENEFITS.map((b) => (
                      <li key={b} className="flex gap-2.5 text-[12.5px] leading-[18px] text-foreground">
                        <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-benefit" strokeWidth={2} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </>
  )
}
