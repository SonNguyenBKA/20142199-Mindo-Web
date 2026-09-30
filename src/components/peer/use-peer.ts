"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { accountKeys } from "@/components/account/use-account"
import { peerService, type QuoteInput } from "@/services/peer.service"

export const peerKeys = {
  products: ["nfts", "products"] as const,
  owned: ["me", "nfts"] as const,
  order: (id: string) => ["history", "nfts", id] as const,
  config: (productId: string) => ["invest", "config", productId] as const,
  quotes: ["invest", "quote"] as const,
  quote: (input: QuoteInput) =>
    ["invest", "quote", input.productId, input.quantity, input.referralCode ?? ""] as const,
}

export const usePeerProducts = () =>
  useQuery({ queryKey: peerKeys.products, queryFn: peerService.products })

export const useOwnedPeers = () => useQuery({ queryKey: peerKeys.owned, queryFn: peerService.owned })

export const usePeerOrder = (orderId: string | undefined) =>
  useQuery({
    queryKey: peerKeys.order(orderId ?? ""),
    queryFn: () => peerService.orderDetail(orderId!),
    enabled: !!orderId,
  })

/** Price, tiers, balance and KYC for one collection. */
export const usePurchaseConfig = (productId: string) =>
  useQuery({ queryKey: peerKeys.config(productId), queryFn: () => peerService.config(productId) })

/**
 * The server's quote. Pass already-debounced input; the previous quote stays on
 * screen while the next one loads (`isPlaceholderData`). No retry: a bad
 * referral code is a 400 that retrying won't fix.
 */
export const usePurchaseQuote = (input: QuoteInput) =>
  useQuery({
    queryKey: peerKeys.quote(input),
    queryFn: () => peerService.quote(input),
    placeholderData: keepPreviousData,
    retry: false,
  })

/** Snapshot + invest, then refresh supply, owned Peers, price, overview counts and the wallet balance. */
export function useBuyPeer() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: peerService.buy,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: peerKeys.products })
      queryClient.invalidateQueries({ queryKey: peerKeys.owned })
      queryClient.invalidateQueries({ queryKey: ["invest"] })
      queryClient.invalidateQueries({ queryKey: accountKeys.nftCount })
      router.refresh()
    },
  })
}
