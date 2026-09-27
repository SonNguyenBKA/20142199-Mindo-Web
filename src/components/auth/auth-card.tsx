import * as React from "react"
import { cn } from "cn"

import { Logo } from "@/components/auth/logo"

type AuthCardProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Main content (fields, QR, status icon...) */
  children?: React.ReactNode
  /** Content between header and body, e.g. the segmented control */
  toolbar?: React.ReactNode
  /** Primary action area (buttons) */
  actions?: React.ReactNode
  /** Small centered text/link under the actions */
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({
  title,
  description,
  children,
  toolbar,
  actions,
  footer,
  className,
}: AuthCardProps) {
  return (
    <section
      className={cn(
        "flex w-full max-w-[480px] flex-col gap-[26px] rounded-card bg-card px-6 py-7 text-card-foreground shadow-card sm:px-12 sm:py-11",
        className
      )}
    >
      <header className="flex flex-col gap-3">
        <Logo />
        <h1 className="text-[26px] leading-9 font-bold sm:text-[30px] sm:leading-10">
          {title}
        </h1>
        {description && (
          <p className="text-[14.5px] leading-[22px] text-muted-foreground">
            {description}
          </p>
        )}
      </header>

      {toolbar}

      {children && <div className="flex flex-col gap-[18px]">{children}</div>}

      {(actions || footer) && (
        <div className="flex flex-col gap-4">
          {actions}
          {footer && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[13.5px] leading-5">
              {footer}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

/** Muted text + bold link pair used in card footers ("Chưa có tài khoản? Đăng ký"). */
export function AuthFooterText({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>
}
