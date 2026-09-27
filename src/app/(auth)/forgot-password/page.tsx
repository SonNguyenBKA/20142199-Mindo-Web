import type { Metadata } from "next"

import { ForgotPasswordFlow } from "./forgot-password-flow"

export const metadata: Metadata = { title: "Quên mật khẩu · Mindo" }

export default function ForgotPasswordPage() {
  return <ForgotPasswordFlow />
}
