"use client"

import { cn } from "cn"
import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

/** Small icon button that copies `value` to the clipboard. */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string
  /** What is being copied, used in aria-label and toast. */
  label: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`Đã sao chép ${label.toLowerCase()}`)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Không sao chép được. Vui lòng sao chép thủ công.")
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Sao chép ${label.toLowerCase()}`}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30",
        className
      )}
    >
      {copied ? (
        <CheckIcon className="size-[18px] text-success-foreground" strokeWidth={2.2} />
      ) : (
        <CopyIcon className="size-[18px]" strokeWidth={1.8} />
      )}
    </button>
  )
}
