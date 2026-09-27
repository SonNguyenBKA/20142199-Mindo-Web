import { cn } from "cn"
import { CheckIcon, Clock3Icon, XIcon } from "lucide-react"
import type * as React from "react"

type Tone = "success" | "pending" | "danger"

const TONE: Record<Tone, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <CheckIcon strokeWidth={2} />,
    className: "bg-success-soft text-success-foreground",
  },
  pending: {
    icon: <Clock3Icon strokeWidth={2} />,
    className: "bg-warning-soft text-warning-foreground",
  },
  danger: {
    icon: <XIcon strokeWidth={2} />,
    className: "bg-destructive-soft text-destructive",
  },
}

/** Centered outcome card (Figma "Sở hữu Peer · Thành công / Thất bại"). */
export function ResultCard({
  tone,
  title,
  amount,
  rows,
  actions,
}: {
  tone: Tone
  title: string
  amount: string
  rows: React.ReactNode
  actions: React.ReactNode
}) {
  return (
    <div className="flex flex-1 justify-center lg:items-start lg:pt-4">
      <section className="flex w-full flex-col items-center py-6 lg:max-w-[466px] lg:rounded-block lg:border lg:border-border lg:bg-card lg:px-8 lg:py-8">
        <span
          className={cn(
            "flex size-[72px] items-center justify-center rounded-full [&_svg]:size-8 lg:size-[88px]",
            TONE[tone].className
          )}
        >
          {TONE[tone].icon}
        </span>
        <h2 className="mt-5 text-center text-lg font-bold text-foreground lg:text-[21px]">{title}</h2>
        <p
          className={cn(
            "mt-1 text-center text-[28px] leading-9 font-bold lg:text-[30px]",
            tone === "danger" ? "text-placeholder" : "text-foreground"
          )}
        >
          {amount}
        </p>
        <div className="mt-6 flex w-full flex-col divide-y divide-border rounded-block bg-muted px-4 *:py-3 lg:rounded-none lg:bg-transparent lg:px-0">
          {rows}
        </div>
        <div className="mt-7 flex w-full flex-col gap-3">{actions}</div>
      </section>
    </div>
  )
}
