"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { isForbidden } from "@/components/peer/agency/commission-utils"
import { referralService, type Period } from "@/services/referral.service"

export const referralKeys = {
  commissions: (period: Period, type: string | undefined, page: number) =>
    ["referrals", "commissions", period.from ?? "", period.to ?? "", type ?? "", page] as const,
  branchSales: (period: Period, page: number) =>
    ["referrals", "branch-sales", period.from ?? "", period.to ?? "", page] as const,
}

export const useCommissions = (period: Period, type: "DIRECT" | "BRANCH" | undefined, page: number) =>
  useQuery({
    queryKey: referralKeys.commissions(period, type, page),
    queryFn: () => referralService.commissions(period, type, page),
    placeholderData: keepPreviousData,
  })

/** Branch roots only; a 403 means "not a root" and is not retried. */
export const useBranchSales = (period: Period, page: number, enabled: boolean) =>
  useQuery({
    queryKey: referralKeys.branchSales(period, page),
    queryFn: () => referralService.branchSales(period, page),
    enabled,
    placeholderData: keepPreviousData,
    retry: (count, error) => !isForbidden(error) && count < 2,
  })
