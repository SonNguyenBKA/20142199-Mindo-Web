"use client"

import { cn } from "cn"
import * as React from "react"

import { Panel } from "@/components/topup/topup-shared"
import { Button } from "@/components/ui/button"
import { formatVnd } from "@/lib/format"

/** Mirrors Mindo-API `createDeposit`: min 10.000đ, no business maximum. */
export const TOPUP_MIN = 10_000
const PRESETS = [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000]

const groupDigits = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")

function amountError(amount: number | null) {
  if (amount === null) return "Vui lòng nhập số tiền muốn nạp."
  if (amount < TOPUP_MIN) return `Số tiền nạp tối thiểu là ${formatVnd(TOPUP_MIN)}.`
  return null
}

export function AmountStep({
  initialAmount,
  submitting,
  error: serverError,
  onSubmit,
}: {
  initialAmount?: number
  submitting?: boolean
  error?: string | null
  onSubmit: (amount: number) => void
}) {
  const [amount, setAmount] = React.useState<number | null>(initialAmount ?? null)
  const [touched, setTouched] = React.useState(false)
  const error = amountError(amount)
  const showError = touched && error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!error && amount !== null) onSubmit(amount)
  }

  return (
    <div className="flex flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,700px)_384px] lg:items-start lg:gap-8">
      <Panel className="lg:p-8">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <h2 className="text-[15px] leading-5 font-bold text-foreground lg:text-xl lg:leading-7">
            Số tiền muốn nạp
          </h2>
          <p className="mt-1 text-xs leading-4 text-muted-foreground lg:text-[13.5px] lg:leading-5">
            Tiền vào ví Mindo ngay sau khi hệ thống đối soát được giao dịch.
          </p>

          <label
            htmlFor="topup-amount"
            className={cn(
              "mt-3.5 flex h-20 items-center gap-3 rounded-[18px] border-2 bg-input-bg px-3.5 transition-colors focus-within:border-primary lg:mt-5 lg:px-6",
              showError ? "border-destructive focus-within:border-destructive" : "border-primary"
            )}
          >
            <input
              id="topup-amount"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              value={amount === null ? "" : groupDigits(amount)}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 12)
                setAmount(digits ? Number(digits) : null)
              }}
              onBlur={() => setTouched(true)}
              aria-invalid={!!showError || undefined}
              aria-describedby="topup-amount-hint"
              className="min-w-0 flex-1 bg-transparent text-[28px] leading-[38px] font-bold text-foreground outline-none placeholder:text-placeholder lg:text-[30px] lg:leading-10"
            />
            <span className="text-lg font-bold text-muted-foreground lg:text-2xl">đ</span>
          </label>
          <p
            id="topup-amount-hint"
            className={cn(
              "mt-2 text-[11.5px] leading-[15px] lg:text-[12.5px] lg:leading-[18px]",
              showError ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {showError || `Số tiền tối thiểu ${formatVnd(TOPUP_MIN)} mỗi lần`}
          </p>

          <p className="mt-3.5 text-xs leading-4 font-medium text-foreground lg:mt-5 lg:text-[13px] lg:leading-[18px]">
            Chọn nhanh
          </p>
          <div className="-mx-6 mt-2 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:pb-0">
            {PRESETS.map((preset) => {
              const selected = amount === preset
              return (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setAmount(preset)
                    setTouched(false)
                  }}
                  className={cn(
                    "h-10 shrink-0 rounded-full px-4 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 lg:h-11 lg:rounded-action lg:px-0 lg:text-[13px]",
                    selected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "border border-border bg-card font-medium text-muted-foreground hover:bg-muted"
                  )}
                >
                  {groupDigits(preset)}
                </button>
              )
            })}
          </div>

          {serverError && (
            <p role="alert" className="mt-4 text-[13px] leading-5 text-destructive">
              {serverError}
            </p>
          )}

          {/* Desktop actions live inside the card. */}
          <div className="mt-8 hidden flex-col gap-3.5 lg:flex">
            <Button type="submit" size="xl" loading={submitting}>
              Tiếp tục
            </Button>
            <TermsNote />
          </div>

          {/* Mobile: steps + note between chips and the bottom button. */}
          <div className="mt-4 flex flex-col gap-3 lg:hidden">
            <HowItWorks />
            <KeepContentNote />
          </div>
          <div className="mt-8 flex flex-col gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden">
            <Button type="submit" size="xl" loading={submitting}>
              Tiếp tục
            </Button>
            <TermsNote />
          </div>
        </form>
      </Panel>

      <Panel className="hidden p-7 lg:block">
        <HowItWorks />
        <div className="mt-14">
          <KeepContentNote />
        </div>
      </Panel>
    </div>
  )
}

const STEPS = [
  { title: "Nhập số tiền", body: "Chọn nhanh hoặc gõ số tiền bạn muốn nạp." },
  { title: "Quét mã QR", body: "Mở app ngân hàng, quét mã. Nội dung chuyển khoản đã điền sẵn." },
  { title: "Chờ đối soát", body: "Hệ thống tự đối soát, thường dưới 1 phút." },
]

function HowItWorks() {
  return (
    <div className="rounded-2xl bg-muted p-4 lg:rounded-none lg:bg-transparent lg:p-0">
      <h3 className="text-[13px] leading-[18px] font-bold text-foreground lg:text-base lg:leading-6">
        Nạp bằng chuyển khoản QR
      </h3>
      <ol className="mt-2.5 flex flex-col gap-3 lg:mt-5 lg:gap-9">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-2 lg:gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-[11px] font-bold text-foreground lg:size-[30px] lg:text-[13px]">
              {i + 1}
            </span>
            <span className="min-w-0 pt-0.5 lg:pt-1">
              <span className="block text-[13px] leading-4 font-semibold text-foreground lg:text-sm lg:leading-5">
                {step.title}
              </span>
              <span className="mt-0.5 block text-[11.5px] leading-[15px] text-muted-foreground lg:text-[12.5px] lg:leading-[19px]">
                {step.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function KeepContentNote() {
  return (
    <div className="rounded-2xl bg-warning-soft px-4 py-3.5 lg:rounded-action lg:bg-muted lg:px-[18px] lg:py-4">
      <p className="text-xs leading-[15px] font-semibold text-warning-foreground lg:text-[12.5px] lg:leading-[18px] lg:text-foreground">
        Giữ nguyên nội dung chuyển khoản
      </p>
      <p className="mt-1 text-[11.5px] leading-[15px] text-warning-foreground lg:text-xs lg:leading-[18px] lg:text-muted-foreground">
        Sai nội dung sẽ khiến giao dịch không tự đối soát được và phải xử lý thủ công.
      </p>
    </div>
  )
}

function TermsNote() {
  return (
    <p className="text-center text-[11.5px] leading-[14px] text-placeholder lg:text-xs lg:leading-[18px]">
      Bằng việc tiếp tục, bạn đồng ý với điều khoản nạp tiền của Mindo.
    </p>
  )
}
