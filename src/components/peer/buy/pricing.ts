import { pricePeers } from "@/lib/peer-pricing"
import type { AgencyTierCode } from "@/lib/agency-tier"
import type { PurchaseConfig, PurchaseQuote } from "@/types/peer"

export type DiscountLine = { tier: AgencyTierCode; from: number; to: number; discountPercent: number; discountUsd: number }

/** Everything the buy form shows about the price, from the server quote or the local preview. */
export type OrderPricing = {
  quantity: number
  grossUsd: number
  netUsd: number
  netVnd: number
  usdVndRate: number
  unitUsd: number
  discounts: DiscountLine[]
  attained: AgencyTierCode | null
  totalAfter: number
  balanceVnd: number
  shortageVnd: number
  kycVerified: boolean
  /** Only known once the server has priced exactly this order. */
  canPurchase: boolean | null
}

/** Instant preview with the BE formula, while the quote for this exact order is on its way. */
export function previewPricing(config: PurchaseConfig, quantity: number): OrderPricing {
  const rate = Number(config.usd_vnd_rate)
  const p = pricePeers(config.total_packages_purchased, quantity, Number(config.unit_price_vnd), config.tiers)
  const balanceVnd = Number(config.balance_vnd)
  return {
    quantity,
    grossUsd: p.grossVnd / rate,
    netUsd: p.netVnd / rate,
    netVnd: p.netVnd,
    usdVndRate: rate,
    unitUsd: Number(config.base_price_usd),
    discounts: p.segments.map((s) => ({
      tier: s.tier,
      from: s.from,
      to: s.to,
      discountPercent: s.discountPercent,
      discountUsd: (s.grossVnd - s.netVnd) / rate,
    })),
    attained: p.attained?.code ?? null,
    totalAfter: p.end,
    balanceVnd,
    shortageVnd: Math.max(0, p.netVnd - balanceVnd),
    kycVerified: config.kyc_verified,
    canPurchase: null,
  }
}

/** The server's numbers for this order — what the buyer will actually pay. */
export function quotePricing(quote: PurchaseQuote): OrderPricing {
  const rate = Number(quote.usd_vnd_rate)
  return {
    quantity: quote.amount,
    grossUsd: Number(quote.gross_amount_usd),
    netUsd: Number(quote.net_amount_usd),
    netVnd: Number(quote.total_vnd),
    usdVndRate: rate,
    unitUsd: Number(quote.unit_price_usd),
    discounts: quote.pricing_breakdown.map((s) => ({
      tier: s.tier,
      from: s.from_package,
      to: s.to_package,
      discountPercent: Math.round(s.discount_rate * 100),
      discountUsd: (s.gross_amount_vnd - s.net_amount_vnd) / rate,
    })),
    attained: quote.agency_title,
    totalAfter: quote.total_packages_after,
    balanceVnd: Number(quote.balance_vnd),
    shortageVnd: Number(quote.shortage_vnd),
    kycVerified: quote.kyc_verified,
    canPurchase: quote.can_purchase,
  }
}
