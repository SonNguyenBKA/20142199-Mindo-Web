import { z } from "zod"

// Rules mirror Mindo-API CreateAgencyApplicationDto (api/src/phase2/phase2.dto.ts).

export const agencyApplicationSchema = z.object({
  business_name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên đại lý.")
    .min(2, "Tên đại lý tối thiểu 2 ký tự."),
  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại.")
    .regex(/^[+()\-\s\d]{8,20}$/, "Số điện thoại không hợp lệ."),
  address: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ.")
    .min(5, "Địa chỉ tối thiểu 5 ký tự."),
  tax_code: z.string().trim().max(20, "Mã số thuế tối đa 20 ký tự."),
  parent_code: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[A-Za-z0-9]{2,64}$/.test(v), "Mã đại lý chỉ gồm chữ và số."),
})
export type AgencyApplicationValues = z.infer<typeof agencyApplicationSchema>
