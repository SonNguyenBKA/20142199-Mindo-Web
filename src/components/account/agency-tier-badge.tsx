import { cn } from "cn"

import type { AgencyTier } from "@/lib/agency-tier"

/** Tier medal (Figma "Mindo/Huy hiệu/…"). */
export function AgencyTierBadge({
  tier,
  size,
  className,
}: {
  tier: AgencyTier
  size: number
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG medal
    <img
      src={tier.badgeSrc}
      alt={tier.name}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  )
}
