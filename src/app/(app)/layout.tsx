import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app/app-sidebar"
import { AppTopbar } from "@/components/app/app-topbar"
import { SessionProvider } from "@/components/app/session-context"
import { backendFetch } from "@/lib/server/backend"
import { ACCESS_COOKIE } from "@/lib/server/session"
import type { User } from "@/types/auth"
import type { Account } from "@/types/deposit"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // proxy.ts has already refreshed an expired token for this request.
  const token = (await cookies()).get(ACCESS_COOKIE)?.value
  if (!token) redirect("/login")

  const [me, account] = await Promise.all([
    backendFetch<User>("/investor/me", { token }),
    backendFetch<Account>("/investor/account", { token }),
  ])
  if (!me.ok) redirect("/login")

  const avatarUrl = account.ok
    ? (account.body.data.avatar?.public_url ?? account.body.data.avatar?.url ?? null)
    : null

  return (
    <SessionProvider value={{ user: me.body.data, avatarUrl }}>
      <div className="flex min-h-dvh flex-1">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] lg:block">
          <AppSidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col bg-card lg:bg-background lg:pl-[260px]">
          <AppTopbar />
          {children}
        </div>
      </div>
    </SessionProvider>
  )
}
