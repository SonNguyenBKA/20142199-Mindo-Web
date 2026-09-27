"use client"

import * as React from "react"

import { ChangePasswordDialog } from "@/components/account/change-password-dialog"
import { EditProfileDialog } from "@/components/account/edit-profile-dialog"
import { DeleteAccountDialog, QrInfoDialog } from "@/components/account/info-dialogs"
import { OverviewCard } from "@/components/account/overview-card"
import { PersonalInfoCard } from "@/components/account/personal-info-card"
import { PreferencesCard } from "@/components/account/preferences-card"
import { ProfileCard } from "@/components/account/profile-card"
import { ReferralCard } from "@/components/account/referral-card"
import { SecurityCard } from "@/components/account/security-card"
import { SessionsDialog } from "@/components/account/sessions-dialog"
import { useAccount } from "@/components/account/use-account"
import { MobileHeader } from "@/components/app/mobile-header"
import { useLogout } from "@/hooks/use-logout"

type DialogName = "profile" | "password" | "qr" | "sessions" | "delete"

/** "Tài khoản của tôi": 2 columns on desktop, a single column on mobile. */
export function AccountView() {
  const account = useAccount()
  const { logout, loggingOut } = useLogout()
  const [dialog, setDialog] = React.useState<DialogName | null>(null)
  const dialogProps = (name: DialogName) => ({
    open: dialog === name,
    onOpenChange: (open: boolean) => setDialog(open ? name : null),
  })
  const editProfile = () => setDialog("profile")

  return (
    <>
      <MobileHeader />

      <main className="flex flex-1 flex-col gap-4 px-6 pb-10 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:content-start lg:items-start lg:gap-6 lg:px-8 lg:py-7">
        <div className="flex flex-col gap-4">
          <ProfileCard onEdit={editProfile} />
          <ReferralCard />
          <OverviewCard />
        </div>

        <div className="flex flex-col gap-4">
          <PersonalInfoCard onEdit={editProfile} />
          <SecurityCard onOpen={setDialog} />
          <PreferencesCard onDeleteAccount={() => setDialog("delete")} />
        </div>

        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="h-[50px] rounded-block border border-border bg-muted text-sm font-semibold text-foreground outline-none transition-colors hover:bg-border focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60 lg:hidden"
        >
          {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
        </button>
      </main>

      <EditProfileDialog account={account.data} {...dialogProps("profile")} />
      <ChangePasswordDialog {...dialogProps("password")} />
      <QrInfoDialog {...dialogProps("qr")} />
      <SessionsDialog {...dialogProps("sessions")} />
      <DeleteAccountDialog {...dialogProps("delete")} />
    </>
  )
}
