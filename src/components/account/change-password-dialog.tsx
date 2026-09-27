"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AccountDialog, DialogActions } from "@/components/account/account-dialog"
import { FormField } from "@/components/auth/form-field"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { getErrorField, getErrorMessage } from "@/lib/auth-errors"
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validations/account"
import { accountService } from "@/services/account.service"

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AccountDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Đổi mật khẩu"
      description="Mật khẩu mới tối thiểu 8 ký tự và khác mật khẩu hiện tại."
    >
      <ChangePasswordForm onDone={() => onOpenChange(false)} />
    </AccountDialog>
  )
}

const FIELDS: { name: keyof ChangePasswordValues; label: string; autoComplete: string }[] = [
  { name: "old_password", label: "Mật khẩu hiện tại", autoComplete: "current-password" },
  { name: "new_password", label: "Mật khẩu mới", autoComplete: "new-password" },
  { name: "confirm_password", label: "Nhập lại mật khẩu mới", autoComplete: "new-password" },
]

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [formError, setFormError] = React.useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await accountService.changePassword(values)
      toast.success("Đã đổi mật khẩu")
      onDone()
    } catch (err) {
      const field = getErrorField(err) as keyof ChangePasswordValues | undefined
      if (field && FIELDS.some((f) => f.name === field)) {
        setError(field, { message: getErrorMessage(err) }, { shouldFocus: true })
        return
      }
      setFormError(getErrorMessage(err))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {FIELDS.map(({ name, label, autoComplete }) => (
        <FormField key={name} id={name} label={label} error={errors[name]?.message}>
          <PasswordInput
            id={name}
            autoComplete={autoComplete}
            placeholder={label}
            aria-invalid={!!errors[name] || undefined}
            {...register(name)}
          />
        </FormField>
      ))}

      {formError && <Alert>{formError}</Alert>}

      <DialogActions>
        <Button type="button" variant="outline" size="md" onClick={onDone}>
          Huỷ
        </Button>
        <Button type="submit" size="md" loading={isSubmitting}>
          Đổi mật khẩu
        </Button>
      </DialogActions>
    </form>
  )
}
