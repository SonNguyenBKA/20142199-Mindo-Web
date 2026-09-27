"use client"

import { cn } from "cn"
import * as React from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { DepositStatus } from "@/types/deposit"

export const STATUS_OPTIONS: { value: DepositStatus; label: string }[] = [
  { value: "completed", label: "Thành công" },
  { value: "pending", label: "Đang xử lý" },
  { value: "failed", label: "Thất bại" },
]

export const statusLabel = (status: DepositStatus) =>
  STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status

/** Soft background per status (badges, icon tiles, summary box). */
export const statusSoftBg: Record<DepositStatus, string> = {
  completed: "bg-success-soft",
  pending: "bg-warning-soft",
  failed: "bg-destructive-soft",
}

/** Text/icon colour per status on white backgrounds. */
export const statusText: Record<DepositStatus, string> = {
  completed: "text-success-foreground",
  pending: "text-warning-foreground",
  failed: "text-destructive",
}

export const PENDING_HINT =
  "Giao dịch đã ghi nhận, đang chờ đối soát với ngân hàng. Thường hoàn tất trong 5–10 phút."

/** Pill badge used in the desktop table. Pending shows an explanatory tooltip. */
export function StatusBadge({
  status,
  label,
  hint,
}: {
  status: DepositStatus
  label?: string
  hint?: string | null
}) {
  const badge = (
    <span
      className={cn(
        "inline-flex h-[26px] min-w-[82px] items-center justify-center rounded-full px-3 text-[11.5px] leading-[26px] font-semibold",
        statusSoftBg[status],
        status === "completed" ? "text-foreground" : statusText[status]
      )}
    >
      {label ?? statusLabel(status)}
    </span>
  )

  if (status !== "pending") return badge
  return <StatusHint hint={hint}>{badge}</StatusHint>
}

/**
 * Wraps a trigger with the "đang xử lý" tooltip. Opens on hover/focus and also
 * toggles on tap (touch devices), without triggering the row's click.
 */
export function StatusHint({
  hint,
  children,
}: {
  hint?: string | null
  children: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        render={
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((v) => !v)
            }}
            onKeyDown={(e) => e.stopPropagation()}
            className="cursor-help rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={8}
        className="max-w-[288px] rounded-control bg-primary px-3.5 py-2.5 text-xs leading-[18px] text-primary-foreground"
      >
        {hint || PENDING_HINT}
      </TooltipContent>
    </Tooltip>
  )
}
