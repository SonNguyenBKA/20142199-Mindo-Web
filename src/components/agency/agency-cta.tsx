"use client"

import { cn } from "cn"
import { ChevronRightIcon, StoreIcon } from "lucide-react"
import Link from "next/link"

import { useAgency } from "@/components/account/use-account"
import { buttonVariants } from "@/components/ui/button"
import { AGENCY_APPLY_PATH } from "@/lib/routes"

const PENDING_COPY = {
  PENDING: "Hồ sơ đại lý của bạn đang chờ duyệt.",
  REJECTED: "Hồ sơ đại lý của bạn chưa được duyệt.",
  LOCKED: "Tài khoản đại lý của bạn đang bị khoá.",
}

/** Invitation card for non-agencies (Peer › Đại lý). Hidden once approved. */
export function AgencyCtaCard({ className }: { className?: string }) {
  const agency = useAgency()
  if (agency.isPending || agency.isError || agency.data?.status === "APPROVED") return null
  const status = agency.data?.status

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-panel bg-linear-145 from-profile-from to-profile-to to-70% px-5 py-5 text-white lg:flex-row lg:items-center lg:px-7",
        className
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-white/10">
        <StoreIcon className="size-5 text-tier-gold" strokeWidth={1.8} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 className="text-base font-bold">{status ? "Hồ sơ đại lý" : "Trở thành đại lý Mindo"}</h2>
        <p className="text-[12.5px] leading-[18px] text-on-dark-muted">
          {status
            ? PENDING_COPY[status]
            : "Sở hữu Peer theo gói với chiết khấu đến 40% và nhận mã đại lý riêng để giới thiệu."}
        </p>
      </div>
      <Link
        href={AGENCY_APPLY_PATH}
        className={cn(buttonVariants({ size: "md" }), "shrink-0 bg-white text-primary hover:bg-white/90")}
      >
        {status ? "Xem hồ sơ" : "Đăng ký đại lý"}
      </Link>
    </section>
  )
}

/** One-line nudge on the buy form for accounts that are not agencies yet. */
export function AgencyHint() {
  const agency = useAgency()
  if (agency.isPending || agency.isError || agency.data?.status === "APPROVED") return null
  return (
    <Link
      href={AGENCY_APPLY_PATH}
      className="flex items-center gap-2.5 rounded-control border border-referral-border bg-info-soft px-3 py-2.5 text-xs text-foreground outline-none transition-colors hover:bg-referral-to focus-visible:ring-2 focus-visible:ring-ring/30 lg:px-4 lg:py-3 lg:text-[13px]"
    >
      <StoreIcon className="size-[18px] shrink-0 text-link" strokeWidth={1.8} />
      <span className="flex-1">
        Là <b className="font-semibold">đại lý Mindo</b> để sở hữu Peer theo gói với chiết khấu đến 40%.
      </span>
      <span className="flex shrink-0 items-center font-semibold text-link">
        {agency.data ? "Xem hồ sơ" : "Đăng ký"}
        <ChevronRightIcon className="size-4" strokeWidth={2} />
      </span>
    </Link>
  )
}
