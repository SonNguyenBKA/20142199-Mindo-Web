"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { accountKeys } from "@/components/account/use-account"
import { peerService } from "@/services/peer.service"

export const peerKeys = {
  products: ["nfts", "products"] as const,
  owned: ["me", "nfts"] as const,
  order: (id: string) => ["history", "nfts", id] as const,
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

/** Snapshot + invest, then refresh supply, owned Peers, overview counts and the wallet balance. */
export function useBuyPeer() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: peerService.buy,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: peerKeys.products })
      queryClient.invalidateQueries({ queryKey: peerKeys.owned })
      queryClient.invalidateQueries({ queryKey: accountKeys.nftCount })
      router.refresh()
    },
  })
}
