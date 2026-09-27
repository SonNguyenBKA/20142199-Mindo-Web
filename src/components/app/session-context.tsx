"use client"

import * as React from "react"

import type { User } from "@/types/auth"

type Session = { user: User; avatarUrl: string | null }

const SessionContext = React.createContext<Session | null>(null)

export function SessionProvider({
  value,
  children,
}: {
  value: Session
  children: React.ReactNode
}) {
  return <SessionContext value={value}>{children}</SessionContext>
}

export function useSession() {
  const session = React.useContext(SessionContext)
  if (!session) throw new Error("useSession must be used inside (app) layout")
  return session
}
