"use client"

import { cn } from "cn"
import { ArrowDownToLineIcon } from "lucide-react"
import * as React from "react"

import {
  StatusBadge,
  StatusHint,
  statusLabel,
  statusSoftBg,
  statusText,
} from "@/components/deposit/deposit-status"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime, formatVnd } from "@/lib/format"
import type { DepositHistoryGroup, DepositHistoryItem } from "@/types/deposit"

type ListProps = {
  groups: DepositHistoryGroup[]
  onSelect: (id: string) => void
}

// ---------- Desktop table ----------

const tableCols =
  "grid grid-cols-[minmax(96px,226px)_minmax(120px,180px)_minmax(150px,1fr)_112px] items-center gap-x-3"

export function DepositTableHeader() {
  return (
    <div
      role="row"
      className={cn(
        tableCols,
        "h-11 border-b border-border text-[10.5px] leading-[44px] font-bold tracking-wide text-placeholder uppercase"
      )}
    >
      <span role="columnheader">Nguồn nạp</span>
      <span role="columnheader" className="pr-8 text-right">Số tiền</span>
      <span role="columnheader" className="pr-8 text-right">Thời gian</span>
      <span role="columnheader" className="text-right">Trạng thái</span>
    </div>
  )
}

export function DepositTable({ groups, onSelect }: ListProps) {
  return (
    <div role="rowgroup">
      {groups.map((group) => (
        <React.Fragment key={group.key}>
          <div className="mt-3 text-[10.5px] leading-9 font-bold text-placeholder">{group.label}</div>
          {group.items.map((item) => (
            <DepositTableRow key={item.id} item={item} onSelect={onSelect} />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

function DepositTableRow({
  item,
  onSelect,
}: {
  item: DepositHistoryItem
  onSelect: (id: string) => void
}) {
  return (
    <div
      role="row"
      tabIndex={0}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(item.id)
        }
      }}
      className={cn(
        tableCols,
        "-mx-2 h-14 cursor-pointer rounded-control border-b border-border px-2 outline-none transition-colors last:border-b hover:bg-muted/60 focus-visible:bg-muted"
      )}
    >
      <span role="cell" className="truncate pr-4 text-[13.5px] font-semibold text-foreground">
        {item.title}
      </span>
      <span role="cell" className="pr-8 text-right text-[13.5px] font-bold whitespace-nowrap text-foreground tabular-nums">
        {formatVnd(item.amount_vnd, "+")}
      </span>
      <span role="cell" className="truncate pr-8 text-right text-[12.5px] whitespace-nowrap text-muted-foreground tabular-nums">
        {formatDateTime(item.occurred_at)}
      </span>
      <span role="cell" className="flex justify-end">
        <StatusBadge status={item.status} label={item.status_label} hint={item.status_message} />
      </span>
    </div>
  )
}

export function DepositTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div aria-busy aria-label="Đang tải">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={cn(tableCols, "h-14 border-b border-border")}>
          <Skeleton className="h-3.5 w-[140px]" />
          <Skeleton className="mr-8 h-3.5 w-[110px] justify-self-end" />
          <Skeleton className="mr-8 h-3.5 w-[150px] justify-self-end" />
          <Skeleton className="h-4 w-[100px] justify-self-end rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ---------- Mobile list ----------

export function DepositMobileList({ groups, onSelect }: ListProps) {
  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <section key={group.key} className="mt-5 first:mt-0">
          <h3 className="text-[11.5px] leading-4 font-bold tracking-[0.6px] text-placeholder">
            {group.label}
          </h3>
          <ul className="mt-2">
            {group.items.map((item) => (
              <li key={item.id}>
                <DepositMobileRow item={item} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function DepositMobileRow({
  item,
  onSelect,
}: {
  item: DepositHistoryItem
  onSelect: (id: string) => void
}) {
  const statusNode = (
    <span className={cn("font-medium", statusText[item.status])}>
      {item.status_label || statusLabel(item.status)}
    </span>
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(item.id)
        }
      }}
      className="group flex h-[68px] w-full items-center gap-4 text-left outline-none"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-control",
          statusSoftBg[item.status],
          statusText[item.status]
        )}
      >
        <ArrowDownToLineIcon className="size-5" strokeWidth={1.8} />
      </span>
      <span className="flex h-full min-w-0 flex-1 flex-col justify-center border-b border-border group-last:border-b-0 group-focus-visible:border-primary">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[14.5px] leading-[22px] font-semibold text-foreground">
            {item.title}
          </span>
          <span
            className={cn(
              "shrink-0 text-[15px] leading-[22px] font-semibold",
              item.status === "failed" ? "text-placeholder" : "text-foreground"
            )}
          >
            {formatVnd(item.amount_vnd, "+")}
          </span>
        </span>
        <span className="truncate text-xs leading-[18px] text-muted-foreground">
          {formatDateTime(item.occurred_at)} ·{" "}
          {item.status === "pending" ? (
            <StatusHint hint={item.status_message}>{statusNode}</StatusHint>
          ) : (
            statusNode
          )}
        </span>
      </span>
    </div>
  )
}

export function DepositMobileSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy aria-label="Đang tải">
      <Skeleton className="mb-3 h-2.5 w-[84px]" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex h-[68px] items-center gap-4">
          <Skeleton className="size-10 rounded-control" />
          <div className="flex h-full flex-1 items-center justify-between border-b border-border">
            <div className="flex flex-col gap-2.5">
              <Skeleton className="h-3.5 w-[148px]" />
              <Skeleton className="h-2.5 w-[112px]" />
            </div>
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
