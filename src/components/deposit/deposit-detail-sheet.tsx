"use client"

import { cn } from "cn"
import { CheckIcon, ChevronLeftIcon, ClockIcon, WifiIcon, XIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/app/empty-state"
import { HeaderIconButton } from "@/components/app/mobile-header"
import { statusSoftBg } from "@/components/deposit/deposit-status"
import { useDepositDetail } from "@/components/deposit/use-deposit-history"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime, formatVnd } from "@/lib/format"
import { depositService } from "@/services/deposit.service"
import type { DepositDetail, DepositStatus } from "@/types/deposit"

type Row = { label: string; value: React.ReactNode; tone?: "success" }
type Section = { title: string; rows: Row[] }

function buildSections(d: DepositDetail): Section[] {
  const free = d.overview.fee_vnd === "0" || !d.overview.fee_vnd
  return [
    {
      title: "Tổng quan giao dịch",
      rows: [
        { label: "Mã giao dịch", value: d.transaction_code },
        { label: "Phương thức", value: d.overview.method_label },
        { label: "Loại giao dịch", value: "Nạp tiền" },
        { label: "Số tiền nạp", value: formatVnd(d.overview.paid_amount_vnd ?? d.amount_vnd) },
        free
          ? { label: "Phí giao dịch", value: "Miễn phí", tone: "success" }
          : { label: "Phí giao dịch", value: formatVnd(d.overview.fee_vnd) },
      ],
    },
    {
      title: "Nguồn tiền và bên gửi",
      rows: [
        { label: "Thời gian giao dịch", value: formatDateTime(d.occurred_at) },
        { label: "Số tài khoản nguồn", value: d.source.source_account_masked ?? "—" },
        { label: "Nội dung chuyển khoản", value: d.source.transfer_content || "—" },
        { label: "Ngân hàng gửi", value: d.source.sender_bank ?? "—" },
      ],
    },
    {
      title: "Ghi nhận vào ví",
      rows: [
        { label: "Tài khoản nhận", value: d.wallet_credit.receiving_account },
        { label: "Số dư trước nạp", value: formatVnd(d.wallet_credit.balance_before_vnd) },
        { label: "Số dư sau nạp", value: formatVnd(d.wallet_credit.balance_after_vnd) },
      ],
    },
  ]
}

const STATUS_ICON: Record<DepositStatus, React.ReactNode> = {
  completed: <CheckIcon strokeWidth={2.5} />,
  pending: <ClockIcon strokeWidth={2.2} />,
  failed: <XIcon strokeWidth={2.5} />,
}

const contactSupport = () =>
  toast.info("Kênh hỗ trợ đang được cập nhật. Vui lòng thử lại sau.")

