"use client"

import Link from "next/link"
import type * as React from "react"

import { IconTile } from "@/components/account/setting-row"
import { useNftCount, useReferralDashboard } from "@/components/account/use-account"
import { useSession } from "@/components/app/session-context"
import { Skeleton } from "@/components/ui/skeleton"
import { formatVnd } from "@/lib/format"

/** Wallet · Peer owned · commission summary. */
export function OverviewCard() {
  const { user } = useSession()
  const nfts = useNftCount()
  const referrals = useReferralDashboard()

  return (
    <section className="flex flex-col divide-y divide-border rounded-block border border-border bg-card px-4 py-2 lg:px-5">
      <OverviewRow
        icon="/icons/account/wallet.svg"
        label="Số dư ví"
        value={formatVnd(user.balance_vnd)}
        action={{ label: "Nạp tiền", href: "/nap-tien" }}
      />
      <OverviewRow
        icon="/icons/account/peer.svg"
        label="Peer đang sở hữu"
        value={nfts.isPending ? null : nfts.isError ? "—" : `${nfts.data} Peer`}
        action={{ label: "Xem", href: "/peer" }}
      />
      <OverviewRow
        icon="/icons/account/coin.svg"
        label="Tổng hoa hồng"
        value={
          referrals.isPending
            ? null
            : referrals.isError
              ? "—"
              : formatVnd(referrals.data.total_commission_vnd)
        }
      />
    </section>
  )
}

function OverviewRow({
  icon,
  label,
  value,
  action,
}: {
  icon: string
  label: string
  /** null while loading */
  value: React.ReactNode | null
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex items-center gap-3 py-[9px]">
      <IconTile src={icon} tone="info" className="size-9" />
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <p className="text-xs text-muted-foreground">{label}</p>
        {value === null ? (
          <Skeleton className="my-0.5 h-4 w-28" />
        ) : (
          <p className="truncate text-[15px] font-bold text-foreground">{value}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 rounded-sm text-[12.5px] font-semibold text-link outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
