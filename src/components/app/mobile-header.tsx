"use client"

import { cn } from "cn"
import { ChevronLeftIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { AppSidebar } from "@/components/app/app-sidebar"
import { pageTitle } from "@/components/app/nav-items"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

/** Square 36px icon button used in mobile headers. */
export function HeaderIconButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground outline-none transition-colors hover:bg-border focus-visible:ring-2 focus-visible:ring-primary/30 [&_svg]:size-5",
        className
      )}
      {...props}
    />
  )
}

type MobileHeaderProps = {
  title?: string
  /** Extra buttons placed before the menu button (e.g. filter). */
  actions?: React.ReactNode
  /** Custom back handler; defaults to router.back(). */
  onBack?: () => void
  /** Hide the menu button (e.g. on detail screens). */
  hideMenu?: boolean
  className?: string
}

/** Mobile (< lg) page header: back · title · actions · menu drawer. */
export function MobileHeader({
  title,
  actions,
  onBack,
  hideMenu,
  className,
}: MobileHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const heading = title ?? pageTitle(pathname).mobileTitle

  return (
    <header
      className={cn(
        "relative flex h-[68px] items-center justify-between gap-2 px-6 lg:hidden",
        className
      )}
    >
      <HeaderIconButton aria-label="Quay lại" onClick={onBack ?? (() => router.back())}>
        <ChevronLeftIcon strokeWidth={2} />
      </HeaderIconButton>

      <h1 className="pointer-events-none absolute inset-x-24 truncate text-center text-[17px] leading-6 font-semibold text-foreground">
        {heading}
      </h1>

      <div className="flex items-center gap-2">
        {actions}
        {!hideMenu && (
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <HeaderIconButton aria-label="Mở menu" onClick={() => setMenuOpen(true)}>
              <span aria-hidden className="flex w-4 flex-col gap-[3.2px]">
                <span className="h-[1.8px] rounded-[1px] bg-current" />
                <span className="h-[1.8px] rounded-[1px] bg-current" />
                <span className="h-[1.8px] rounded-[1px] bg-current" />
              </span>
            </HeaderIconButton>
            <SheetContent
              side="left"
              showCloseButton={false}
              className="gap-0 border-0 p-0 data-[side=left]:w-[280px] data-[side=left]:max-w-[85vw]"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <AppSidebar onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  )
}
