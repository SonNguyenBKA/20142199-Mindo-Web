import { cn } from "cn"
import { RotateCwIcon } from "lucide-react"
import type * as React from "react"

/** White section card with a title row (Figma "Thẻ · …"). */
export function AccountCard({
  title,
  action,
  className,
  children,
}: {
  title: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-block border border-border bg-card px-4 pt-4 pb-2 lg:gap-3.5 lg:px-7 lg:py-[18px]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 pb-1.5 lg:pb-0">
        <h2 className="text-[15px] font-semibold text-foreground lg:text-[17px]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Blue text action used in card headers and overview rows ("Chỉnh sửa", "Xem"). */
export function TextAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 rounded-sm text-[12.5px] font-semibold text-link outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/30 lg:text-[13px]",
        className
      )}
      {...props}
    />
  )
}

/** Inline error with retry, sized for a card body. */
export function CardError({
  message = "Không tải được dữ liệu.",
  onRetry,
  className,
}: {
  message?: string
  onRetry: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-control bg-destructive-soft px-3.5 py-3 text-[13px] text-destructive",
        className
      )}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-1 font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-destructive/30"
      >
        <RotateCwIcon className="size-3.5" strokeWidth={2} />
        Thử lại
      </button>
    </div>
  )
}
