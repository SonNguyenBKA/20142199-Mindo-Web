"use client"

import * as React from "react"
import { cn } from "cn"
import { EyeOffIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative w-full">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-pressed={visible}
        className="absolute top-1/2 right-[19px] flex size-5 -translate-y-1/2 items-center justify-center rounded text-placeholder outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        {visible ? (
          <EyeOffIcon className="size-5" strokeWidth={1.67} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/icons/eye.svg" alt="" width={20} height={20} />
        )}
      </button>
    </div>
  )
}

export { PasswordInput }
