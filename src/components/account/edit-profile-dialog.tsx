"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AccountDialog, DialogActions } from "@/components/account/account-dialog"
import { useUpdateProfile } from "@/components/account/use-account"
import { FormField } from "@/components/auth/form-field"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isApiError } from "@/lib/api-error"
import { getErrorMessage } from "@/lib/auth-errors"
import { profileSchema, type ProfileValues } from "@/lib/validations/account"
import type { AccountDetail, UpdateProfileRequest } from "@/types/account"

export function EditProfileDialog({
  account,
  open,
  onOpenChange,
}: {
  account: AccountDetail | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AccountDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa hồ sơ"
      description="Email dùng để đăng nhập và không thể thay đổi."
    >
      {account && <ProfileForm account={account} onDone={() => onOpenChange(false)} />}
    </AccountDialog>
  )
}

function ProfileForm({ account, onDone }: { account: AccountDetail; onDone: () => void }) {
  const updateProfile = useUpdateProfile()
  const [formError, setFormError] = React.useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: account.full_name,
      phone_number: account.phone_number,
      address: account.address,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    // Only send what changed; the BE rejects empty strings for phone/address.
    const body: UpdateProfileRequest = {}
    for (const key of Object.keys(dirtyFields) as (keyof ProfileValues)[]) {
      if (values[key] !== "") body[key] = values[key]
    }
    if (Object.keys(body).length === 0) return onDone()

    try {
      await updateProfile.mutateAsync(body)
      toast.success("Đã cập nhật thông tin")
      onDone()
    } catch (err) {
      if (isApiError(err) && err.status === 409) {
        setError("phone_number", { message: getErrorMessage(err) })
        return
      }
      setFormError(getErrorMessage(err))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="full_name" label="Họ và tên" error={errors.full_name?.message}>
        <Input
          id="full_name"
          autoComplete="name"
          placeholder="Nhập họ và tên"
          aria-invalid={!!errors.full_name || undefined}
          {...register("full_name")}
        />
      </FormField>
      <FormField id="email" label="Email">
        <Input id="email" value={account.email} disabled readOnly />
      </FormField>
      <FormField id="phone_number" label="Số điện thoại" error={errors.phone_number?.message}>
        <Input
          id="phone_number"
          type="tel"
          autoComplete="tel"
          placeholder="Nhập số điện thoại"
          aria-invalid={!!errors.phone_number || undefined}
          {...register("phone_number")}
        />
      </FormField>
      <FormField id="address" label="Địa chỉ" error={errors.address?.message}>
        <Input
          id="address"
          autoComplete="street-address"
          placeholder="Nhập địa chỉ"
          aria-invalid={!!errors.address || undefined}
          {...register("address")}
        />
      </FormField>

      {formError && <Alert>{formError}</Alert>}

      <DialogActions>
        <Button type="button" variant="outline" size="md" onClick={onDone}>
          Huỷ
        </Button>
        <Button type="submit" size="md" loading={isSubmitting}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </form>
  )
}
