"use client"

import { cn } from "cn"

import { useSession } from "@/components/app/session-context"
import { initials } from "@/lib/format"

export function UserAvatar({ className }: { className?: string }) {
  const { user, avatarUrl } = useSession()
  const name = user.full_name || user.email

  return (
    <div
      title={name}
      className={cn(
        "flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground",
        className
      )}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed BE URL, not optimisable
        <img src={avatarUrl} alt={name} className="size-full object-cover" />
      ) : (
        <span aria-label={name}>{initials(name)}</span>
      )}
    </div>
  )
}
