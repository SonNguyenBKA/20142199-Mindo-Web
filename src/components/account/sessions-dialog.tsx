"use client"

import { MonitorIcon, SmartphoneIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { CardError } from "@/components/account/account-card"
import { AccountDialog, DialogActions } from "@/components/account/account-dialog"
import { RowButton } from "@/components/account/setting-row"
import { useRevokeSession, useSessions } from "@/components/account/use-account"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogout } from "@/hooks/use-logout"
import { getErrorMessage } from "@/lib/auth-errors"
import { deviceLabel } from "@/lib/device"
import { formatDateTime } from "@/lib/format"
import { accountService } from "@/services/account.service"
import type { AccountSession } from "@/types/account"

export function SessionsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AccountDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thiết bị đang đăng nhập"
      description="Đăng xuất những thiết bị bạn không nhận ra."
      className="sm:max-w-[480px]"
    >
      <SessionsBody />
    </AccountDialog>
  )
}

function SessionsBody() {
  const sessions = useSessions()
  const revoke = useRevokeSession()
  const { logout } = useLogout()
  const [confirmAll, setConfirmAll] = React.useState(false)
  const [revokingAll, setRevokingAll] = React.useState(false)

  const revokeAll = async () => {
    setRevokingAll(true)
    try {
      // The BE revokes every session, including this one → clear cookies and leave.
      await accountService.revokeAllSessions()
      toast.success("Đã đăng xuất tất cả thiết bị")
      await logout()
    } catch (err) {
      toast.error(getErrorMessage(err))
      setRevokingAll(false)
    }
  }

  if (sessions.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-[62px] rounded-control" />
        ))}
      </div>
    )
  }
  if (sessions.isError) return <CardError onRetry={() => sessions.refetch()} />

  const sorted = [...sessions.data].sort(
    (a, b) => Number(b.is_current) - Number(a.is_current) || b.last_used_at - a.last_used_at
  )

  return (
    <>
      <ul className="flex flex-col divide-y divide-border rounded-control border border-border">
        {sorted.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            revoking={revoke.isPending && revoke.variables === session.id}
            onRevoke={() => revoke.mutate(session.id)}
          />
        ))}
      </ul>

      {confirmAll ? (
        <div className="flex flex-col gap-3 rounded-control bg-destructive-soft p-4">
          <p className="text-[13px] leading-5 text-foreground">
            Tất cả thiết bị, kể cả thiết bị này, sẽ bị đăng xuất. Bạn cần đăng nhập lại.
          </p>
          <DialogActions>
            <Button variant="outline" size="md" onClick={() => setConfirmAll(false)} disabled={revokingAll}>
              Huỷ
            </Button>
            <Button size="md" className="bg-destructive hover:bg-destructive/90" loading={revokingAll} onClick={revokeAll}>
              Đăng xuất tất cả
            </Button>
          </DialogActions>
        </div>
      ) : (
        <Button variant="destructive" size="md" onClick={() => setConfirmAll(true)}>
          Đăng xuất tất cả thiết bị
        </Button>
      )}
    </>
  )
}

function SessionItem({
  session,
  revoking,
  onRevoke,
}: {
  session: AccountSession
  revoking: boolean
  onRevoke: () => void
}) {
  const Icon = session.device_type === "mobile" || session.device_type === "tablet" ? SmartphoneIcon : MonitorIcon
  const meta = [
    session.location,
    session.ip_address,
    `Hoạt động ${formatDateTime(new Date(session.last_used_at).toISOString())}`,
  ].filter(Boolean)

  return (
    <li className="flex items-center gap-3 px-3.5 py-3">
      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-tile bg-muted text-brand-deep">
        <Icon className="size-[18px]" strokeWidth={1.6} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="truncate" title={session.device_name}>{deviceLabel(session.device_name)}</span>
          {session.is_current && (
            <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
              Thiết bị này
            </span>
          )}
        </p>
        <p className="truncate text-xs text-muted-foreground">{meta.join(" · ")}</p>
      </div>
      {!session.is_current && (
        <RowButton onClick={onRevoke} disabled={revoking} className="text-destructive">
          {revoking ? "Đang xử lý…" : "Đăng xuất"}
        </RowButton>
      )}
    </li>
  )
}
