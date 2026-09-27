"use client"

import { cn } from "cn"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import * as React from "react"

import { StatusIcon } from "@/components/auth/status-icon"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { formatMMSS, useCountdown } from "@/hooks/use-countdown"
import type {
  QrAuthService,
  QrSession,
  QrStatus,
} from "@/services/qr-auth.service"

type QrLoginPanelProps = {
  service: QrAuthService
  nextPath: string
  /** Ô "Ghi nhớ đăng nhập" — giá trị được đọc lúc nhận phiên, xem `createHttpQrAuthService` */
  remember: boolean
  onRememberChange: (value: boolean) => void
}

export function QrLoginPanel({
  service,
  nextPath,
  remember,
  onRememberChange,
}: QrLoginPanelProps) {
  const router = useRouter()
  const [session, setSession] = React.useState<QrSession | null>(null)
  const [status, setStatus] = React.useState<QrStatus>("pending")
  const countdown = useCountdown()
  const { start } = countdown

  const createSession = React.useCallback(async () => {
    try {
      const next = await service.createSession()
      setSession(next)
      setStatus("pending")
      start(Math.ceil((next.expiresAt - Date.now()) / 1000))
    } catch {
      /* Mất mạng / máy chủ lỗi: về trạng thái hết hạn để có nút "Tạo mã mới",
         thay vì treo một khung trống không có gì để bấm. */
      setStatus("expired")
    }
  }, [service, start])

  React.useEffect(() => {
    // Initial session is created once on mount; later ones come from user actions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void createSession()
  }, [createSession])

  React.useEffect(() => {
    if (!session) return
    return service.subscribe(session, setStatus)
  }, [service, session])

  React.useEffect(() => {
    if (status !== "approved" || !service.createsRealSession) return
    const id = window.setTimeout(() => {
      router.replace(nextPath)
      router.refresh()
    }, 1200)
    return () => window.clearTimeout(id)
  }, [status, service.createsRealSession, router, nextPath])

  if (status === "rejected") {
    return (
      <StateBlock
        icon={<StatusIcon variant="error" />}
        title="Yêu cầu đã bị từ chối"
        description="Yêu cầu đăng nhập đã bị từ chối trên điện thoại."
      >
        <Button size="xl" onClick={createSession}>
          Thử lại
        </Button>
      </StateBlock>
    )
  }

  if (status === "approved") {
    return (
      <StateBlock
        icon={<StatusIcon variant="success-solid" />}
        title="Đăng nhập thành công"
        description="Đang chuyển vào Mindo…"
      />
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        status === "pending" ? "gap-[17px]" : "gap-5"
      )}
    >
      <div className="relative size-[200px]">
        <div
          className={cn(
            "size-full bg-card text-primary transition-opacity",
            status !== "pending" && "opacity-20"
          )}
        >
          {session && (
            <QRCodeSVG
              value={session.qrValue}
              size={200}
              fgColor="currentColor"
              bgColor="transparent"
              level="M"
              title="Mã QR đăng nhập Mindo"
            />
          )}
        </div>

        {status === "scanned" && (
          <StatusIcon
            variant="success-solid"
            className="absolute top-16 left-1/2 -translate-x-1/2"
          />
        )}

        {status === "expired" && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80">
            <Button size="md" className="w-40" onClick={createSession}>
              Tạo mã mới
            </Button>
          </div>
        )}
      </div>

      {status === "pending" && (
        <>
          <ol className="flex w-full flex-col gap-0.5 text-sm leading-[22px] text-muted-foreground">
            <li>1. Mở app Mindo trên điện thoại</li>
            <li>2. Vào mục Cá nhân</li>
            <li>3. Chọn Quét mã đăng nhập web</li>
          </ol>
          <p
            aria-live="polite"
            className="text-[13px] leading-5 font-medium text-muted-foreground"
          >
            Mã hết hạn sau {formatMMSS(countdown.remaining)}
          </p>
          <RememberBox checked={remember} onChange={onRememberChange} />
        </>
      )}

      {status === "scanned" && (
        <>
          <StateText
            title="Đã quét"
            description="Xác nhận trên điện thoại của bạn."
          />
          <p className="text-[13px] leading-5 font-medium text-muted-foreground">
            Đang chờ xác nhận…
          </p>
          <RememberBox checked={remember} onChange={onRememberChange} />
        </>
      )}

      {status === "expired" && (
        <StateText
          title="Mã đã hết hạn"
          description="Tạo mã mới để tiếp tục đăng nhập."
        />
      )}
    </div>
  )
}

/**
 * Cùng kiểu với ô "Ghi nhớ đăng nhập" của tab Mật khẩu. Hiện cả khi đang chờ
 * quét lẫn khi đã quét: giá trị chỉ được đọc lúc nhận phiên, nên đổi ý sau khi
 * quét, trước khi bấm xác nhận trên điện thoại, vẫn còn kịp.
 */
function RememberBox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-[9px] text-[13.5px] leading-5 text-muted-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
      />
      Ghi nhớ đăng nhập
    </label>
  )
}

function StateText({ title, description }: { title: string; description: string }) {
  return (
    <>
      <p className="text-[17px] leading-[22px] font-bold text-foreground">{title}</p>
      <p className="text-sm leading-[22px] text-muted-foreground">{description}</p>
    </>
  )
}

function StateBlock({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div aria-live="polite" className="flex flex-col items-center gap-5 text-center">
      {icon}
      <StateText title={title} description={description} />
      {children}
    </div>
  )
}
