"use client"

import { AccountCard } from "@/components/account/account-card"
import { SettingList, SettingRow } from "@/components/account/setting-row"
import { useAccountSettings, useUpdateSettings } from "@/components/account/use-account"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import type { Language } from "@/types/account"

const LANGUAGES: Record<Language, string> = { vi: "Tiếng Việt", en: "English" }

export function PreferencesCard({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  const settings = useAccountSettings()
  const update = useUpdateSettings()
  const data = settings.data

  return (
    <AccountCard title="Tuỳ chọn">
      <SettingList mobileDividersOnly>
        <SettingRow
          icon="/icons/account/globe.svg"
          title="Ngôn ngữ"
          trailing={
            data ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Chọn ngôn ngữ"
                  className="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-tile border border-border bg-card pr-2.5 pl-3.5 text-[13px] font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  {LANGUAGES[data.language] ?? data.language}
                  {/* eslint-disable-next-line @next/next/no-img-element -- static 14px icon */}
                  <img src="/icons/account/chevron-down.svg" alt="" width={14} height={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuRadioGroup
                    value={data.language}
                    onValueChange={(value) => {
                      if (value !== data.language) update.mutate({ language: value as Language })
                    }}
                  >
                    {Object.entries(LANGUAGES).map(([value, label]) => (
                      <DropdownMenuRadioItem key={value} value={value} closeOnClick className="py-2 text-[13px]">
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Skeleton className="h-[34px] w-28 rounded-tile" />
            )
          }
        />
        <SettingRow
          icon="/icons/account/bell.svg"
          title="Nhận thông báo qua email"
          trailing={
            data ? (
              <Switch
                aria-label="Nhận thông báo qua email"
                checked={data.email_notifications}
                onCheckedChange={(checked) => update.mutate({ email_notifications: checked })}
              />
            ) : (
              <Skeleton className="h-6 w-10 rounded-full" />
            )
          }
        />
        {/* Desktop: hint + red link. Mobile: centred red action. */}
        <div className="flex items-center justify-center lg:justify-between lg:pt-1!">
          <p className="hidden text-[12.5px] text-muted-foreground lg:block">
            Xoá tài khoản vĩnh viễn và toàn bộ dữ liệu
          </p>
          <button
            type="button"
            onClick={onDeleteAccount}
            className="rounded-sm py-1 text-[13px] font-semibold text-destructive outline-none hover:underline focus-visible:ring-2 focus-visible:ring-destructive/30 lg:py-0"
          >
            Xoá tài khoản
          </button>
        </div>
      </SettingList>
    </AccountCard>
  )
}
