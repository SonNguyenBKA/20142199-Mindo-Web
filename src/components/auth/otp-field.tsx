"use client"

import { REGEXP_ONLY_DIGITS } from "input-otp"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"

export const OTP_LENGTH = 6

type OtpFieldProps = {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  label?: string
}

export function OtpField({
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
  label = "Mã xác thực",
}: OtpFieldProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="otp">{label}</Label>
      <InputOTP
        id="otp"
        maxLength={OTP_LENGTH}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        disabled={disabled}
        aria-invalid={invalid || undefined}
      >
        <InputOTPGroup>
          {Array.from({ length: OTP_LENGTH }, (_, i) => (
            <InputOTPSlot key={i} index={i} aria-invalid={invalid || undefined} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}
