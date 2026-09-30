import { cn } from "cn"

import { AgencyTierBadge } from "@/components/account/agency-tier-badge"
import { tierByCode, type AgencyTierCode } from "@/lib/agency-tier"
import { formatUsd } from "@/lib/format"
import { tierUnitUsd } from "@/lib/peer-pricing"
import type { TierRule } from "@/types/peer"

const range = (t: TierRule, short: boolean) =>
  t.to_package === null
    ? `Từ ${t.from_package}${short ? "" : " Peer"}`
    : `${t.from_package} – ${t.to_package}${short && t.from_package > 1 ? "" : " Peer"}`

/**
 * Figma "Mức chiết khấu" (desktop 1859:1587, mobile 1875:1653). The discount is
 * cumulative on the BE, so the highlighted card is the tier this order reaches.
 */
export function TierCards({
  tiers,
  baseUsd,
  active,
  ownedBefore,
}: {
  tiers: TierRule[]
  baseUsd: number
  active: AgencyTierCode | null
  ownedBefore: number
}) {
  return (
    <div className="flex flex-col gap-2.5 lg:gap-3.5">
      <div className="flex flex-col gap-0.5 lg:gap-1">
        <h2 className="text-[15px] font-semibold text-foreground lg:text-lg">
          Mức chiết khấu<span className="hidden lg:inline"> theo số lượng</span>
        </h2>
        <p className="text-xs text-muted-foreground lg:text-[13px]">
          Tính theo tổng số Peer bạn sở hữu · đang có {ownedBefore.toLocaleString("vi-VN")} Peer
        </p>
      </div>
      <div className="flex gap-2 lg:gap-4">
        {tiers.map((t) => {
          const meta = tierByCode(t.code)
          const on = t.code === active
          return (
            <div
              key={t.code}
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-[3px] rounded-control px-2.5 py-3 lg:gap-1.5 lg:rounded-[14px] lg:px-5 lg:py-[18px]",
                on ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground"
              )}
            >
              {/* Mobile head: "ĐẠI LÝ" + medal, name below */}
              <div className="flex items-center justify-between lg:hidden">
                <span
                  className={cn(
                    "text-[9.5px] font-medium tracking-[0.76px]",
                    on ? "text-on-dark-muted" : "text-placeholder"
                  )}
                >
                  ĐẠI LÝ
                </span>
                {meta && <AgencyTierBadge tier={meta} size={24} />}
              </div>
              <span className="text-[12.5px] font-semibold lg:hidden">{meta?.name.replace(/^Đại lý /, "")}</span>
              {/* Desktop head: medal + full name */}
              <div className="hidden items-center gap-1.5 lg:flex">
                {meta && <AgencyTierBadge tier={meta} size={28} />}
                <span className="truncate text-sm font-semibold">{meta?.name ?? t.title}</span>
              </div>
              <span className={cn("text-[11px] lg:text-xs", on ? "text-on-dark-muted" : "text-muted-foreground")}>
                <span className="lg:hidden">{range(t, true)}</span>
                <span className="hidden lg:inline">{range(t, false)}</span>
              </span>
              <span className="text-[22px] leading-tight font-bold lg:text-[30px]">−{t.discount_percent}%</span>
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <span
                  className={cn(
                    "shrink-0 text-[11px] font-medium whitespace-nowrap lg:text-[13px]",
                    on ? "text-on-dark-soft" : "text-muted-foreground"
                  )}
                >
                  {formatUsd(tierUnitUsd(baseUsd, t))} / Peer
                </span>
                {on && (
                  <span className="hidden shrink-0 rounded-full bg-white/16 px-2 py-[3px] text-[10.5px] font-semibold lg:inline">
                    Đang áp dụng
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
