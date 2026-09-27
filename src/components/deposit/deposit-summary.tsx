import { cn } from "cn"
import type * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatVnd } from "@/lib/format"
import type { DepositSummary as Summary } from "@/types/deposit"

type Props = { summary?: Summary; loading?: boolean; error?: boolean }

/** Desktop (≥ lg): three stat cards. */
export function DepositStatCards({ summary, loading, error }: Props) {
  const dash = error || !summary
  return (
    <div className="hidden grid-cols-3 gap-6 lg:grid">
      <StatCard label="Tổng tiền đã nạp" loading={loading}>
        {dash ? "—" : formatVnd(summary.total_deposited_vnd)}
      </StatCard>
      <StatCard
        label="Nạp thành công"
        loading={loading}
        hint={dash ? undefined : `${summary.total_count} lần nạp`}
      >
        {dash ? "—" : `${summary.completed_count}/${summary.total_count}`}
      </StatCard>
      <StatCard
        label="Đang xử lý"
        loading={loading}
        hint={dash || summary.pending_count === 0 ? undefined : "chờ đối soát ngân hàng"}
      >
        {dash ? "—" : `${summary.pending_count} giao dịch`}
      </StatCard>
    </div>
  )
}

export function StatCard({
  label,
  hint,
  loading,
  children,
}: {
  label: string
  hint?: string
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="h-[110px] rounded-panel border border-border bg-card px-6 py-5">
      {loading ? (
        <div className="flex flex-col gap-3 pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      ) : (
        <>
          <p className="text-[12.5px] leading-[18px] text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-2xl leading-8 font-bold text-foreground">{children}</p>
          {hint && <p className="mt-0.5 text-[11.5px] leading-4 text-placeholder">{hint}</p>}
        </>
      )}
    </div>
  )
}

/** Mobile (< lg): compact two-column summary card. */
export function DepositSummaryCard({ summary, loading, className }: Props & { className?: string }) {
  if (!summary && !loading) return null
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-muted px-4 pt-3.5 pb-2 lg:hidden",
        className
      )}
    >
      <div className="grid grid-cols-[1fr_1px_1fr] gap-4">
        <SummaryCell label="Tổng tiền đã nạp" loading={loading}>
          {summary && formatVnd(summary.total_deposited_vnd)}
        </SummaryCell>
        <div className="h-11 bg-border" />
        <SummaryCell label="Nạp thành công" loading={loading}>
          {summary && `${summary.completed_count}/${summary.total_count}`}
        </SummaryCell>
      </div>
      <div className="mt-1.5 border-t border-border pt-2 text-xs leading-[18px] font-medium text-muted-foreground">
        {loading || !summary ? (
          <Skeleton className="my-[3px] h-3 w-48 bg-border" />
        ) : (
          [
            `${summary.total_count} lần nạp`,
            summary.pending_count > 0 && `${summary.pending_count} giao dịch đang xử lý`,
          ]
            .filter(Boolean)
            .join(" · ")
        )}
      </div>
    </div>
  )
}

function SummaryCell({
  label,
  loading,
  children,
}: {
  label: string
  loading?: boolean
  children: React.ReactNode
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 pt-[3px]">
        <Skeleton className="h-2.5 w-[88px] bg-border" />
        <Skeleton className="h-[18px] w-[80%] bg-border" />
      </div>
    )
  }
  return (
    <div className="min-w-0">
      <p className="text-[11.5px] leading-4 text-placeholder">{label}</p>
      <p className="mt-0.5 truncate text-lg leading-[26px] font-bold text-foreground">{children}</p>
    </div>
  )
}
