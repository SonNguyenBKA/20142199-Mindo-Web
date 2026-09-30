import { api, get, post } from "@/lib/axios"
import type { ApiEnvelope } from "@/types/auth"
import type { PageExtra } from "@/types/deposit"
import type {
  NftProduct,
  OwnedPeer,
  PriceSnapshot,
  PurchaseConfig,
  PurchaseOrder,
  PurchaseQuote,
} from "@/types/peer"

export const OWNED_PAGE_SIZE = 8

export type QuoteInput = { productId: string; quantity: number; referralCode?: string }

const referral = (code?: string) => (code ? { referral_code: code } : {})

export const peerService = {
  /** Peer collections on sale (public). */
  products: () => get<NftProduct[]>("/bff/nfts"),

  /** Server-side search and paging (passing `page` switches the BE to its paged mode). */
  owned: async ({ q, page }: { q: string; page: number }) => {
    const res = await api.get<ApiEnvelope<OwnedPeer[]> & { extra: PageExtra }>("/bff/me/nfts", {
      params: { q: q || undefined, page, limit: OWNED_PAGE_SIZE },
    })
    return { data: res.data.data, extra: res.data.extra }
  },

  ownedDetail: (id: string) => get<OwnedPeer>(`/bff/me/nfts/${encodeURIComponent(id)}`),

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
