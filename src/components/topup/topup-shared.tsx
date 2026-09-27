import { cn } from "cn"
import type * as React from "react"

/** White bordered card used across the top-up screens (desktop) — flat on mobile. */
export function Panel({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("lg:rounded-panel lg:border lg:border-border lg:bg-card", className)}
      {...props}
    />
  )
}

/** Label/value row with divider, used in status cards. */
export function SummaryRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-4 border-b border-border py-3 text-[13px] leading-5 last:border-b-0 lg:last:border-b">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-[13.5px] font-semibold text-foreground">{value}</span>
    </div>
  )
}

/** 88px round status icon. */
export function StatusRing({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "danger" | "warning"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "mx-auto flex size-[88px] items-center justify-center rounded-full [&_svg]:size-10",
        tone === "neutral" && "bg-muted text-foreground",
        tone === "success" && "bg-success-soft text-foreground",
        tone === "danger" && "bg-destructive-soft text-destructive",
        tone === "warning" && "bg-warning-soft text-warning-foreground"
      )}
    >
      {children}
    </div>
  )
}

/**
 * Centered status layout ("Đang đối soát", "Thành công", "Hết hạn").
 * Desktop: 560px card. Mobile: flat page with actions pinned to the bottom.
 */
export function StatusLayout({
  icon,
  title,
  description,
  amount,
  children,
  actions,
}: {
  icon: React.ReactNode
  title: string
  description?: React.ReactNode
  amount?: React.ReactNode
  children?: React.ReactNode
  actions: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col lg:items-center lg:justify-center">
      <section className="flex w-full flex-1 flex-col pt-8 lg:max-w-[560px] lg:flex-none lg:rounded-3xl lg:border lg:border-border lg:bg-card lg:px-10 lg:pt-10 lg:pb-10">
        {icon}
        <h2 className="mt-6 text-center text-lg leading-[23px] font-bold text-foreground lg:text-[23px] lg:leading-8">
          {title}
        </h2>
        {description && (
          <p className="mx-auto mt-2 max-w-[440px] text-center text-[13px] leading-[18px] text-muted-foreground lg:mt-1.5 lg:text-[13.5px] lg:leading-[21px]">
            {description}
          </p>
        )}
        {amount && (
          <p className="mt-2 text-center text-[28px] leading-[35px] font-bold text-foreground lg:mt-5 lg:text-[34px] lg:leading-[44px]">
            {amount}
          </p>
        )}
        {children && (
          <div className="mt-8 rounded-2xl bg-muted px-4 lg:mt-4 lg:rounded-none lg:bg-transparent lg:px-0">
            {children}
          </div>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:mt-0 lg:gap-3 lg:pb-0">
          {actions}
        </div>
      </section>
    </div>
  )
}
