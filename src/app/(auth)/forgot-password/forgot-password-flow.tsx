"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { useForm } from "react-hook-form"

import { AuthCard } from "@/components/auth/auth-card"
import { FormField } from "@/components/auth/form-field"
import { OtpStep } from "@/components/auth/otp-step"
import { SuccessCard } from "@/components/auth/success-card"
import { TextButton, TextLink } from "@/components/auth/text-link"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthErrorCode, getErrorCode, getErrorMessage } from "@/lib/auth-errors"
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "@/lib/validations/auth"
import { authService } from "@/services/auth.service"

type Step =
  | { name: "email" }
  | { name: "otp"; email: string; cooldown: number }
  | { name: "reset"; email: string; resetToken: string }
  | { name: "done" }

export function ForgotPasswordFlow() {
  const [step, setStep] = React.useState<Step>({ name: "email" })

  switch (step.name) {
    case "email":
      return (
        <EmailStep
          onSent={(email, cooldown) => setStep({ name: "otp", email, cooldown })}
        />
      )
    case "otp":
      return (
        <OtpStep
          key={step.email}
          title="Nhập mã xác thực"
          email={step.email}
          submitLabel="Xác thực"
          initialCooldown={step.cooldown}
          onVerify={async (otp) => {
            const res = await authService.verifyForgotPasswordOtp({
              email: step.email,
              otp,
            })
            setStep({ name: "reset", email: step.email, resetToken: res.reset_token })
          }}
          onResend={() => authService.forgotPassword(step.email)}
          footer={
            <TextButton onClick={() => setStep({ name: "email" })}>
              Quay lại nhập email
            </TextButton>
          }
        />
      )
    case "reset":
      return (
        <ResetStep
          resetToken={step.resetToken}
          onDone={() => setStep({ name: "done" })}
          onRestart={() => setStep({ name: "email" })}
        />
      )
    case "done":
      return (
        <SuccessCard
          title="Đổi mật khẩu thành công!"
          description="Mật khẩu đã được cập nhật. Đăng nhập lại để tiếp tục cùng Mindo."
        />
      )
  }
}

function EmailStep({
  onSent,
}: {
  onSent: (email: string, cooldown: number) => void
}) {
  const [formError, setFormError] = React.useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null)
    try {
      const res = await authService.forgotPassword(email)
      onSent(email.toLowerCase(), res.resend_available_in || 60)
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="contents">
      <AuthCard
        title="Quên mật khẩu?"
        description="Nhập email đã đăng ký để nhận mã xác thực đặt lại mật khẩu."
        actions={
          <Button type="submit" size="xl" loading={isSubmitting}>
            Gửi mã xác thực
          </Button>
        }
        footer={<TextLink href="/login">Quay lại đăng nhập</TextLink>}
      >
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="Nhập email của bạn"
            aria-invalid={!!errors.email || undefined}
            {...register("email")}
          />
        </FormField>
        {formError && <Alert>{formError}</Alert>}
      </AuthCard>
    </form>
  )
}

function ResetStep({
  resetToken,
  onDone,
  onRestart,
}: {
  resetToken: string
  onDone: () => void
  onRestart: () => void
}) {
  const [formError, setFormError] = React.useState<string | null>(null)
  const [ticketExpired, setTicketExpired] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await authService.resetPassword({ reset_token: resetToken, ...values })
      onDone()
    } catch (err) {
      setFormError(getErrorMessage(err))
      setTicketExpired(getErrorCode(err) === AuthErrorCode.ResetTicketInvalid)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="contents">
      <AuthCard
        title="Đặt mật khẩu mới"
        description="Tạo mật khẩu mới để bảo vệ tài khoản."
        actions={
          <Button type="submit" size="xl" loading={isSubmitting}>
            Lưu mật khẩu mới
          </Button>
        }
        footer={<TextLink href="/login">Quay lại đăng nhập</TextLink>}
      >
        <FormField
          id="new_password"
          label="Mật khẩu mới"
          error={errors.new_password?.message}
        >
          <PasswordInput
            id="new_password"
            autoComplete="new-password"
            autoFocus
            placeholder="Tối thiểu 8 ký tự"
            aria-invalid={!!errors.new_password || undefined}
            {...register("new_password")}
          />
        </FormField>
        <FormField
          id="confirm_password"
          label="Xác nhận mật khẩu"
          error={errors.confirm_password?.message}
        >
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu mới"
            aria-invalid={!!errors.confirm_password || undefined}
            {...register("confirm_password")}
          />
        </FormField>
        {formError && (
          <Alert>
            {formError}{" "}
            {ticketExpired && (
              <TextButton onClick={onRestart} className="text-destructive">
                Thực hiện lại
              </TextButton>
            )}
          </Alert>
        )}
      </AuthCard>
    </form>
  )
}
