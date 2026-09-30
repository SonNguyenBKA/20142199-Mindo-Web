import { cn } from "cn"

import { AgencyTierBadge } from "@/components/account/agency-tier-badge"
import { COMMISSION_TYPE, dayMonth, usdOf } from "@/components/peer/agency/commission-utils"
import { tierByCode } from "@/lib/agency-tier"
import { formatDate, formatUsd, initials } from "@/lib/format"
import type { Commission } from "@/types/peer"

function Initials({ name }: { name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-initials text-xs font-bold text-brand-deep">
      {initials(name)}
    </span>
  )
}

/** Buyer's tier after that order (Figma shows the medal under the name). */
function BuyerTier({ row, fallback }: { row: Commission; fallback: string }) {
  const tier = tierByCode(row.order.agency_title)
  return tier ? (
    <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
      <AgencyTierBadge tier={tier} size={16} />
      {tier.name}
    </span>
  ) : (
    <span className="truncate text-xs text-muted-foreground">{fallback}</span>
  )
}

const COLUMNS = "grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_96px]"

/** Desktop table (Figma "Lịch sử hoa hồng", 1861:1768). Rows open the detail drawer. */
export function CommissionTable({
  rows,
  ratePercent,
  onSelect,
}: {
  rows: Commission[]
  /** Direct commission rate, for the column title. */
  ratePercent: number
  onSelect: (row: Commission) => void
}) {
  return (
    <div className="hidden lg:block">
      <div
        className={cn(
          "grid items-center gap-4 rounded-tile bg-muted px-4 py-2.5 text-[11px] font-semibold tracking-[0.4px] text-muted-foreground",
          COLUMNS
        )}
      >
        <span>ĐẠI LÝ ĐƯỢC GIỚI THIỆU</span>
        <span>GÓI SỞ HỮU</span>
        <span className="text-right">GIÁ TRỊ ĐƠN</span>
        <span className="text-right">HOA HỒNG {ratePercent}%</span>
        <span className="text-right">NGÀY</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row)}
              className={cn(
                "grid w-full items-center gap-4 rounded-control px-4 py-4 text-left text-[13px] outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/30",
                COLUMNS
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Initials name={row.buyer.full_name} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-foreground">{row.buyer.full_name}</span>
                  <BuyerTier row={row} fallback={COMMISSION_TYPE[row.type]} />
                </span>
              </span>
              <span className="truncate text-foreground">{row.order.quantity} Peer</span>
              <span className="text-right font-medium text-foreground">
                {formatUsd(usdOf(row.order.net_amount_vnd, row.usd_vnd_rate))}
              </span>
              <CommissionAmount row={row} className="text-right" />
              <span className="text-right text-muted-foreground">{formatDate(row.credited_at)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Mobile list (Figma mobile "Danh sách hoa hồng"). */
export function CommissionListMobile({ rows, onSelect }: { rows: Commission[]; onSelect: (row: Commission) => void }) {
  return (
    <ul className="flex flex-col divide-y divide-border lg:hidden">
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            onClick={() => onSelect(row)}
            className="flex w-full items-center gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <Initials name={row.buyer.full_name} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[13.5px] font-semibold text-foreground">{row.buyer.full_name}</span>
              <span className="truncate text-[11.5px] text-muted-foreground">
                {COMMISSION_TYPE[row.type]} · {row.rate_percent}%
              </span>
              <span className="truncate text-[11.5px] text-muted-foreground">
                {row.order.quantity} Peer · {formatUsd(usdOf(row.order.net_amount_vnd, row.usd_vnd_rate))}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-0.5">
              <CommissionAmount row={row} className="text-[13.5px]" />
              <span className="text-[11.5px] text-placeholder">{dayMonth(row.credited_at)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function CommissionAmount({ row, className }: { row: Commission; className?: string }) {
  return <span className={cn("font-bold text-success-strong", className)}>{formatUsd(row.amount_usd, "+")}</span>
}
