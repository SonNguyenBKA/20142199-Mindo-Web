"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useApplyAgency } from "@/components/account/use-account"
import { FormField } from "@/components/auth/form-field"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/auth-errors"
import { agencyApplicationSchema, type AgencyApplicationValues } from "@/lib/validations/agency"
import type { AccountDetail } from "@/types/account"

/** Application form (POST /investor/agency/applications). */
export function AgencyApplyForm({ account, disabled }: { account?: AccountDetail; disabled?: boolean }) {
  const apply = useApplyAgency()
  const [formError, setFormError] = React.useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AgencyApplicationValues>({
    resolver: zodResolver(agencyApplicationSchema),
    values: {
      business_name: "",
      phone: account?.phone_number ?? "",
      address: account?.address ?? "",
      tax_code: "",
      parent_code: "",
    },
    resetOptions: { keepDirtyValues: true },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await apply.mutateAsync({
        business_name: values.business_name,
        phone: values.phone,
        address: values.address,
        ...(values.tax_code ? { tax_code: values.tax_code } : {}),
        ...(values.parent_code ? { parent_code: values.parent_code.toUpperCase() } : {}),
      })
      toast.success("Đã gửi hồ sơ đại lý")
    } catch (err) {
      const message = getErrorMessage(err)
      if (/tuyến trên/i.test(message)) return setError("parent_code", { message }, { shouldFocus: true })
      setFormError(message)
    }
  })

  const field = (name: keyof AgencyApplicationValues) => ({
    id: name,
    disabled,
    "aria-invalid": !!errors[name] || undefined,
    ...register(name),
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="business_name" label="Tên đại lý / hộ kinh doanh" error={errors.business_name?.message}>
        <Input placeholder="VD: Đại lý Mindo Hà Nội" autoComplete="organization" {...field("business_name")} />
      </FormField>
      <div className="grid gap-4 lg:grid-cols-2">
        <FormField id="phone" label="Số điện thoại" error={errors.phone?.message}>
          <Input type="tel" placeholder="Số điện thoại liên hệ" autoComplete="tel" {...field("phone")} />
        </FormField>
        <FormField id="tax_code" label="Mã số thuế (không bắt buộc)" error={errors.tax_code?.message}>
          <Input placeholder="Nhập mã số thuế" {...field("tax_code")} />
        </FormField>
      </div>
      <FormField id="address" label="Địa chỉ kinh doanh" error={errors.address?.message}>
        <Input placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" autoComplete="street-address" {...field("address")} />
      </FormField>
      <FormField id="parent_code" label="Mã đại lý tuyến trên (không bắt buộc)" error={errors.parent_code?.message}>
        <Input placeholder="VD: DLAB12CD" autoComplete="off" className="uppercase placeholder:normal-case" {...field("parent_code")} />
      </FormField>
      <p className="-mt-2 text-xs leading-[18px] text-muted-foreground">
        Để trống nếu không có. Hệ thống tự gắn người đã giới thiệu bạn làm tuyến trên nếu người đó là đại lý.
      </p>

      {formError && <Alert>{formError}</Alert>}

      <Button type="submit" size="xl" loading={isSubmitting} disabled={disabled} className="lg:w-60 lg:self-start">
        Gửi hồ sơ
      </Button>
    </form>
  )
}
