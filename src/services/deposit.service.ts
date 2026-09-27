import { api } from "@/lib/axios"
import type { ApiEnvelope } from "@/types/auth"
import type {
  DepositDetail,
  DepositHistoryFilters,
  DepositHistoryResponse,
  PageExtra,
} from "@/types/deposit"

export const DEPOSIT_PAGE_SIZE = 10

export const depositService = {
  async history(filters: DepositHistoryFilters, page: number) {
    const res = await api.get<ApiEnvelope<DepositHistoryResponse> & { extra: PageExtra }>(
      "/bff/history/deposits",
      { params: { ...filters, page, limit: DEPOSIT_PAGE_SIZE } }
    )
    return { data: res.data.data, extra: res.data.extra }
  },

  async detail(id: string) {
    const res = await api.get<ApiEnvelope<DepositDetail>>(
      `/bff/history/deposits/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  receiptUrl: (id: string) =>
    `/api/bff/history/deposits/${encodeURIComponent(id)}/receipt`,
}
