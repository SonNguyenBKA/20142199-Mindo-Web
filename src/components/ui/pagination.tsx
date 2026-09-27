"use client"

import { cn } from "cn"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

/** Page numbers with ellipses: 1 … 4 5 [6] 7 8 … 20 */
export function pageItems(current: number, last: number, siblings = 1): (number | "…")[] {
  const pages = new Set([1, last])
  for (let p = current - siblings; p <= current + siblings; p++) {
    if (p >= 1 && p <= last) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | "…")[] = []
  sorted.forEach((p, i) => {
    if (i > 0) {
      const gap = p - sorted[i - 1]
      if (gap === 2) out.push(p - 1)
      else if (gap > 2) out.push("…")
    }
    out.push(p)
  })
  return out
}

type PaginationProps = {
  page: number
  lastPage: number
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
}

const cell =
  "flex size-9 items-center justify-center rounded-control text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-40"

export function Pagination({ page, lastPage, onPageChange, disabled, className }: PaginationProps) {
  if (lastPage <= 1) return null
  const go = (p: number) => p !== page && p >= 1 && p <= lastPage && onPageChange(p)

  return (
    <nav aria-label="Phân trang" className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-label="Trang trước"
        disabled={disabled || page <= 1}
        onClick={() => go(page - 1)}
        className={cn(cell, "border border-border bg-card text-foreground hover:bg-muted")}
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      {pageItems(page, lastPage).map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} aria-hidden className="w-6 text-center text-[13px] text-placeholder">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            disabled={disabled}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Trang ${item}`}
            onClick={() => go(item)}
            className={cn(
              cell,
              item === page
                ? "bg-primary font-semibold text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        aria-label="Trang sau"
        disabled={disabled || page >= lastPage}
        onClick={() => go(page + 1)}
        className={cn(cell, "border border-border bg-card text-foreground hover:bg-muted")}
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </nav>
  )
}
