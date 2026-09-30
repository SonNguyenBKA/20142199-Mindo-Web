import { get, post } from "@/lib/axios"
import type {
  NftOrderDetail,
  NftProduct,
  OwnedNft,
  PriceSnapshot,
  PurchaseConfig,
  PurchaseOrder,
  PurchaseQuote,
} from "@/types/peer"

export type QuoteInput = { productId: string; quantity: number; referralCode?: string }

const referral = (code?: string) => (code ? { referral_code: code } : {})

export const peerService = {
  /** Peer collections on sale (public). */
  products: () => get<NftProduct[]>("/bff/nfts"),

  owned: () => get<OwnedNft[]>("/bff/me/nfts"),

  orderDetail: (orderId: string) =>
    get<NftOrderDetail>(`/bff/history/nfts/${encodeURIComponent(orderId)}`),

  /** Price, rate, discount tiers and the buyer's standing for one collection. */
  config: (productId: string) =>
    get<PurchaseConfig>(`/bff/invest/config?project_id=${encodeURIComponent(productId)}`),

  /** The server's price for this order — also validates the referral code, balance and KYC. */
  quote: ({ productId, quantity, referralCode }: QuoteInput) =>
    post<PurchaseQuote>("/bff/invest/calculate-price", {
      project_id: productId,
      amount: quantity,
      ...referral(referralCode),
    }),

  /** Lock the price for 10 minutes, then buy with the signed snapshot, paying from the Mindo balance. */
  buy: async ({ productId, quantity, referralCode }: QuoteInput) => {
    const snapshot = await post<PriceSnapshot>("/bff/invest/snapshot-price", {
      nft_id: productId,
      amount: quantity,
      payment_type: "BALANCE",
      ...referral(referralCode),
    })
    return post<PurchaseOrder>("/bff/invest", {
      price_snapshot: snapshot.price_snapshot,
      ...referral(referralCode),
    })
  },
}
