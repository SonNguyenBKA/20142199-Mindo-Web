"use client"

import { CheckIcon, ClockIcon, Loader2Icon, XIcon } from "lucide-react"
import Link from "next/link"

import { StatusLayout, StatusRing, SummaryRow } from "@/components/topup/topup-shared"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatVnd } from "@/lib/format"
import type { TopupOrder } from "@/services/topup.service"

/** "21:14 · 16/09/2026" (Vietnam time) */
export function formatTimeDate(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  return `${get("hour")}:${get("minute")} · ${get("day")}/${get("month")}/${get("year")}`
}

const historyLink = (primary: boolean) => (
  <Link href="/lich-su-nap" className={buttonVariants({ size: "xl", variant: primary ? "default" : "outline" })}>
    Về lịch sử nạp
  </Link>
)

export function PendingStatus({ order }: { order: TopupOrder }) {
  return (
    <StatusLayout
      icon={
        <StatusRing tone="neutral">
          <Loader2Icon className="animate-spin" strokeWidth={2.4} aria-label="Đang đối soát" />
        </StatusRing>
      }
      title="Đang đối soát giao dịch"
      description="Hệ thống đang kiểm tra giao dịch chuyển khoản của bạn."
      actions={
        <>
          <p className="pb-2 text-center text-[13px] leading-[19px] text-muted-foreground">
            Thường mất dưới 1 phút. Bạn có thể rời trang, tiền vẫn vào ví.
          </p>
          {historyLink(true)}
        </>
      }
    >
      <SummaryRow label="Số tiền" value={formatVnd(order.amount)} />
      <SummaryRow label="Mã giao dịch" value={order.code} />
      <SummaryRow label="Thời gian" value={formatTimeDate(order.createdAt)} />
    </StatusLayout>
  )
}

export function SuccessStatus({
  order,
  paidAt,
  balanceAfter,
  onTopupAgain,
}: {
  order: TopupOrder
  paidAt?: string
  balanceAfter?: number
  onTopupAgain: () => void
}) {
  return (
    <StatusLayout
      icon={
        <StatusRing tone="success">
          <CheckIcon strokeWidth={2.6} />
        </StatusRing>
      }
      title="Nạp tiền thành công"
      description="Tiền đã vào ví Mindo của bạn."
      amount={formatVnd(order.amount, "+")}
      actions={
        <>
          {historyLink(true)}
          <Button size="xl" variant="outline" onClick={onTopupAgain}>
            Nạp thêm
          </Button>
        </>
      }
    >
      {balanceAfter !== undefined && <SummaryRow label="Số dư mới" value={formatVnd(balanceAfter)} />}
      <SummaryRow label="Mã giao dịch" value={order.code} />
      <SummaryRow label="Thời gian" value={formatTimeDate(paidAt ?? order.createdAt)} />
    </StatusLayout>
  )
}

export function ExpiredStatus({
  order,
  onRenew,
  onCancel,
  renewing,
}: {
  order: TopupOrder
  onRenew: () => void
  onCancel: () => void
  renewing?: boolean
}) {
  return (
    <StatusLayout
      icon={
        <StatusRing tone="danger">
          <ClockIcon strokeWidth={2.2} />
        </StatusRing>
      }
      title="Mã QR đã hết hạn"
      description={`Mã chỉ có hiệu lực ${Math.round(order.ttlSeconds / 60)} phút. Nếu bạn đã chuyển khoản, giao dịch vẫn được đối soát bình thường.`}
      actions={
        <>
          <Button size="xl" loading={renewing} onClick={onRenew}>
            Tạo mã QR mới
          </Button>
          <Button size="xl" variant="outline" onClick={onCancel} className="h-11 text-muted-foreground lg:h-14 lg:text-foreground">
            Huỷ giao dịch
          </Button>
        </>
      }
    >
      <SummaryRow label="Số tiền" value={formatVnd(order.amount)} />
      <SummaryRow label="Mã giao dịch" value={order.code} />
    </StatusLayout>
  )
}

export function FailedStatus({ order, onRetry }: { order: TopupOrder; onRetry: () => void }) {
  return (
    <StatusLayout
      icon={
        <StatusRing tone="danger">
          <XIcon strokeWidth={2.6} />
        </StatusRing>
      }
      title="Chưa đối soát được giao dịch"
      description={`Giao dịch không được xác nhận. Nếu bạn đã chuyển khoản, hãy liên hệ hỗ trợ kèm mã ${order.code}.`}
      actions={
        <>
          <Button size="xl" onClick={onRetry}>
            Nạp lại
          </Button>
          {historyLink(false)}
        </>
      }
    >
      <SummaryRow label="Số tiền" value={formatVnd(order.amount)} />
      <SummaryRow label="Mã giao dịch" value={order.code} />
    </StatusLayout>
  )
}
