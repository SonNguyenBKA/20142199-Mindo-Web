import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { StatusIcon } from "@/components/auth/status-icon"
import { buttonVariants } from "@/components/ui/button"

type SuccessCardProps = {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

/** "Đăng ký thành công!" / "Đổi mật khẩu thành công!" card. */
export function SuccessCard({
  title,
  description,
  actionLabel = "Đăng nhập",
  actionHref = "/login",
}: SuccessCardProps) {
  return (
    <AuthCard
      title={title}
      description={description}
      actions={
        <Link href={actionHref} className={buttonVariants({ size: "xl" })}>
          {actionLabel}
        </Link>
      }
    >
      <div className="flex justify-center">
        <StatusIcon variant="success" />
      </div>
    </AuthCard>
  )
}
