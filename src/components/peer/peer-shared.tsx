import { cn } from "cn"
import type * as React from "react"


/** "Label ........ value" row used in summaries, results and details. */
export function SummaryRow({
  label,
  children,
  className,
  valueClassName,
}: {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
  valueClassName?: string
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 text-[13px]", className)}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 truncate text-right font-medium text-foreground", valueClassName)}>
        {children}
      </span>
    </div>
  )
}

/** White card used for the tab bodies. */
export function PeerCard({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-block border border-border bg-card", className)}
      {...props}
    />
  )
}

/** Top row of a tab: segmented tabs on the left, tab-specific extras on the right. */
export function PeerToolbar({
  tabs,
  children,
  className,
}: {
  tabs: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4",
        className
      )}
    >
      {tabs}
      {children}
    </div>
  )
}

/** Rounded pill on the toolbar ("Giá niêm yết 25 USD / Peer"). */
export function ToolbarPill({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-fit items-center gap-1.5 text-[12.5px] whitespace-nowrap lg:gap-2 lg:rounded-full lg:border lg:border-border lg:bg-card lg:px-4 lg:py-2.5 lg:text-[13px]",
        className
      )}
      {...props}
    />
  )
}
