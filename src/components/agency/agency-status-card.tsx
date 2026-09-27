"use client"

import { cn } from "cn"
import { CheckIcon, Clock3Icon, LockIcon, XIcon } from "lucide-react"
import Link from "next/link"
import type * as React from "react"

import { useAccountSettings } from "@/components/account/use-account"
import { SummaryRow } from "@/components/peer/peer-shared"
import { buttonVariants } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import type { AgencyMe, AgencyStatus } from "@/types/account"

type Agency = NonNullable<AgencyMe>

const STATUS: Record<AgencyStatus, { icon: React.ReactNode; tone: string; title: string; text: string }> = {
  PENDING: {
    icon: <Clock3Icon strokeWidth={2} />,
    tone: "bg-warning-soft text-warning-foreground",
    title: "Hồ sơ đang chờ duyệt",
    text: "Mindo sẽ xem xét hồ sơ của bạn. Kết quả hiển thị tại đây ngay khi được duyệt.",
  },
  APPROVED: {
    icon: <CheckIcon strokeWidth={2} />,
    tone: "bg-success-soft text-success-foreground",
    title: "Bạn đã là đại lý Mindo",
    text: "Dùng mã đại lý để giới thiệu và sở hữu Peer theo gói với mức chiết khấu đại lý.",
  },
  REJECTED: {
    icon: <XIcon strokeWidth={2} />,
    tone: "bg-destructive-soft text-destructive",
    title: "Hồ sơ đại lý chưa được duyệt",
    text: "Liên hệ bộ phận hỗ trợ Mindo để được hướng dẫn cập nhật hồ sơ.",
  },
  LOCKED: {
    icon: <LockIcon strokeWidth={2} />,
    tone: "bg-destructive-soft text-destructive",
    title: "Tài khoản đại lý đang bị khoá",
    text: "Liên hệ bộ phận hỗ trợ Mindo để được mở khoá.",
  },
}

/** Where the application stands (PENDING / APPROVED / REJECTED / LOCKED). */
export function AgencyStatusCard({ agency }: { agency: Agency }) {
  const status = STATUS[agency.status]
  const support = useAccountSettings().data?.support_center_url
  const needsSupport = agency.status === "REJECTED" || agency.status === "LOCKED"

  return (
    <section className="flex flex-col gap-5 rounded-block border border-border bg-card p-5 lg:p-8">
      <div className="flex items-start gap-4">
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full [&_svg]:size-6", status.tone)}>
          {status.icon}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-foreground lg:text-xl">{status.title}</h2>
          <p className="text-[13px] leading-5 text-muted-foreground">{status.text}</p>
        </div>
      </div>

      {agency.status === "REJECTED" && agency.rejectionReason && (
        <div className="rounded-control bg-destructive-soft px-4 py-3 text-[13px] leading-5 text-destructive">
          <b className="font-semibold">Lý do:</b> {agency.rejectionReason}
        </div>
      )}

      <div className="flex flex-col divide-y divide-border rounded-block bg-muted px-4 *:py-3 lg:bg-transparent lg:px-0">
        <SummaryRow label="Mã đại lý" valueClassName="font-bold tracking-[0.6px]">{agency.code}</SummaryRow>
        <SummaryRow label="Tên đại lý">{agency.businessName}</SummaryRow>
        <SummaryRow label="Số điện thoại">{agency.phone}</SummaryRow>
        <SummaryRow label="Địa chỉ" valueClassName="whitespace-normal">{agency.address}</SummaryRow>
        {agency.taxCode && <SummaryRow label="Mã số thuế">{agency.taxCode}</SummaryRow>}
        {agency.parent && (
          <SummaryRow label="Tuyến trên">
            {agency.parent.code} · {agency.parent.user.fullName}
          </SummaryRow>
        )}
        <SummaryRow label="Ngày gửi">{formatDateTime(agency.createdAt)}</SummaryRow>
        {agency.approvedAt && <SummaryRow label="Ngày duyệt">{formatDateTime(agency.approvedAt)}</SummaryRow>}
      </div>

      {agency.status === "APPROVED" && (
        <Link href="/peer" className={cn(buttonVariants({ size: "xl" }), "lg:w-60")}>
          Sở hữu Peer
        </Link>
      )}
      {needsSupport && support && (
        <a href={support} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "xl" }), "lg:w-60")}>
          Liên hệ hỗ trợ
        </a>
      )}
    </section>
  )
}
