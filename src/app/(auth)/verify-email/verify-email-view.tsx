"use client"

import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { OtpStep } from "@/components/auth/otp-step"
import { SuccessCard } from "@/components/auth/success-card"
import { TextLink } from "@/components/auth/text-link"
import { authService } from "@/services/auth.service"

export function VerifyEmailView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const fromLogin = searchParams.get("flow") === "login"
  const cooldown = Number(searchParams.get("cooldown")) || 60
  const [verified, setVerified] = React.useState(false)

  React.useEffect(() => {
    if (!email) router.replace("/register")
  }, [email, router])

  if (!email) return null

  if (verified) {
    return (
      <SuccessCard
        title="Đăng ký thành công!"
        description="Email đã được xác thực. Tài khoản Mindo của bạn đã sẵn sàng."
        actionHref={`/login?${new URLSearchParams({ email })}`}
      />
    )
  }

  return (
    <OtpStep
      title="Xác thực email"
      email={email}
      submitLabel="Xác thực email"
      initialCooldown={cooldown}
      onVerify={async (otp) => {
        await authService.verifyAccount({ email, otp })
        setVerified(true)
      }}
      onResend={() => authService.resendRegisterOtp(email)}
      footer={
        fromLogin ? (
          <TextLink href="/login">Quay lại đăng nhập</TextLink>
        ) : (
          <TextLink href="/register">Quay lại đăng ký</TextLink>
        )
      }
    />
  )
}
