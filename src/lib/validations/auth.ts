import { z } from "zod"

// Rules mirror Mindo-API validators (api/src/auth/auth.dto.ts).

const email = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập email.")
  .email("Email không hợp lệ.")

const newPassword = z
  .string()
  .min(1, "Vui lòng nhập mật khẩu.")
  .min(8, "Mật khẩu tối thiểu 8 ký tự.")

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  remember_me: z.boolean(),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ và tên.")
      .min(2, "Họ và tên tối thiểu 2 ký tự."),
    email,
    password: newPassword,
    confirm_password: z.string().min(1, "Vui lòng nhập lại mật khẩu."),
    ref_by: z.string().trim(),
    accept_terms: z.boolean().refine((v) => v, {
      message: "Vui lòng đồng ý với Điều khoản và Chính sách bảo mật.",
    }),
  })
  .refine((v) => v.password === v.confirm_password, {
    path: ["confirm_password"],
    message: "Mật khẩu xác nhận không khớp.",
  })
export type RegisterValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    new_password: newPassword,
    confirm_password: z.string().min(1, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    path: ["confirm_password"],
    message: "Mật khẩu xác nhận không khớp.",
  })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
