"use client"

import { cn } from "cn"
import { AlertCircleIcon, Clock3Icon, Loader2Icon } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"

import { AgencyTierBadge } from "@/components/account/agency-tier-badge"
import { CardError } from "@/components/account/account-card"
import { useAccount, useAgency, useUpdateAvatar } from "@/components/account/use-account"
import { Skeleton } from "@/components/ui/skeleton"
import { tierProgress } from "@/lib/agency-tier"
import { initials } from "@/lib/format"
import type { AccountDetail, AgencyMe, KycStatus } from "@/types/account"

const MAX_AVATAR_BYTES = 10 * 1024 * 1024

/** Navy hero card: avatar, contact, KYC, agency tier, "Chỉnh sửa hồ sơ". */
export function ProfileCard({ onEdit }: { onEdit: () => void }) {
  const account = useAccount()
  const agency = useAgency()
  const tier =
    agency.data?.status === "APPROVED" ? tierProgress(agency.data.totalPackagesPurchased) : null

  return (
    <section className="relative flex flex-col gap-3.5 overflow-hidden rounded-panel bg-linear-130 from-profile-from to-profile-to to-70% px-5 pt-[22px] pb-5 text-white lg:px-6">
      {/* eslint-disable @next/next/no-img-element -- decorative static rings */}
      <img src="/icons/account/decor-lg.svg" alt="" width={180} height={180} className="pointer-events-none absolute -top-[70px] -right-[45px] lg:-right-[70px]" />
      <img src="/icons/account/decor-sm.svg" alt="" width={110} height={110} className="pointer-events-none absolute -top-[35px] -right-[10px] lg:-right-[35px]" />
      {/* eslint-enable @next/next/no-img-element */}

      {account.isPending ? (
        <ProfileSkeleton />
      ) : account.isError ? (
        <CardError onRetry={() => account.refetch()} className="relative" />
      ) : (
        <>
          <div className="relative flex items-center gap-4">
            <ProfileAvatar account={account.data} tier={tier?.current ?? null} />
            <div className="flex min-w-0 flex-col gap-[3px]">
              <p className="truncate text-lg font-bold lg:text-xl">{account.data.full_name}</p>
              <p className="truncate text-[13px] text-on-dark-muted">{account.data.email}</p>
              {account.data.phone_number && (
                <p className="text-[13px] text-on-dark-muted">{account.data.phone_number}</p>
              )}
            </div>
          </div>
          {/* kyc_completed follows users.kyc_verified_at, which is the source of truth. */}
          <KycPill status={account.data.onboarding?.kyc_completed ? "approved" : account.data.kyc.status} />
        </>
      )}

      {tier?.current && agency.data && (
        <TierBlock agency={agency.data} progress={tier} />
      )}

      <button
        type="button"
        onClick={onEdit}
        disabled={!account.data}
        className="relative h-10 w-full rounded-control border border-white/18 bg-white/10 text-[13px] font-semibold outline-none transition-colors hover:bg-white/15 focus-visible:ring-3 focus-visible:ring-white/30 disabled:opacity-60"
      >
        Chỉnh sửa hồ sơ
      </button>
    </section>
  )
}

function ProfileAvatar({
  account,
  tier,
}: {
  account: AccountDetail
  tier: ReturnType<typeof tierProgress>["current"]
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const updateAvatar = useUpdateAvatar()
  const src = account.avatar?.public_url ?? account.avatar?.url ?? null

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) return void toast.error("Vui lòng chọn một file ảnh.")
    if (file.size > MAX_AVATAR_BYTES) return void toast.error("Ảnh tối đa 10 MB.")
    updateAvatar.mutate(file)
  }

  return (
    <div className="relative size-[72px] shrink-0">
      <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-avatar-soft text-2xl font-bold text-foreground">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed BE URL
          <img src={src} alt={account.full_name} className="size-full object-cover" />
        ) : (
          initials(account.full_name || account.email)
        )}
      </div>
      {tier && <AgencyTierBadge tier={tier} size={26} className="absolute top-12 -left-0.5" />}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={updateAvatar.isPending}
        aria-label="Đổi ảnh đại diện"
        className="absolute top-12 left-12 flex size-[26px] items-center justify-center rounded-full bg-white text-foreground outline-none focus-visible:ring-3 focus-visible:ring-white/40"
      >
        {updateAvatar.isPending ? (
          <Loader2Icon className="size-3.5 animate-spin" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- static 14px icon
          <img src="/icons/account/camera.svg" alt="" width={14} height={14} />
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
    </div>
  )
}

const KYC: Record<KycStatus, { label: string; className: string; icon: React.ReactNode }> = {
  approved: {
    label: "Đã xác minh danh tính · CCCD",
    className: "bg-kyc-verified-soft text-kyc-verified",
    // eslint-disable-next-line @next/next/no-img-element -- static 13px icon
    icon: <img src="/icons/account/check.svg" alt="" width={13} height={13} />,
  },
  pending: {
    label: "Đang chờ xác minh danh tính",
    className: "bg-white/10 text-tier-gold-label",
    icon: <Clock3Icon className="size-[13px]" strokeWidth={2} />,
  },
  rejected: {
    label: "Xác minh danh tính bị từ chối",
    className: "bg-destructive/25 text-destructive-soft",
    icon: <AlertCircleIcon className="size-[13px]" strokeWidth={2} />,
  },
  none: {
    label: "Chưa xác minh danh tính",
    className: "bg-white/10 text-on-dark-muted",
    icon: <AlertCircleIcon className="size-[13px]" strokeWidth={2} />,
  },
}

function KycPill({ status }: { status: KycStatus }) {
  const kyc = KYC[status] ?? KYC.none
  return (
    <span
      className={cn(
        "relative inline-flex w-fit items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2.5 text-xs font-semibold",
        kyc.className
      )}
    >
      {kyc.icon}
      {kyc.label}
    </span>
  )
}

function TierBlock({
  agency,
  progress,
}: {
  agency: NonNullable<AgencyMe>
  progress: ReturnType<typeof tierProgress>
}) {
  const { current, next } = progress
  if (!current) return null
  return (
    <div className="relative flex items-center gap-3.5 rounded-action border border-tier-gold-border bg-linear-to-r from-tier-gold-from to-tier-gold-to px-3.5 py-3">
      <AgencyTierBadge tier={current} size={48} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[10.5px] font-semibold tracking-[0.84px] text-tier-gold-label">CẤP ĐẠI LÝ</p>
        <p className={cn("text-[17px] font-bold", current.nameClassName)}>{current.name}</p>
        <p className="text-[11.5px] text-on-dark-muted">
          Cấp cao nhất đã đạt · đơn {agency.totalPackagesPurchased} Peer
        </p>
        {next && (
          <Link
            href="/peer"
            className="w-fit text-[11.5px] font-medium text-on-dark-link outline-none hover:underline focus-visible:underline"
          >
            Đơn từ {next.fromPackage} Peer để lên {next.name} ›
          </Link>
        )}
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="relative flex flex-col gap-3.5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-[72px] rounded-full bg-white/10" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40 bg-white/10" />
          <Skeleton className="h-3.5 w-48 bg-white/10" />
          <Skeleton className="h-3.5 w-24 bg-white/10" />
        </div>
      </div>
      <Skeleton className="h-[27px] w-52 rounded-full bg-white/10" />
    </div>
  )
}
