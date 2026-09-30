// Tier thresholds mirror Mindo-API (api/src/phase2/phase2.domain.ts → agencyTiers).
// Display names follow Figma; the BE only labels them "Đại lý 1/2/3".

export type AgencyTierCode = "TIER_1" | "TIER_2" | "TIER_3"

export type AgencyTier = {
  code: AgencyTierCode
  name: string
  fromPackage: number
  /** Discount on Peers numbered inside this tier (BE `discountRate` × 100). */
  discountPercent: number
  /** Figma medal "Mindo/Huy hiệu/<name>". */
  badgeSrc: string
  /** Text colour class for the tier name. */
  nameClassName: string
}

export const AGENCY_TIERS: AgencyTier[] = [
  {
    code: "TIER_1",
    name: "Đại lý Hoàng Kim",
    fromPackage: 1,
    discountPercent: 20,
    badgeSrc: "/icons/account/tier-gold.svg",
    nameClassName: "text-tier-gold",
  },
  {
    code: "TIER_2",
    name: "Đại lý Bạch Kim",
    fromPackage: 50,
    discountPercent: 30,
    badgeSrc: "/icons/account/tier-platinum.svg",
    nameClassName: "text-tier-platinum",
  },
  {
    code: "TIER_3",
    name: "Đại lý Kim Cương",
    fromPackage: 200,
    discountPercent: 40,
    badgeSrc: "/icons/account/tier-diamond.svg",
    nameClassName: "text-tier-diamond",
  },
]

/** Current tier for a package total (null before the first package) and the next one up. */
export function tierProgress(totalPackages: number) {
  const index = AGENCY_TIERS.findLastIndex((t) => totalPackages >= t.fromPackage)
  return {
    current: index >= 0 ? AGENCY_TIERS[index] : null,
    next: AGENCY_TIERS[index + 1] ?? null,
  }
}

/** Display data (name, medal, colour) for a BE tier code. */
export const tierByCode = (code: AgencyTierCode | null | undefined) =>
  AGENCY_TIERS.find((t) => t.code === code) ?? null
