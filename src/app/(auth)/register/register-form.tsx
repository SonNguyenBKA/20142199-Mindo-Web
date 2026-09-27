"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
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
import { getErrorField, getErrorMessage } from "@/lib/auth-errors"
import { registerSchema, type RegisterValues } from "@/lib/validations/auth"
import { authService } from "@/services/auth.service"

export function RegisterForm() {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      ref_by: "",
      accept_terms: false,
    },
  })

  const onSubmit = handleSubmit(async ({ ref_by, ...values }) => {
    setFormError(null)
    try {
      const res = await authService.register({
        ...values,
        ...(ref_by && { ref_by }),
      })
      const params = new URLSearchParams({
        email: res.user.email,
        flow: "register",
        cooldown: String(res.otp.resend_available_in),
      })
      router.push(`/verify-email?${params}`)
    } catch (err) {
      const field = getErrorField(err) as keyof RegisterValues | undefined
      if (field) setError(field, { message: getErrorMessage(err) }, { shouldFocus: true })
      else setFormError(getErrorMessage(err))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="contents">
      <AuthCard
        title="Tạo tài khoản"
        description="Bắt đầu cùng Mindo ngay hôm nay."
        className="gap-5"
        actions={
          <Button type="submit" size="xl" loading={isSubmitting}>
            Tạo tài khoản
          </Button>
        }
        footer={
          <>
            <AuthFooterText>Đã có tài khoản?</AuthFooterText>
            <TextLink href="/login">Đăng nhập</TextLink>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <FormField id="full_name" label="Họ và tên" error={errors.full_name?.message}>
            <Input
              id="full_name"
              autoComplete="name"
              placeholder="Nhập họ và tên"
              aria-invalid={!!errors.full_name || undefined}
              {...register("full_name")}
            />
          </FormField>

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
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
              aria-invalid={!!errors.password || undefined}
              {...register("password")}
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
              placeholder="Nhập lại mật khẩu"
              aria-invalid={!!errors.confirm_password || undefined}
              {...register("confirm_password")}
            />
          </FormField>

          <FormField
            id="ref_by"
            label="Mã giới thiệu (không bắt buộc)"
            error={errors.ref_by?.message}
          >
            <Input
              id="ref_by"
              autoComplete="off"
              placeholder="Nhập mã giới thiệu nếu có"
              aria-invalid={!!errors.ref_by || undefined}
              {...register("ref_by")}
            />
          </FormField>

          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-[11px] text-[13px] leading-5 text-muted-foreground">
              <Controller
                control={control}
                name="accept_terms"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={!!errors.accept_terms || undefined}
                  />
                )}
              />
              <span>
                Bằng việc đăng ký, tôi đã đọc và đồng ý với Điều khoản và Chính
                sách bảo mật của Mindo
              </span>
            </label>
            {errors.accept_terms && (
              <p className="text-[13px] leading-5 text-destructive">
                {errors.accept_terms.message}
              </p>
            )}
          </div>
        </div>

        {formError && <Alert>{formError}</Alert>}
      </AuthCard>
    </form>
  )
}
