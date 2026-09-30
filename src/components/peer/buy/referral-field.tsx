import { cn } from "cn"
import { CheckCircle2Icon } from "lucide-react"

/** Figma "Mã giới thiệu": a user's or an agency's code — the BE accepts either. */
export function ReferralField({
  value,
  onChange,
  error,
  referrerName,
}: {
  value: string
  onChange: (code: string) => void
  error: string | null
  /** Set once the server has accepted the code. */
  referrerName: string | null
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="referral_code" className="text-[13px] font-medium text-foreground">
        Mã giới thiệu (không bắt buộc)
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-2.5 rounded-control border bg-input-bg px-3.5 focus-within:border-primary lg:w-[380px] lg:px-4",
          error ? "border-destructive" : "border-border"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static 20px icon */}
        <img src="/icons/account/gift.svg" alt="" width={20} height={20} className="size-5 shrink-0" />
        <input
          id="referral_code"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 64))}
          placeholder="Nhập mã của đại lý giới thiệu bạn"
          autoComplete="off"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "referral_code-error" : referrerName ? "referral_code-ok" : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground uppercase outline-none placeholder:text-placeholder placeholder:normal-case"
        />
      </div>
      {error ? (
        <p id="referral_code-error" className="text-[13px] leading-5 text-destructive">
          {error}
        </p>
      ) : (
        referrerName && (
          <p id="referral_code-ok" className="flex items-center gap-1.5 text-[13px] leading-5 text-success-strong">
            <CheckCircle2Icon className="size-4 shrink-0" strokeWidth={1.8} />
            Người giới thiệu: <b className="font-semibold">{referrerName}</b>
          </p>
        )
      )}
    </div>
  )
}
