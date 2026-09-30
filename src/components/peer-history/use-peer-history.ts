"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { peerHistoryService } from "@/services/peer-history.service"
import type { DepositHistoryFilters } from "@/types/deposit"

/** One page of Peer purchases (previous page kept on screen while the next loads). */
export function usePeerHistory(filters: DepositHistoryFilters, page: number) {
  const query = useQuery({
    queryKey: ["peer-history", filters, page],
    queryFn: () => peerHistoryService.history(filters, page),
    placeholderData: keepPreviousData,
  })
  return {
    ...query,
    groups: query.data?.data.groups ?? [],
    summary: query.data?.data.summary,
    total: query.data?.extra.total ?? 0,
    lastPage: Math.max(1, query.data?.extra.last_page ?? 1),
  }
}

export function usePeerHistoryDetail(id: string | null) {
  return useQuery({
    queryKey: ["peer-history-detail", id],
    queryFn: () => peerHistoryService.detail(id as string),
    enabled: !!id,
  })
}
