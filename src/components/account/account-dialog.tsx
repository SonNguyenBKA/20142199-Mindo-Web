"use client"

import { cn } from "cn"
import type * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/** Dialog shell shared by the account actions. Content unmounts on close, so forms reset. */
export function AccountDialog({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[calc(100dvh-2rem)] grid-cols-[minmax(0,1fr)] gap-5 overflow-y-auto rounded-panel p-6 sm:max-w-[440px]",
          className
        )}
      >
        <DialogHeader className="pr-6">
          <DialogTitle className="text-[17px] leading-6 font-bold text-foreground">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-[13px] leading-5">{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

/** Right-aligned footer buttons (stacked on mobile). */
export function DialogActions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">{children}</div>
}
