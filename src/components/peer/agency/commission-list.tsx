import { cn } from "cn"

import {
  COMMISSION_TYPE,
  dayMonth,
  ratePercent,
} from "@/components/peer/agency/commission-utils"
import { formatDate, formatVnd, initials } from "@/lib/format"
import type { ReferralCommission } from "@/types/peer"

function Initials({ name }: { name: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-initials text-xs font-bold text-brand-deep">
      {initials(name)}
    </span>
  )
}

/** Desktop table (Figma "Lịch sử hoa hồng"). Rows open the detail drawer. */
export function CommissionTable({
  rows,
  onSelect,
}: {
  rows: ReferralCommission[]
  onSelect: (row: ReferralCommission) => void
}) {
  return (
    <div className="hidden lg:block">
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_88px] items-center gap-4 rounded-tile bg-muted px-4 py-2.5 text-[11px] font-semibold tracking-[0.4px] text-muted-foreground">
        <span>NGƯỜI ĐƯỢC GIỚI THIỆU</span>
        <span>SẢN PHẨM</span>
        <span className="text-right">GIÁ TRỊ ĐƠN</span>
        <span className="text-right">HOA HỒNG</span>
        <span className="text-right">NGÀY</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row)}
              className="grid w-full grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_88px] items-center gap-4 rounded-control px-4 py-4 text-left text-[13px] outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Initials name={row.buyer.fullName} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-foreground">{row.buyer.fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">{COMMISSION_TYPE[row.type]}</span>
                </span>
              </span>
              <span className="truncate text-foreground">{row.order.product.name}</span>
              <span className="text-right font-medium text-foreground">{formatVnd(row.order.totalVnd)}</span>
              <CommissionAmount row={row} className="text-right" />
              <span className="text-right text-muted-foreground">{formatDate(row.createdAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Mobile list (Figma mobile "Danh sách hoa hồng"). */
export function CommissionListMobile({
  rows,
  onSelect,
}: {
  rows: ReferralCommission[]
  onSelect: (row: ReferralCommission) => void
}) {
  return (
    <ul className="flex flex-col divide-y divide-border lg:hidden">
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            onClick={() => onSelect(row)}
            className="flex w-full items-center gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <Initials name={row.buyer.fullName} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[13.5px] font-semibold text-foreground">{row.buyer.fullName}</span>
              <span className="truncate text-[11.5px] text-muted-foreground">
                {COMMISSION_TYPE[row.type]} · {ratePercent(row.rate)}
              </span>
              <span className="truncate text-[11.5px] text-muted-foreground">
                {row.order.product.name} · {formatVnd(row.order.totalVnd)}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-0.5">
              <CommissionAmount row={row} className="text-[13.5px]" />
              <span className="text-[11.5px] text-placeholder">{dayMonth(row.createdAt)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function CommissionAmount({ row, className }: { row: ReferralCommission; className?: string }) {
  const cancelled = row.status === "CANCELLED"
  return (
    <span
      className={cn(
        "font-bold",
        cancelled ? "text-placeholder line-through" : "text-success-strong",
        className
      )}
    >
      {formatVnd(row.amountVnd, "+")}
    </span>
  )
}
