"use client"

import * as React from "react"

import { AuthCard } from "@/components/auth/auth-card"
import { OTP_LENGTH, OtpField } from "@/components/auth/otp-field"
import { ResendTimer, SpamHint } from "@/components/auth/resend-timer"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useCountdown } from "@/hooks/use-countdown"
import { AuthErrorCode, getErrorCode, getErrorMessage } from "@/lib/auth-errors"
import type { OtpDelivery } from "@/types/auth"

type OtpStepProps = {
  title: string
  email: string
  submitLabel: string
  /** Seconds before "Gửi lại mã" becomes available on first render. */
  initialCooldown?: number
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<OtpDelivery>
  footer?: React.ReactNode
}

const INCOMPLETE_MESSAGE = "Vui lòng nhập đủ mã xác thực 6 số."

/** Shared "enter the 6-digit code" card (email verification + forgot password). */
export function OtpStep({
  title,
  email,
  submitLabel,
  initialCooldown = 60,
  onVerify,
  onResend,
  footer,
}: OtpStepProps) {
  const [otp, setOtp] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [otpInvalid, setOtpInvalid] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [resending, setResending] = React.useState(false)
  const countdown = useCountdown(initialCooldown)

  const complete = otp.length === OTP_LENGTH

  const handleChange = (value: string) => {
    setOtp(value)
    setError(null)
    setOtpInvalid(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!complete) {
      setError(INCOMPLETE_MESSAGE)
      return
    }
    setSubmitting(true)
    try {
      await onVerify(otp)
    } catch (err) {
      setError(getErrorMessage(err))
      setOtpInvalid(getErrorCode(err) === AuthErrorCode.OtpInvalid)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    try {
      const res = await onResend()
      setOtp("")
      setOtpInvalid(false)
      countdown.start(res.resend_available_in || 60)
    } catch (err) {
      setError(getErrorMessage(err))
      if (getErrorCode(err) === AuthErrorCode.OtpCooldown) countdown.start(60)
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="contents">
      <AuthCard
        title={title}
        description={`Nhập mã 6 số đã được gửi đến ${email}`}
        actions={
          <Button
            type="submit"
            size="xl"
            loading={submitting}
            aria-disabled={!complete || undefined}
            className={
              complete ? undefined : "bg-disabled hover:bg-disabled"
            }
          >
            {submitLabel}
          </Button>
        }
        footer={footer}
      >
        <OtpField
          value={otp}
          onChange={handleChange}
          invalid={otpInvalid}
          disabled={submitting}
        />
        {error && <Alert>{error}</Alert>}
        <ResendTimer
          remaining={countdown.remaining}
          onResend={handleResend}
          sending={resending}
        />
        <SpamHint />
      </AuthCard>
    </form>
  )
}
