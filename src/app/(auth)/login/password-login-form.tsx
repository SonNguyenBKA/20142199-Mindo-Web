"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"

import { AuthCard, AuthFooterText } from "@/components/auth/auth-card"
import { FormField } from "@/components/auth/form-field"
import { TextLink } from "@/components/auth/text-link"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthErrorCode, getErrorCode, getErrorMessage } from "@/lib/auth-errors"
import { loginSchema, type LoginValues } from "@/lib/validations/auth"
import { HOME_PATH } from "@/lib/routes"
import { authService } from "@/services/auth.service"

/** Returns a safe in-app redirect target from `?next=`. */
export function useNextPath() {
  const next = useSearchParams().get("next")
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : HOME_PATH
}

type CardHeader = Pick<
  React.ComponentProps<typeof AuthCard>,
  "title" | "description" | "toolbar"
>

export function PasswordLoginForm({ header }: { header: CardHeader }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = useNextPath()
  const [formError, setFormError] = React.useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      password: "",
      remember_me: false,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await authService.login(values)
      router.replace(nextPath)
      router.refresh()
    } catch (err) {
      if (getErrorCode(err) === AuthErrorCode.EmailNotVerified) {
        // Account exists but email is unverified → send a fresh OTP and verify.
        await authService.resendRegisterOtp(values.email).catch(() => null)
        const params = new URLSearchParams({ email: values.email, flow: "login" })
        router.push(`/verify-email?${params}`)
        return
      }
      setFormError(getErrorMessage(err))
    }
  })

  const body = (
    <>
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Nhập email của bạn"
          aria-invalid={!!errors.email || undefined}
          {...register("email")}
        />
      </FormField>

      <FormField id="password" label="Mật khẩu" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          aria-invalid={!!errors.password || undefined}
          {...register("password")}
        />
      </FormField>

      <div className="flex items-center justify-between gap-3 text-[13.5px] leading-5">
        <label className="flex cursor-pointer items-center gap-[9px] text-muted-foreground">
          <Controller
            control={control}
            name="remember_me"
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          Ghi nhớ đăng nhập
        </label>
        <TextLink href="/forgot-password">Quên mật khẩu?</TextLink>
      </div>

      {formError && <Alert>{formError}</Alert>}
    </>
  )

  const actions = (
    <Button type="submit" size="xl" loading={isSubmitting}>
      Đăng nhập
    </Button>
  )

  const footer = (
    <>
      <AuthFooterText>Chưa có tài khoản?</AuthFooterText>
      <TextLink href="/register">Đăng ký</TextLink>
    </>
  )

  return (
    <form onSubmit={onSubmit} noValidate className="contents">
      <AuthCard {...header} actions={actions} footer={footer}>
        {body}
      </AuthCard>
    </form>
  )
}
