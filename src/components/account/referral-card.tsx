"use client"

import { cn } from "cn"
import { CheckIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { CardError } from "@/components/account/account-card"
import { useReferralDashboard } from "@/components/account/use-account"
import { Skeleton } from "@/components/ui/skeleton"

/** "Mời đại lý mới" card with the user's own referral code. */
export function ReferralCard() {
  const referrals = useReferralDashboard()
  const code = referrals.data?.referral_code
  const rate = referrals.data?.settings?.direct_rate_percent
  const { copied, copy } = useCopy()

  return (
    <section className="relative flex flex-col gap-3.5 overflow-hidden rounded-panel border border-referral-border bg-linear-150 from-referral-from to-referral-to to-70% p-4 lg:bg-linear-140 lg:p-5">
      {/* eslint-disable @next/next/no-img-element -- decorative static rings (mobile only) */}
      <img src="/icons/account/decor-referral-lg.svg" alt="" width={120} height={120} className="pointer-events-none absolute -top-[53px] -right-[42px] lg:hidden" />
      <img src="/icons/account/decor-referral-sm.svg" alt="" width={72} height={72} className="pointer-events-none absolute -top-[29px] -right-[18px] lg:hidden" />
      {/* eslint-enable @next/next/no-img-element */}

      <div className="relative flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-card lg:shadow-icon-tile">
          {/* eslint-disable-next-line @next/next/no-img-element -- static 22px icon */}
          <img src="/icons/account/gift.svg" alt="" width={22} height={22} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm font-bold text-foreground lg:text-[15px]">
            Mời đại lý mới<span className="lg:hidden">{rate ? `, nhận ${rate}%` : ""}</span>
          </p>
          <p className="text-[11.5px] text-referral-muted lg:text-xs">
            {rate ? (
              <>
                <span className="lg:hidden">Nhận {rate}% giá trị mỗi gói họ sở hữu Peer</span>
                <span className="hidden lg:inline">Nhận {rate}% mỗi gói họ sở hữu</span>
              </>
            ) : (
              "Chia sẻ mã để mời bạn bè tham gia Mindo"
            )}
          </p>
        </div>
      </div>

      {referrals.isError ? (
        <CardError onRetry={() => referrals.refetch()} className="relative" />
      ) : (
        <>
          <div className="relative flex items-center gap-2 rounded-action border-[1.2px] border-dashed border-referral-dash bg-white/92 py-1.5 pr-1.5 pl-4 lg:bg-card lg:px-4 lg:py-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-[10px] font-semibold tracking-[0.8px] text-referral-label">MÃ CỦA BẠN</p>
              {code ? (
                <p className="truncate text-[17px] font-bold tracking-[1.02px] text-foreground lg:text-lg lg:tracking-[1.08px]">
                  {code}
                </p>
              ) : (
                <Skeleton className="my-1 h-5 w-36" />
              )}
            </div>
            <CopyCodeButton
              size="sm"
              disabled={!code}
              copied={copied}
              onClick={() => code && copy(code)}
              className="lg:hidden"
            />
          </div>
          <CopyCodeButton
            size="lg"
            disabled={!code}
            copied={copied}
            onClick={() => code && copy(code)}
            className="hidden lg:flex"
          />
        </>
      )}
    </section>
  )
}

function CopyCodeButton({
  size,
  copied,
  className,
  ...props
}: React.ComponentProps<"button"> & { size: "sm" | "lg"; copied: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex shrink-0 items-center justify-center font-bold text-white outline-none transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60",
        "bg-brand-deep",
        size === "sm"
          ? "gap-1.5 rounded-tile py-2.5 pr-3.5 pl-3 text-xs shadow-brand-button"
          : "w-full gap-2 rounded-control py-3 text-[13px]",
        className
      )}
      {...props}
    >
      {copied ? (
        <CheckIcon className="size-4" strokeWidth={2.2} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- static 16px icon
        <img src="/icons/account/copy.svg" alt="" width={16} height={16} />
      )}
      {size === "sm" ? "Sao chép" : "Sao chép mã"}
    </button>
  )
}

function useCopy() {
  const [copied, setCopied] = React.useState(false)
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Đã sao chép mã giới thiệu")
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Không sao chép được. Vui lòng sao chép thủ công.")
    }
  }
  return { copied, copy }
}
