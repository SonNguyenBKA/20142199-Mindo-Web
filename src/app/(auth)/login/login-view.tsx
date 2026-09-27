"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { AuthCard } from "@/components/auth/auth-card"
import { SegmentedControl } from "@/components/ui/segmented-control"
import {
  createMockQrAuthService,
  parseQrDemo,
} from "@/services/qr-auth.service"

import { PasswordLoginForm, useNextPath } from "./password-login-form"
import { QrLoginPanel } from "./qr-login-panel"

type LoginMethod = "password" | "qr"

const METHOD_OPTIONS: { value: LoginMethod; label: string }[] = [
  { value: "password", label: "Mật khẩu" },
  { value: "qr", label: "Mã QR" },
]

export function LoginView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const nextPath = useNextPath()

  const method: LoginMethod =
    searchParams.get("method") === "qr" ? "qr" : "password"
  const qrDemo = parseQrDemo(searchParams.get("qrDemo"))
  const qrService = React.useMemo(() => createMockQrAuthService(qrDemo), [qrDemo])

  const setMethod = (value: LoginMethod) => {
    const params = new URLSearchParams(searchParams)
    if (value === "qr") params.set("method", "qr")
    else params.delete("method")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const header = {
    title: "Chào mừng trở lại.",
    description: "Đăng nhập để tiếp tục cùng Mindo.",
    toolbar: (
      <SegmentedControl
        aria-label="Cách đăng nhập"
        options={METHOD_OPTIONS}
        value={method}
        onValueChange={setMethod}
      />
    ),
  }

  if (method === "qr") {
    return (
      <AuthCard {...header}>
        <QrLoginPanel service={qrService} nextPath={nextPath} />
      </AuthCard>
    )
  }

  return <PasswordLoginForm header={header} />
}
