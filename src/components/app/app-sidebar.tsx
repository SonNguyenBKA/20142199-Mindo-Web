"use client"

import { cn } from "cn"
import { LogOutIcon, UserRoundIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NAV_ITEMS, findNavItem } from "@/components/app/nav-items"
import { useLogout } from "@/hooks/use-logout"
import { ACCOUNT_PATH } from "@/lib/routes"

const itemClass =
  "flex h-[46px] items-center gap-3 rounded-control px-3.5 text-[13.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring"

export function AppSidebar({
  onNavigate,
  className,
}: {
  /** Called after a nav link is clicked (closes the mobile drawer). */
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()
  const active = findNavItem(pathname)
  const { logout, loggingOut } = useLogout()
  const onAccount = pathname === ACCOUNT_PATH

  return (
    <nav
      aria-label="Điều hướng chính"
      className={cn("flex h-full w-full flex-col bg-sidebar text-sidebar-foreground", className)}
    >
      <Link
        href="/lich-su-nap"
        onClick={onNavigate}
        className="mx-7 mt-[35px] flex h-8 items-center gap-2 outline-none"
      >
        <Image src="/logo.jpg" alt="" width={32} height={32} className="size-8 rounded-full" />
        <span className="text-[22px] leading-[30px] font-bold text-white">Mindo</span>
      </Link>

      <ul className="mt-14 flex flex-col gap-2 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item === active
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  itemClass,
                  isActive
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon
                  className={cn("size-5 shrink-0", isActive && "text-sidebar-primary")}
                  strokeWidth={1.8}
                />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto px-4 pb-[26px]">
        <div className="mx-3 mb-3 h-px bg-sidebar-border" />
        <Link
          href={ACCOUNT_PATH}
          onClick={onNavigate}
          aria-current={onAccount ? "page" : undefined}
          className={cn(
            itemClass,
            "mb-1",
            onAccount
              ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
        >
          <UserRoundIcon
            className={cn("size-5 shrink-0", onAccount && "text-sidebar-primary")}
            strokeWidth={1.8}
          />
          Tài khoản
        </Link>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className={cn(
            itemClass,
            "w-full hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground disabled:opacity-60"
          )}
        >
          <LogOutIcon className="size-5 shrink-0" strokeWidth={1.8} />
          {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
        </button>
      </div>
    </nav>
  )
}
