import { cn } from "cn"
import type * as React from "react"

/** 18px Figma icon inside a rounded tile. */
export function IconTile({
  src,
  tone = "muted",
  className,
}: {
  src: string
  tone?: "muted" | "info"
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-[38px] shrink-0 items-center justify-center rounded-tile",
        tone === "info" ? "bg-info-soft" : "bg-muted",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static 18px icon */}
      <img src={src} alt="" width={18} height={18} />
    </span>
  )
}

/** Small outlined button used as a row action on desktop ("Đổi mật khẩu"). */
export function RowButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-tile border border-border bg-card px-3.5 text-[12.5px] font-semibold whitespace-nowrap text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

type SettingRowProps = {
  icon: string
  title: string
  description?: React.ReactNode
  /** Desktop: outlined button. Mobile: the whole row becomes tappable with a chevron. */
  action?: { label: string; onClick: () => void }
  /** Custom trailing control (select, switch) shown on every breakpoint. */
  trailing?: React.ReactNode
  className?: string
}

/** Icon tile · title/description · trailing control (Figma "Dòng · …"). */
export function SettingRow({
  icon,
  title,
  description,
  action,
  trailing,
  className,
}: SettingRowProps) {
  return (
    <div className={cn("relative flex items-center gap-3 lg:gap-3.5", className)}>
      <IconTile src={icon} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground lg:truncate">{description}</p>
        )}
      </div>
      {trailing}
      {action && (
        <>
          <RowButton onClick={action.onClick} className="hidden lg:inline-flex">
            {action.label}
          </RowButton>
          {/* Mobile: the full row is the hit target. */}
          <button
            type="button"
            onClick={action.onClick}
            aria-label={`${title}: ${action.label}`}
            className="absolute inset-0 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring/30 lg:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- static 16px icon */}
          <img src="/icons/account/chevron-right.svg" alt="" width={16} height={16} className="shrink-0 lg:hidden" />
        </>
      )}
    </div>
  )
}

/** Vertical list of rows with dividers (dividers only on mobile when `mobileDividersOnly`). */
export function SettingList({
  mobileDividersOnly,
  className,
  children,
}: {
  mobileDividersOnly?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-border *:py-2.5",
        mobileDividersOnly
          ? "lg:gap-3.5 lg:divide-y-0 lg:*:py-0"
          : "lg:*:py-3.5 lg:*:first:pt-0 lg:*:last:pb-0",
        className
      )}
    >
      {children}
    </div>
  )
}
