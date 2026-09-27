"use client"

import { AccountCard } from "@/components/account/account-card"
import { SettingList, SettingRow } from "@/components/account/setting-row"
import { useSessions } from "@/components/account/use-account"
import { deviceLabel } from "@/lib/device"
import type { AccountSession } from "@/types/account"

export type SecurityDialog = "password" | "qr" | "sessions"

export function SecurityCard({ onOpen }: { onOpen: (dialog: SecurityDialog) => void }) {
  const sessions = useSessions()

  return (
    <AccountCard title="Bảo mật & đăng nhập">
      <SettingList className="*:py-3">
        <SettingRow
          icon="/icons/account/lock.svg"
          title="Mật khẩu"
          description="Nên đổi mật khẩu định kỳ để bảo vệ tài khoản"
          action={{ label: "Đổi mật khẩu", onClick: () => onOpen("password") }}
        />
        <SettingRow
          icon="/icons/account/qr.svg"
          title="Đăng nhập bằng mã QR"
          description="Quét mã trên web bằng app Mindo để đăng nhập nhanh"
          action={{ label: "Tìm hiểu", onClick: () => onOpen("qr") }}
        />
        <SettingRow
          icon="/icons/account/devices.svg"
          title="Thiết bị đang đăng nhập"
          description={
            sessions.isPending
              ? "Đang tải…"
              : sessions.isError
                ? "Không tải được danh sách thiết bị"
                : describeSessions(sessions.data)
          }
          action={{ label: "Quản lý", onClick: () => onOpen("sessions") }}
        />
      </SettingList>
    </AccountCard>
  )
}

/** "2 thiết bị · Chrome trên macOS (thiết bị này), iPhone 15" */
export function describeSessions(sessions: AccountSession[]) {
  if (sessions.length === 0) return "Không có thiết bị nào"
  const sorted = [...sessions].sort((a, b) => Number(b.is_current) - Number(a.is_current))
  const names = sorted.map((s) => {
    const name = deviceLabel(s.device_name)
    return s.is_current ? `${name} (thiết bị này)` : name
  })
  return `${sessions.length} thiết bị · ${names.join(", ")}`
}
