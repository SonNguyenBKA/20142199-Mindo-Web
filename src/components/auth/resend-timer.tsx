"use client"

import { TextButton } from "@/components/auth/text-link"
import { formatMMSS } from "@/hooks/use-countdown"

type ResendTimerProps = {
  remaining: number
  onResend: () => void
  sending?: boolean
}

/** "Gửi lại mã sau 00:45" → "Gửi lại mã" link when the countdown hits 0. */
export function ResendTimer({ remaining, onResend, sending }: ResendTimerProps) {
  return (
    <div className="text-[13px] leading-5 text-muted-foreground">
      {remaining > 0 ? (
        <span aria-live="polite">Gửi lại mã sau {formatMMSS(remaining)}</span>
      ) : (
        <TextButton onClick={onResend} disabled={sending}>
          {sending ? "Đang gửi…" : "Gửi lại mã"}
        </TextButton>
      )}
    </div>
  )
}

export function SpamHint() {
  return (
    <p className="text-[13px] leading-5 text-muted-foreground">
      Không thấy email? Hãy kiểm tra thư rác.
    </p>
  )
}
