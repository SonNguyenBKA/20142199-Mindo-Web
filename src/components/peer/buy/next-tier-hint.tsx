import { tierByCode } from "@/lib/agency-tier"
import { formatUsd } from "@/lib/format"
import { nextTier, tierUnitUsd } from "@/lib/peer-pricing"
import type { TierRule } from "@/types/peer"

/** Figma "Gợi ý cấp": how many more Peers reach the next tier, counted from the total after this order. */
export function NextTierHint({
  tiers,
  baseUsd,
  totalAfter,
  maxExtra,
  onAdd,
}: {
  tiers: TierRule[]
  baseUsd: number
  totalAfter: number
  /** How many more Peers this order can still take; the "Thêm" button hides past it. */
  maxExtra: number
  onAdd: (extra: number) => void
}) {
  const next = nextTier(totalAfter, tiers)
  if (!next) return null
  const name = tierByCode(next.tier.code)?.name ?? next.tier.title
  return (
    <div className="flex items-center gap-2.5 rounded-control border border-referral-border bg-info-soft px-3 py-2.5 lg:gap-3 lg:px-4 lg:py-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- static 20px icon */}
      <img src="/icons/account/up.svg" alt="" width={20} height={20} className="size-[18px] shrink-0 lg:size-5" />
      <p className="min-w-0 flex-1 text-xs text-foreground lg:text-[13px]">
        Sở hữu thêm <b className="font-semibold">{next.missing} Peer</b> để lên <b className="font-semibold">{name}</b> · giảm{" "}
        {next.tier.discount_percent}%
        <span className="hidden lg:inline">, chỉ còn {formatUsd(tierUnitUsd(baseUsd, next.tier))} / Peer</span>
      </p>
      {next.missing <= maxExtra && (
        <button
          type="button"
          onClick={() => onAdd(next.missing)}
          className="hidden shrink-0 rounded-sm text-[13px] font-semibold whitespace-nowrap text-link outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/30 lg:block"
        >
          Thêm {next.missing} Peer
        </button>
      )}
    </div>
  )
}
