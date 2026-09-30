import { api } from "@/lib/axios"
import type { ApiEnvelope } from "@/types/auth"
import type { DepositHistoryFilters, PageExtra } from "@/types/deposit"
import type { PeerHistoryDetail, PeerHistoryResponse } from "@/types/peer-history"

export const PEER_HISTORY_PAGE_SIZE = 10

export const peerHistoryService = {
  /** `filters.source` carries the collection id (`project_id` on the BE). */
  async history({ source, ...filters }: DepositHistoryFilters, page: number) {
    const res = await api.get<ApiEnvelope<PeerHistoryResponse> & { extra: PageExtra }>("/bff/history/nfts", {
      params: { ...filters, project_id: source, page, limit: PEER_HISTORY_PAGE_SIZE },
    })
    return { data: res.data.data, extra: res.data.extra }
  },

  async detail(id: string) {
    const res = await api.get<ApiEnvelope<PeerHistoryDetail>>(`/bff/history/nfts/${encodeURIComponent(id)}`)
    return res.data.data
  },
}
