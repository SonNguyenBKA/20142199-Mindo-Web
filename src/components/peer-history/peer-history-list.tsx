"use client"

import { cn } from "cn"
import { ArrowDownIcon } from "lucide-react"
import * as React from "react"

import { StatusBadge } from "@/components/deposit/deposit-status"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime, formatUsd } from "@/lib/format"
import type { PeerHistoryGroup, PeerHistoryItem } from "@/types/peer-history"

type ListProps = { groups: PeerHistoryGroup[]; onSelect: (id: string) => void }

/** "Mindo Genesis · 45 Peer" for a batch; the BE title (with the Peer number) for a single one. */
const rowTitle = (item: PeerHistoryItem) =>
  item.quantity > 1 ? `${item.collection_name} · ${item.quantity} Peer` : item.title

// Figma 1089:684 — Peer · Loại · Giá trị · Thời gian · Trạng thái.
const tableCols =
  "grid grid-cols-[minmax(160px,1fr)_84px_104px_150px_104px] items-center gap-x-3"

/** Purchases only for now (the BE has no Peer sales yet), so every row is "Sở hữu". */
function Kind() {
  return (
    <span className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
      <ArrowDownIcon className="size-3.5" strokeWidth={2} />
      Sở hữu
    </span>
  )
}

export function PeerHistoryTableHeader() {
  return (
    <div
      role="row"
      className={cn(
        tableCols,
        "h-11 border-b border-border text-[10.5px] leading-[44px] font-bold tracking-wide text-placeholder uppercase"
      )}
    >
      <span role="columnheader">Peer</span>
      <span role="columnheader">Loại</span>
      <span role="columnheader">Giá trị</span>
      <span role="columnheader">Thời gian</span>
      <span role="columnheader" className="text-right">Trạng thái</span>
    </div>
  )
}

export function PeerHistoryTable({ groups, onSelect }: ListProps) {
  return (
    <div role="rowgroup">
      {groups.map((group) => (
        <React.Fragment key={group.key}>
          <div className="mt-3 text-[10.5px] leading-9 font-bold text-placeholder">{group.label}</div>
          {group.items.map((item) => (
            <Row key={item.id} item={item} onSelect={onSelect} />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

const activate = (onSelect: () => void) => ({
  role: "row" as const,
  tabIndex: 0,
  onClick: onSelect,
  onKeyDown: (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect()
    }
  },
})

function Row({ item, onSelect }: { item: PeerHistoryItem; onSelect: (id: string) => void }) {
  return (
    <div
      {...activate(() => onSelect(item.id))}
      className={cn(
        tableCols,
        "-mx-2 h-14 cursor-pointer rounded-control border-b border-border px-2 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted"
      )}
    >
      <span role="cell" className="truncate pr-4 text-[13.5px] font-semibold text-foreground">
        {rowTitle(item)}
      </span>
      <span role="cell">
        <Kind />
      </span>
      <span role="cell" className="text-[13.5px] font-bold whitespace-nowrap text-foreground tabular-nums">
        {formatUsd(item.amount_usd, "−")}
      </span>
      <span role="cell" className="truncate text-[12.5px] whitespace-nowrap text-muted-foreground tabular-nums">
        {formatDateTime(item.occurred_at)}
      </span>
      <span role="cell" className="flex justify-end">
        <StatusBadge status={item.status} label={item.status_label} />
      </span>
    </div>
  )
}

export function PeerHistoryTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div aria-busy aria-label="Đang tải">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={cn(tableCols, "h-14 border-b border-border")}>
          <Skeleton className="h-3.5 w-[140px]" />
          <Skeleton className="h-3.5 w-[60px]" />
          <Skeleton className="h-3.5 w-[80px]" />
          <Skeleton className="h-3.5 w-[130px]" />
          <Skeleton className="h-4 w-[90px] justify-self-end rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function PeerHistoryMobileList({ groups, onSelect }: ListProps) {
  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <section key={group.key} className="mt-5 first:mt-0">
          <h3 className="text-[10.5px] leading-6 font-bold text-placeholder">{group.label}</h3>
          <ul className="divide-y divide-border">
            {group.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="flex w-full items-center gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[13.5px] font-semibold text-foreground">{rowTitle(item)}</span>
                    <span className="truncate text-[11.5px] text-muted-foreground">
                      Sở hữu · {formatDateTime(item.occurred_at)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[13.5px] font-bold text-foreground">{formatUsd(item.amount_usd, "−")}</span>
                    <StatusBadge status={item.status} label={item.status_label} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function PeerHistoryMobileSkeleton() {
  return (
    <div aria-busy aria-label="Đang tải" className="flex flex-col gap-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-14 rounded-control" />
      ))}
    </div>
  )
}
