import { z } from "zod"

// Rules mirror Mindo-API validators (api/src/account/account.dto.ts, api/src/auth/auth.dto.ts).

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên.")
    .min(2, "Họ và tên tối thiểu 2 ký tự."),
  phone_number: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[+()\-\s\d]{8,20}$/.test(v), "Số điện thoại không hợp lệ."),
  address: z
    .string()
    .trim()
    .refine((v) => v === "" || v.length >= 5, "Địa chỉ tối thiểu 5 ký tự."),
})
export type ProfileValues = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    new_password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới.")
      .min(8, "Mật khẩu tối thiểu 8 ký tự."),
    confirm_password: z.string().min(1, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    path: ["confirm_password"],
    message: "Mật khẩu xác nhận không khớp.",
  })
  .refine((v) => v.new_password !== v.old_password || v.new_password === "", {
    path: ["new_password"],
    message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
  })
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
