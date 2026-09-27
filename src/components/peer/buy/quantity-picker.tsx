"use client"

import { cn } from "cn"
import { MinusIcon, PlusIcon } from "lucide-react"
import * as React from "react"


const PRESETS = [10, 50, 200]

/** − [ qty ] + with quick picks (Figma "Bộ đếm" + "Chọn nhanh"). */
export function QuantityPicker({
  value,
  max,
  hint,
  onChange,
}: {
  value: number
  /** Largest quantity allowed for this order. */
  max: number
  hint: string
  onChange: (qty: number) => void
}) {
  const clamp = (n: number) => Math.min(max, Math.max(1, Math.round(n)))
  // Local text so the field can be empty while typing.
  const [text, setText] = React.useState(String(value))
  const [synced, setSynced] = React.useState(value)
  if (synced !== value) {
    // Parent changed the value (buttons, presets): mirror it into the field.
    setSynced(value)
    setText(String(value))
  }

  const commit = (raw: string) => {
    const n = Number(raw.replace(/\D/g, ""))
    const next = n > 0 ? clamp(n) : value
    setText(String(next))
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2.5 lg:gap-3.5">
      <h2 className="text-[15px] font-semibold text-foreground lg:text-lg">Chọn số lượng</h2>
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
        <div className="flex items-center gap-2 lg:gap-3">
          <StepButton aria-label="Giảm" disabled={value <= 1} onClick={() => onChange(clamp(value - 1))}>
            <MinusIcon />
          </StepButton>
          <input
            aria-label="Số lượng Peer"
            inputMode="numeric"
            value={text}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 3)
              setText(digits)
              if (Number(digits) > 0) onChange(clamp(Number(digits)))
            }}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit(e.currentTarget.value)}
            className="h-11 min-w-0 flex-1 rounded-control border-[1.5px] border-primary bg-card text-center text-lg font-semibold text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/20 lg:h-12 lg:w-[120px] lg:flex-none"
          />
          <StepButton
            aria-label="Tăng"
            disabled={value >= max}
            onClick={() => onChange(clamp(value + 1))}
          >
            <PlusIcon />
          </StepButton>
        </div>
        <div className="flex gap-2 lg:ml-3">
          {PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              disabled={n > max}
              aria-pressed={value === n}
              className={cn(
                "flex-1 rounded-full border py-2 text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-40 lg:flex-none lg:px-4 lg:py-[9px] lg:text-[13px]",
                value === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              )}
            >
              {n} Peer
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-placeholder lg:text-xs">{hint}</p>
    </div>
  )
}

function StepButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-control border border-border bg-input-bg text-muted-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50 lg:size-12 [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}
