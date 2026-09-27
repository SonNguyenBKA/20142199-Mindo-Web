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

/** `POST /investor/invest/snapshot-price` */
export type PriceSnapshot = {
  amount: number
  nft_id: string
  price_nft: string
  total_vnd: string
  price_snapshot: string
  expires_in: number
}

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
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
  createdAt: string
  nftAssets: NftAsset[]
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
