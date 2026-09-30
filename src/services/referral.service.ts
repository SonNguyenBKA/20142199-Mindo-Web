import { api } from "@/lib/axios"
import type { ApiEnvelope } from "@/types/auth"
import type { PageExtra } from "@/types/deposit"
import type { BranchSales, CommissionPage } from "@/types/peer"

/** An ISO range; both ends omitted = all time. */
export type Period = { from?: string; to?: string }

export const COMMISSION_PAGE_SIZE = 10
export const BRANCH_PAGE_SIZE = 5

async function paged<T>(url: string, params: Record<string, unknown>) {
  const res = await api.get<ApiEnvelope<T> & { extra: PageExtra }>(url, { params })
  return { data: res.data.data, extra: res.data.extra }
}

export const referralService = {
  commissions: (period: Period, type: "DIRECT" | "BRANCH" | undefined, page: number) =>
    paged<CommissionPage>("/bff/referrals/commissions", {
      ...period,
      type,
      page,
      limit: COMMISSION_PAGE_SIZE,
    }),

  branchSales: (period: Period, page: number) =>
    paged<BranchSales>("/bff/referrals/branch-sales", { ...period, page, limit: BRANCH_PAGE_SIZE }),
}
