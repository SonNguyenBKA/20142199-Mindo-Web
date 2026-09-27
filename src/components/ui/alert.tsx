import * as React from "react"
import { cn } from "cn"

function Alert({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "flex w-full items-center gap-2 rounded-control bg-destructive-soft px-3.5 py-[11px] text-[13px] leading-5 font-medium text-destructive",
        className
      )}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/alert-circle.svg"
        alt=""
        width={18}
        height={18}
        className="size-[18px] shrink-0"
      />
      <p className="min-w-0 flex-1">{children}</p>
    </div>
  )
}

export { Alert }
