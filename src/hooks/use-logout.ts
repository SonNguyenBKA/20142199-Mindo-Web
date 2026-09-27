"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import * as React from "react"

import { authService } from "@/services/auth.service"

/** Clears the session cookies (BFF) and cached data, then returns to /login. */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [loggingOut, setLoggingOut] = React.useState(false)

  const logout = React.useCallback(async () => {
    setLoggingOut(true)
    await authService.logout().catch(() => null)
    queryClient.clear()
    router.replace("/login")
    router.refresh()
  }, [queryClient, router])

  return { logout, loggingOut }
}
