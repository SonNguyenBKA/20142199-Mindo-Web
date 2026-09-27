"use client"

import Link from "next/link"

import { useAccountSettings } from "@/components/account/use-account"
import { useSession } from "@/components/app/session-context"
import { SummaryRow } from "@/components/peer/peer-shared"
import { ResultCard } from "@/components/peer/result-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatDateTime, formatVnd } from "@/lib/format"
import { shortAssetCode, txCode } from "@/lib/peer"
import { HOME_PATH } from "@/lib/routes"
import type { PurchaseOrder } from "@/types/peer"

export type BuyOutcome =
  | { kind: "success"; order: PurchaseOrder; productName: string }
  | { kind: "failed"; quantity: number; totalVnd: number; reason: string; at: string }

const secondary = buttonVariants({ variant: "outline", size: "xl", className: "text-muted-foreground" })

export function BuyResult({
  outcome,
  onRetry,
  onViewPeers,
}: {
  outcome: BuyOutcome
  onRetry: () => void
  onViewPeers: () => void
}) {
  const { user } = useSession()
  const support = useAccountSettings().data?.support_center_url

  if (outcome.kind === "success") {
    const { order } = outcome
    const codes = order.nftAssets.map((a) => shortAssetCode(a.assetCode)).sort()
    return (
      <ResultCard
        tone="success"
        title="Sở hữu Peer thành công"
        amount={`${order.quantity} Peer`}
        rows={
          <>
            <SummaryRow label="Mã giao dịch">{txCode(order.id)}</SummaryRow>
            <SummaryRow label="Thời gian">{formatDateTime(order.createdAt)}</SummaryRow>
            <SummaryRow label="Peer">{outcome.productName}</SummaryRow>
            <SummaryRow label="Mã được cấp">
              {codes.length > 1 ? `${codes[0]} – ${codes[codes.length - 1]}` : (codes[0] ?? "—")}
            </SummaryRow>
            <SummaryRow label="Thành tiền">{formatVnd(order.totalVnd)}</SummaryRow>
            <SummaryRow label="Số dư sau">{formatVnd(user.balance_vnd)}</SummaryRow>
          </>
        }
        actions={
          <>
            <Button size="xl" onClick={onViewPeers}>
              Xem Peer của tôi
            </Button>
            <Link href={HOME_PATH} className={secondary}>
              Về trang chủ
            </Link>
          </>
        }
      />
    )
  }

  return (
    <ResultCard
      tone="danger"
      title="Sở hữu Peer thất bại"
      amount={`${outcome.quantity} Peer`}
      rows={
        <>
          <SummaryRow label="Thời gian">{formatDateTime(outcome.at)}</SummaryRow>
          <SummaryRow label="Lý do" valueClassName="whitespace-normal">
            {outcome.reason}
          </SummaryRow>
          <SummaryRow label="Thành tiền">{formatVnd(outcome.totalVnd)}</SummaryRow>
          <SummaryRow label="Số dư ví">{formatVnd(user.balance_vnd)}</SummaryRow>
        </>
      }
      actions={
        <>
          <Button size="xl" onClick={onRetry}>
            Thử lại
          </Button>
          {support && (
            <a href={support} target="_blank" rel="noreferrer" className={secondary}>
              Liên hệ hỗ trợ
            </a>
          )}
        </>
      }
    />
  )
}
