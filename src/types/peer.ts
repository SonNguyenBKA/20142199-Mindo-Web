import type { AgencyTierCode } from "@/lib/agency-tier"

/** Shapes from Mindo-API Peer (NFT) endpoints — only the fields the UI reads. Raw Prisma rows are camelCase. */

/** `GET /nfts` — a Peer collection on sale. */
export type NftProduct = {
  id: string
  name: string
  symbol: string
  description: string | null
  imageUrl: string | null
  unitPriceVnd: string
  totalSupply: number
  soldCount: number
  isActive: boolean
}

/** One discount tier as `GET /investor/invest/config` returns it. */
export type TierRule = {
  code: AgencyTierCode
  title: string
  from_package: number
  to_package: number | null
  discount_percent: number
}

/** `GET /investor/invest/config` — price, rate, tiers and the buyer's standing. */
export type PurchaseConfig = {
  product: { id: string; name: string; available_supply: number }
  base_price_usd: string
  usd_vnd_rate: string
  unit_price_vnd: string
  max_quantity_per_order: number
  current_title: AgencyTierCode | null
  total_packages_purchased: number
  balance_vnd: string
  kyc_verified: boolean
  tiers: TierRule[]
}

/** A run of Peers priced at one tier's discount (BE `pricing_breakdown`). */
export type PricingSegment = {
  tier: AgencyTierCode
  title: string
  from_package: number
  to_package: number
  quantity: number
  discount_rate: number
  gross_amount_vnd: number
  net_amount_vnd: number
}

/** `POST /investor/invest/calculate-price` — the server's price for this order. */
export type PurchaseQuote = {
  amount: number
  nft_id: string
  price_nft: string
  total_vnd: string
  gross_total_vnd: string
  discount_vnd: string
  discount_percent: number
  gross_amount_usd: string
  discount_amount_usd: string
  net_amount_usd: string
  unit_price_usd: string
  usd_vnd_rate: string
  agency_title: AgencyTierCode
  agency_title_label: string
  current_title: AgencyTierCode | null
  total_packages_before: number
  total_packages_after: number
  pricing_breakdown: PricingSegment[]
  balance_vnd: string
  balance_after_vnd: string
  shortage_vnd: string
  can_purchase: boolean
  kyc_verified: boolean
  referral_code: string | null
  referral_code_valid: boolean | null
  referrer_name: string | null
}

/** `POST /investor/invest/snapshot-price` — the quote, signed and locked for 10 minutes. */
export type PriceSnapshot = PurchaseQuote & { price_snapshot: string; expires_in: number }

export type NftAsset = {
  id: string
  assetCode: string
  metadataUrl: string
  ownerId: string
  productId: string
  orderId: string
  issuedAt: string
}

/** `POST /investor/invest` — the completed order. */
export type PurchaseOrder = {
  id: string
  productId: string
  quantity: number
  unitPriceVnd: string
  totalVnd: string
  createdAt: string
  nftAssets: NftAsset[]
  transaction_code: string
  status: string
  gross_total_vnd: string
  discount_vnd: string
  effective_discount_percent: string
  total_vnd: string
  agency_title: AgencyTierCode | null
  referral_code: string | null
  unit_price_usd: string | null
  usd_vnd_rate: string | null
  pricing_breakdown: PricingSegment[]
  balance_after_vnd: string | null
}

/** `GET /investor/me/nfts` */
export type OwnedNft = NftAsset & { product: NftProduct }

/** `GET /investor/history/nfts/:orderId` (fields used by the Peer detail page). */
export type NftOrderDetail = {
  id: string
  transaction_code: string
  status_label: string
  amount_vnd: string
  occurred_at: string
  overview: { collection_name: string; quantity: number; total_value_vnd: string }
  nft_source: { seller: string; unit_price_vnd: string }
}

export type CommissionType = "DIRECT" | "BRANCH"
export type CommissionStatus = "EARNED" | "PAID" | "CANCELLED"

export type ReferralCommission = {
  id: string
  orderId: string
  type: CommissionType
  rate: string
  amountVnd: string
  status: CommissionStatus
  createdAt: string
  paidAt: string | null
  buyer: { id: string; fullName: string; email: string }
  order: { id: string; totalVnd: string; createdAt: string; product: { name: string } }
}

/** `GET /investor/referrals/commissions` item (and `/:id`). */
export type Commission = {
  id: string
  type: "direct" | "branch"
  rate_percent: string
  amount_vnd: string
  amount_usd: string
  usd_vnd_rate: string
  status: string
  buyer: { id: string; full_name: string; email: string; referral_code: string }
  order: {
    id: string
    transaction_code: string
    product: { id: string; name: string; symbol: string }
    quantity: number
    gross_amount_vnd: string
    discount_vnd: string
    net_amount_vnd: string
    discount_percent: string
    agency_title: "TIER_1" | "TIER_2" | "TIER_3" | null
  }
  calculation: string
  credited_at: string
}

export type CommissionPage = {
  summary: {
    total_commission_vnd: string
    total_commission_usd: string
    usd_vnd_rate: string
    transaction_count: number
  }
  items: Commission[]
}

/** `GET /investor/referrals/branch-sales` — branch roots only (403 otherwise). */
export type BranchSales = {
  system_code: { code: string; label: string | null; claimedAt: string }
  period: { from: string | null; to: string | null }
  metrics: {
    downline_count: number
    order_count: number
    total_peer: number
    total_sales_vnd: string
    total_sales_usd: string
    branch_reward_vnd: string
    branch_reward_usd: string
    usd_vnd_rate: string
  }
  orders: {
    id: string
    transaction_code: string
    buyer: { id: string; full_name: string; email: string }
    product: { id: string; name: string; symbol: string }
    quantity: number
    amount_vnd: string
    amount_usd: string
    occurred_at: string
  }[]
}
