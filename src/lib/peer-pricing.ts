import type { AgencyTierCode } from "@/lib/agency-tier"
import type { TierRule } from "@/types/peer"

export type PriceSegment = {
  tier: AgencyTierCode
  from: number
  to: number
  quantity: number
  discountPercent: number
  grossVnd: number
  netVnd: number
}

/**
 * Same formula as Mindo-API `priceAgencyPackages`: Peers are numbered
 * `totalBefore + 1 … totalBefore + quantity` and each run is priced at the
 * discount of the tier it falls in, rounded per run. Only a preview — the
 * server's quote is what the buyer pays.
 */
export function pricePeers(totalBefore: number, quantity: number, unitPriceVnd: number, tiers: TierRule[]) {
  const start = totalBefore + 1
  const end = totalBefore + quantity
  const segments: PriceSegment[] = tiers.flatMap((t) => {
    const from = Math.max(start, t.from_package)
    const to = Math.min(end, t.to_package ?? end)
    if (from > to) return []
    const segmentQuantity = to - from + 1
    const grossVnd = unitPriceVnd * segmentQuantity
    return [
      {
        tier: t.code,
        from,
        to,
        quantity: segmentQuantity,
        discountPercent: t.discount_percent,
        grossVnd,
        netVnd: Math.round(grossVnd * (1 - t.discount_percent / 100)),
      },
    ]
  })
  const grossVnd = unitPriceVnd * quantity
  const netVnd = segments.reduce((sum, s) => sum + s.netVnd, 0)
  return { start, end, segments, grossVnd, netVnd, discountVnd: grossVnd - netVnd, attained: tierAt(end, tiers) }
}

/** The tier a Peer number falls in (null before the first Peer). */
export const tierAt = (packageNumber: number, tiers: TierRule[]) =>
  tiers.find((t) => packageNumber >= t.from_package && (t.to_package === null || packageNumber <= t.to_package)) ??
  null

/** The next tier up from a total, and how many more Peers it takes. */
export function nextTier(total: number, tiers: TierRule[]) {
  const next = tiers.find((t) => t.from_package > total)
  return next ? { tier: next, missing: next.from_package - total } : null
}

/** USD price of one Peer inside a tier. */
export const tierUnitUsd = (baseUsd: number, tier: TierRule) => baseUsd * (1 - tier.discount_percent / 100)
