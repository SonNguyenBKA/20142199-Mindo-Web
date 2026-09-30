import type { AgencyTierCode } from "@/lib/agency-tier"
import type { DepositStatus, PageExtra } from "@/types/deposit"
import type { PricingSegment } from "@/types/peer"

/** Same four states as deposits: completed / pending / failed / cancelled. */
export type PeerHistoryStatus = DepositStatus

/** One purchase in `GET /investor/history/nfts`. */
export type PeerHistoryItem = {
  id: string
  title: string
  collection_id: string
  collection_name: string
  quantity: number
  nft_codes: string[]
  agency_title: AgencyTierCode | null
  gross_amount_vnd: string
  discount_vnd: string
  amount_vnd: string
  gross_amount_usd: string
  discount_usd: string
  amount_usd: string
  status: PeerHistoryStatus
  status_label: string
  occurred_at: string
}

export type PeerHistoryGroup = { key: string; label: string; items: PeerHistoryItem[] }

export type PeerHistorySummary = {
  total_spent_vnd: string
  total_spent_usd: string
  total_nfts_owned: number
  holding_nfts: number
}

export type PeerHistoryResponse = { summary: PeerHistorySummary; groups: PeerHistoryGroup[] }

export type PeerHistoryPage = { data: PeerHistoryResponse; extra: PageExtra }

/** `GET /investor/history/nfts/:id` (fields the drawer reads). */
export type PeerHistoryDetail = {
  id: string
  transaction_code: string
  status: PeerHistoryStatus
  status_label: string
  title: string
  amount_vnd: string
  amount_usd: string
  gross_amount_usd: string
  discount_usd: string
  discount_percent: string
  agency_title: AgencyTierCode | null
  unit_price_usd: string | null
  usd_vnd_rate: string | null
  pricing_breakdown: PricingSegment[]
  referral_code: string | null
  occurred_at: string
  overview: { collection_id: string; collection_name: string; nft_codes: string[]; quantity: number }
  execution: { executed_via: string }
  navigation: { collection_id: string; nft_asset_ids: string[] }
}
