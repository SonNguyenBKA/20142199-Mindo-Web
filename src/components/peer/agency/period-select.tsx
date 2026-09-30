"use client"

import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

import { monthLabel } from "@/components/peer/agency/commission-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const ALL_PERIODS = "all"

export const periodLabel = (value: string) => (value === ALL_PERIODS ? "Tất cả" : monthLabel(value))

/** Month picker (Figma "Chọn kỳ"); the BE filters by the chosen month. */
export function PeriodSelect({
  months,
  value,
  onChange,
  className,
}: {
  months: string[]
  className?: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Chọn kỳ"
        className={cn(
          "inline-flex h-8 shrink-0 items-center gap-1 rounded-tile border border-referral-border bg-card pr-2 pl-3 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 lg:h-10 lg:gap-1.5 lg:rounded-control lg:border-border lg:px-3.5 lg:text-[13px]",
          className
        )}
      >
        {periodLabel(value)}
        <ChevronDownIcon className="size-3.5 text-muted-foreground" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1.5">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(String(v))}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 pt-1.5 pb-1 text-[10.5px] font-semibold tracking-[0.6px] text-placeholder">
              THÁNG
            </DropdownMenuLabel>
            {months.map((m) => (
              <DropdownMenuRadioItem key={m} value={m} closeOnClick className="py-2 text-[13px]">
                {monthLabel(m)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuRadioItem value={ALL_PERIODS} closeOnClick className="mt-1 border-t border-border py-2 text-[13px]">
            Tất cả
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
