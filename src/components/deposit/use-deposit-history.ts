"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { depositService } from "@/services/deposit.service"
import type { DepositHistoryFilters, DepositStatus } from "@/types/deposit"

const STATUSES: DepositStatus[] = ["completed", "pending", "failed", "cancelled"]
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Applied filters, current page and selected detail id live in the URL. */
export function useDepositSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = React.useMemo<DepositHistoryFilters>(() => {
    const from = searchParams.get("from") ?? ""
    const to = searchParams.get("to") ?? ""
    const status = searchParams.get("status") as DepositStatus | null
    const source = searchParams.get("source") ?? ""
    return {
      ...(DATE_RE.test(from) && { from }),
      ...(DATE_RE.test(to) && { to }),
      ...(status && STATUSES.includes(status) && { status }),
      ...(source && { source }),
    }
  }, [searchParams])

  const selectedId = searchParams.get("id")
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1)

  const update = React.useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const applyFilters = (next: DepositHistoryFilters) =>
    update({ from: next.from, to: next.to, status: next.status, source: next.source, id: undefined, page: undefined })

  return {
    filters,
    hasFilters: Object.keys(filters).length > 0,
    applyFilters,
    resetFilters: () => applyFilters({}),
    selectedId,
    page,
    setPage: (next: number) => update({ page: next > 1 ? String(next) : undefined, id: undefined }),
    openDetail: (id: string) => update({ id }),
    closeDetail: () => update({ id: undefined }),
  }
}

/** One page of deposit history (numbered pagination, previous page kept while loading). */
export function useDepositHistory(filters: DepositHistoryFilters, page: number) {
  const query = useQuery({
    queryKey: ["deposit-history", filters, page],
    queryFn: () => depositService.history(filters, page),
    placeholderData: keepPreviousData,
  })

  return {
    ...query,
    groups: query.data?.data.groups ?? [],
    summary: query.data?.data.summary,
    sources: query.data?.data.available_sources ?? [],
    total: query.data?.extra.total ?? 0,
    lastPage: Math.max(1, query.data?.extra.last_page ?? 1),
  }
}

export function useDepositDetail(id: string | null) {
  return useQuery({
    queryKey: ["deposit-detail", id],
    queryFn: () => depositService.detail(id as string),
    enabled: !!id,
  })
}
