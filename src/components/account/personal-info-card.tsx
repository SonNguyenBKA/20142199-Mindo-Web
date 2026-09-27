"use client"

import { cn } from "cn"
import type * as React from "react"

import { AccountCard, CardError, TextAction } from "@/components/account/account-card"
import { useAccount, useReferralDashboard } from "@/components/account/use-account"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format"
import type { ReferralDashboard } from "@/types/account"

const EMPTY = <span className="font-normal text-placeholder">Chưa cập nhật</span>

export function PersonalInfoCard({ onEdit }: { onEdit: () => void }) {
  const account = useAccount()
  const referrals = useReferralDashboard()

  return (
    <AccountCard
      title="Thông tin cá nhân"
      action={
        <TextAction onClick={onEdit} disabled={!account.data}>
          Chỉnh sửa
        </TextAction>
      }
    >
      {account.isPending ? (
        <InfoSkeleton />
      ) : account.isError ? (
        <CardError onRetry={() => account.refetch()} className="mb-2 lg:mb-0" />
      ) : (
        (() => {
          const a = account.data
          const source = referralSource(referrals.data, referrals.isPending)
          return (
            <>
              {/* Desktop: 2-column grid */}
              <dl className="hidden grid-cols-2 gap-x-6 gap-y-3.5 lg:grid">
                <InfoField label="Họ và tên">{a.full_name}</InfoField>
                <InfoField label="Số điện thoại">{a.phone_number || EMPTY}</InfoField>
                <InfoField label="Email">{a.email}</InfoField>
                <InfoField label="Địa chỉ">{a.address || EMPTY}</InfoField>
                <InfoField label="Mã giới thiệu đã dùng khi đăng ký">
                  {source.code ? (
                    <>
                      {source.code}
                      {source.name && ` · ${source.name}`}
                    </>
                  ) : (
                    source.fallback
                  )}
                </InfoField>
                <InfoField label="Ngày tham gia">{formatDate(a.created_at)}</InfoField>
              </dl>

              {/* Mobile: label/value rows */}
              <dl className="flex flex-col divide-y divide-border lg:hidden">
                <InfoRow label="Họ và tên">{a.full_name}</InfoRow>
                <InfoRow label="Email">{a.email}</InfoRow>
                <InfoRow label="Số điện thoại">{a.phone_number || EMPTY}</InfoRow>
                <InfoRow label="Địa chỉ">{a.address || EMPTY}</InfoRow>
                <InfoRow label="Ngày tham gia">{formatDate(a.created_at)}</InfoRow>
                <div className="flex flex-col gap-1.5 py-2.5">
                  <dt className="text-[13px] text-muted-foreground">Mã giới thiệu đã dùng khi đăng ký</dt>
                  <dd className="flex min-w-0 items-center gap-2 rounded-tile bg-info-soft px-3 py-2">
                    {source.code ? (
                      <>
                        <span className="shrink-0 text-[13px] font-bold text-foreground">{source.code}</span>
                        {source.name && (
                          <span className="truncate text-[12.5px] text-muted-foreground">· {source.name}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">{source.fallback}</span>
                    )}
                  </dd>
                </div>
              </dl>
            </>
          )
        })()
      )}
    </AccountCard>
  )
}

/** Who referred this user: an investor code, a branch (system) code, or none. */
function referralSource(data: ReferralDashboard | undefined, loading: boolean) {
  if (data?.referred_by) {
    return { code: data.referred_by.referralCode, name: data.referred_by.fullName }
  }
  if (data?.system_code) {
    return { code: data.system_code.code, name: data.system_code.label }
  }
  return { code: null, name: null, fallback: loading ? "…" : "Không sử dụng" }
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[3px]">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-foreground">{children}</dd>
    </div>
  )
}

function InfoSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3.5 pb-2 lg:grid-cols-2 lg:gap-x-6 lg:pb-0", className)}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  )
}
