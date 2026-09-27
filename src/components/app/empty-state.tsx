import { cn } from "cn"
import type * as React from "react"

type EmptyStateProps = {
  icon: React.ReactNode
  tone?: "neutral" | "danger"
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/** Centered icon + title + description + action. Used for empty / error / coming-soon. */
export function EmptyState({
  icon,
  tone = "neutral",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex size-[88px] items-center justify-center rounded-full lg:size-20 [&_svg]:size-8",
          tone === "danger"
            ? "bg-destructive-soft text-destructive"
            : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <h2 className="mt-7 text-lg leading-[26px] font-bold text-foreground lg:mt-6 lg:text-[17px]">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 max-w-[300px] text-sm leading-5 text-muted-foreground lg:max-w-none lg:text-[13px]">
          {description}
        </p>
      )}
      {action && <div className="mt-8 lg:mt-7">{action}</div>}
    </div>
  )
}
