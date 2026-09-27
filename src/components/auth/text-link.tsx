import Link from "next/link"
import { cn } from "cn"
import type * as React from "react"

/** Bold primary-coloured link used throughout the auth screens. */
export function TextLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline",
        className
      )}
      {...props}
    />
  )
}

/** Same look as TextLink but for in-page actions. */
export function TextButton({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
