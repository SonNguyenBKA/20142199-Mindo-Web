"use client"

import * as React from "react"
import { cn } from "cn"

type SegmentedOption<T extends string> = {
  value: T
  label: React.ReactNode
}

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
  /** Extra classes for each option button (e.g. `data-[active=false]:text-muted-foreground`). */
  itemClassName?: string
  "aria-label"?: string
}

function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  className,
  itemClassName,
  ...props
}: SegmentedControlProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  )

  return (
    <div
      role="tablist"
      data-slot="segmented-control"
      aria-label={props["aria-label"]}
      className={cn(
        "relative grid h-11 w-full rounded-[14px] bg-muted p-1",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-[11px] bg-primary transition-transform duration-200 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative z-10 h-full rounded-[11px] text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30",
              active
                ? "font-bold text-primary-foreground"
                : "font-medium text-foreground",
              itemClassName
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { SegmentedControl, type SegmentedOption }
