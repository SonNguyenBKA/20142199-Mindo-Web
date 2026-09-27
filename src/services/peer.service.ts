import { get, post } from "@/lib/axios"
import type { NftOrderDetail, NftProduct, OwnedNft, PriceSnapshot, PurchaseOrder } from "@/types/peer"

export const peerService = {
  /** Peer collections on sale (public). */
  products: () => get<NftProduct[]>("/bff/nfts"),

  owned: () => get<OwnedNft[]>("/bff/me/nfts"),

  orderDetail: (orderId: string) =>
    get<NftOrderDetail>(`/bff/history/nfts/${encodeURIComponent(orderId)}`),

  /** Lock the price for 10 minutes, then buy with the signed snapshot. */
  buy: async ({ productId, quantity, agencyCode }: { productId: string; quantity: number; agencyCode?: string }) => {
    const snapshot = await post<PriceSnapshot>("/bff/invest/snapshot-price", {
      amount: quantity,
      nft_id: productId,
      payment_type: "wallet",
    })
    return post<PurchaseOrder>("/bff/invest", {
      price_snapshot: snapshot.price_snapshot,
      ...(agencyCode ? { agency_code: agencyCode } : {}),
    })
  },
}
