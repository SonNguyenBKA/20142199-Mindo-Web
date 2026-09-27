"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { pageTitle } from "@/components/app/nav-items"
import { useSession } from "@/components/app/session-context"
import { UserAvatar } from "@/components/app/user-avatar"
import { formatVnd } from "@/lib/format"
import { ACCOUNT_PATH } from "@/lib/routes"

/** Desktop topbar (≥ lg): page title, wallet balance, avatar. */
export function AppTopbar() {
  const pathname = usePathname()
  const { user } = useSession()
  const { title } = pageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 hidden h-[76px] shrink-0 items-center justify-between gap-6 border-b border-border bg-card px-8 lg:flex">
      <h1 className="truncate text-xl leading-7 font-bold text-foreground">{title}</h1>
      <div className="flex shrink-0 items-center gap-3.5">
        <div className="flex h-[42px] w-[210px] flex-col justify-center rounded-control bg-muted px-3.5">
          <span className="text-[11px] leading-[14px] text-muted-foreground">Số dư ví</span>
          <span className="text-sm leading-[18px] font-bold text-foreground">
            {formatVnd(user.balance_vnd)}
          </span>
        </div>
        <Link
          href={ACCOUNT_PATH}
          aria-label="Tài khoản của tôi"
          className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <UserAvatar />
        </Link>
      </div>
    </header>
  )
}
