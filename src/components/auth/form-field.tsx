import * as React from "react"
import { cn } from "cn"

import { Label } from "@/components/ui/label"

type FormFieldProps = {
  id: string
  label: React.ReactNode
  error?: string
  className?: string
  children: React.ReactNode
}

/** Label + control + inline error. The control should set `id` and `aria-invalid`. */
export function FormField({
  id,
  label,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-[13px] leading-5 text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