/** Right drawer on desktop, full-screen page-like sheet on mobile. */
export function DepositDetailSheet({
  id,
  onClose,
}: {
  id: string | null
  onClose: () => void
}) {
  const query = useDepositDetail(id)
  const detail = query.data

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 overflow-y-auto border-0 bg-card p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none lg:data-[side=right]:w-[480px]"
      >
        {/* Header */}
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

        {query.isPending && id ? (
          <DetailSkeleton />
        ) : query.isError || !detail ? (
          <EmptyState
            tone="danger"
            icon={<WifiIcon />}
            title="Không tải được giao dịch"
            description="Kiểm tra kết nối mạng của bạn rồi thử lại."
            action={
              <Button size="action" className="w-[180px]" onClick={() => query.refetch()}>
                Thử lại
              </Button>
            }
            className="flex-1"
          />
        ) : (
          <>
            <DesktopDetail detail={detail} />
            <MobileDetail detail={detail} />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function ReceiptButton({ detail, className }: { detail: DepositDetail; className?: string }) {
  if (!detail.receipt.available) {
    return (
      <Button size="action" disabled className={className}>
        Tải biên lai
      </Button>
    )
  }
  return (
    <a
      href={depositService.receiptUrl(detail.id)}
      download
      className={cn(buttonVariants({ size: "action" }), className)}
    >
      Tải biên lai
    </a>
  )
}

// ---------- Desktop (≥ lg) ----------

function DesktopDetail({ detail }: { detail: DepositDetail }) {
  return (
    <div className="hidden flex-1 flex-col px-8 pb-8 lg:flex">
      <div className={cn("mt-5 rounded-2xl px-5 py-4", statusSoftBg[detail.status])}>
        <p className="text-[13px] leading-5 font-semibold text-foreground">{detail.title}</p>
        <p className="mt-0.5 text-[28px] leading-[38px] font-bold text-foreground">
          {formatVnd(detail.amount_vnd, "+")}
        </p>
        <p className="text-xs leading-[18px] text-muted-foreground">{formatDateTime(detail.occurred_at)}</p>
      </div>
      {detail.status !== "completed" && detail.status_message && (
        <p className="mt-3 text-[12.5px] leading-5 text-muted-foreground">{detail.status_message}</p>
      )}

      {buildSections(detail).map((section) => (
        <section key={section.title} className="mt-6 first-of-type:mt-6">
          <h3 className="mb-2 text-[13px] leading-5 font-semibold text-foreground">{section.title}</h3>
          <dl>
            {section.rows.map((row) => (
              <div key={row.label} className="flex h-[34px] items-center justify-between gap-4 text-[12.5px]">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="truncate text-right font-semibold text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
        <ReceiptButton detail={detail} />
        <Button size="action" variant="outline" onClick={contactSupport}>
          Liên hệ hỗ trợ
        </Button>
      </div>
    </div>
  )
}

// ---------- Mobile (< lg) ----------

function MobileDetail({ detail }: { detail: DepositDetail }) {
  return (
    <div className="flex flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            "mt-5 flex size-16 items-center justify-center rounded-full text-foreground [&_svg]:size-7",
            statusSoftBg[detail.status]
          )}
        >
          {STATUS_ICON[detail.status]}
        </span>
        <p className="mt-4 text-xl leading-7 font-bold text-foreground">{detail.title}</p>
        <p className="mt-1.5 text-[28px] leading-[38px] font-bold text-foreground">
          {formatVnd(detail.amount_vnd, "+")}
        </p>
        <p className="mt-1.5 text-xs leading-[18px] text-muted-foreground">
          {formatDateTime(detail.occurred_at)}
        </p>
      </div>

      {buildSections(detail).map((section) => (
        <section key={section.title} className="mt-6">
          <h3 className="mb-1.5 text-[15px] leading-[22px] font-semibold text-foreground">{section.title}</h3>
          <dl className="rounded-2xl border border-border bg-muted px-4">
            {section.rows
              .filter((row) => row.label !== "Loại giao dịch" && row.label !== "Thời gian giao dịch")
              .map((row) => (
                <div
                  key={row.label}
                  className="flex min-h-11 items-center justify-between gap-4 border-b border-border py-3 text-[13px] leading-5 last:border-b-0"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd
                    className={cn(
                      "text-right font-semibold",
                      row.tone === "success" ? "text-success-foreground" : "text-foreground"
                    )}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ))}

      <section className="mt-6">
        <h3 className="mb-1.5 text-[15px] leading-[22px] font-semibold text-foreground">Ghi chú</h3>
        <p className="rounded-2xl border border-border bg-muted p-4 text-[13px] leading-5 text-muted-foreground">
          {detail.status_message && detail.status !== "completed"
            ? `${detail.status_message} ${detail.note}`
            : detail.note}
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-3">
        <Button className="h-[52px] rounded-action text-[15px] font-bold" onClick={contactSupport}>
          Liên hệ hỗ trợ
        </Button>
        {detail.receipt.available && (
          <ReceiptButton
            detail={detail}
            className="h-[52px] border-border bg-muted text-[15px] font-bold text-foreground hover:bg-border"
          />
        )}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-6 pt-5 lg:px-8" aria-busy aria-label="Đang tải">
      <Skeleton className="h-[104px] w-full rounded-2xl" />
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}
