"use client"

import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { STATUS_OPTIONS } from "@/components/deposit/deposit-status"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { formatDateInput } from "@/lib/format"
import type { DepositHistoryFilters, DepositSource, DepositStatus } from "@/types/deposit"

/** Wording for the "source" select — reused as "Bộ sưu tập" on the Peer history page. */
export type FilterLabels = { source: string; sourcePlaceholder: string; sheetTitle: string }

const DEPOSIT_LABELS: FilterLabels = {
  source: "Nguồn nạp",
  sourcePlaceholder: "Tất cả nguồn nạp",
  sheetTitle: "Bộ lọc lịch sử nạp tiền",
}

type FiltersProps = {
  value: DepositHistoryFilters
  sources: DepositSource[]
  active: boolean
  disabled?: boolean
  onApply: (filters: DepositHistoryFilters) => void
  onReset: () => void
  labels?: FilterLabels
}

/** Draft copy of the applied filters; re-synced whenever the URL changes. */
function useDraft(value: DepositHistoryFilters) {
  const [draft, setDraft] = React.useState(value)
  const key = JSON.stringify(value)
  const [syncedKey, setSyncedKey] = React.useState(key)
  if (key !== syncedKey) {
    setSyncedKey(key)
    setDraft(value)
  }
  const set = <K extends keyof DepositHistoryFilters>(k: K, v: DepositHistoryFilters[K]) =>
    setDraft((d) => ({ ...d, [k]: v || undefined }))
  const invalidRange = !!draft.from && !!draft.to && draft.from > draft.to
  return { draft, set, invalidRange }
}

// ---------- Field primitives ----------

const fieldBase =
  "w-full min-w-0 border bg-input-bg px-3.5 text-foreground outline-none transition-colors focus-visible:border-primary disabled:cursor-not-allowed"
/** Desktop: 44px / r12 / 13px. Mobile: 52px / r14 / 14px on bg-muted. */
const fieldSize =
  "h-[52px] rounded-action bg-muted text-sm lg:h-11 lg:rounded-control lg:bg-input-bg lg:text-[13px] lg:font-medium"

function fieldState(filled: boolean) {
  return filled
    ? "border-[1.5px] border-primary text-foreground"
    : "border-border text-placeholder"
}

function FilterLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[13px] leading-[18px] font-medium text-foreground lg:text-xs lg:leading-[17px] lg:text-muted-foreground"
    >
      {children}
    </label>
  )
}

function DateField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  disabled,
}: {
  id: string
  label: string
  value?: string
  onChange: (v: string) => void
  min?: string
  max?: string
  disabled?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 lg:gap-[3px]">
      <FilterLabel htmlFor={id}>{label}</FilterLabel>
      <input
        id={id}
        type="date"
        value={value ?? ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label={value ? `${label}: ${formatDateInput(value)}` : label}
        className={cn(fieldBase, fieldSize, fieldState(!!value), "[&::-webkit-calendar-picker-indicator]:opacity-60")}
      />
    </div>
  )
}

function SelectField({
  id,
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  id: string
  label: string
  value?: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 lg:gap-[3px]">
      <FilterLabel htmlFor={id}>{label}</FilterLabel>
      <div className="relative">
        <select
          id={id}
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldBase, fieldSize, fieldState(!!value), "appearance-none pr-10")}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-placeholder"
        />
      </div>
    </div>
  )
}

function StatusChips({
  value,
  onChange,
  disabled,
}: {
  value?: DepositStatus
  onChange: (v?: DepositStatus) => void
  disabled?: boolean
}) {
  const options: { value?: DepositStatus; label: string }[] = [
    { value: undefined, label: "Tất cả" },
    ...STATUS_OPTIONS,
  ]
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-[5px]">
      <legend className="mb-[5px] text-xs leading-[17px] font-medium text-muted-foreground">
        Trạng thái
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const selected = o.value === value
          return (
            <button
              key={o.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "h-[34px] w-full rounded-full px-3 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed",
                selected
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "border border-border bg-card font-medium text-muted-foreground hover:bg-muted"
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

const sourceOptions = (sources: DepositSource[]) =>
  sources.map((s) => ({ value: s.value, label: s.label }))

// ---------- Desktop panel ----------

export function DepositFilterPanel({
  value,
  sources,
  active,
  disabled,
  onApply,
  onReset,
  labels = DEPOSIT_LABELS,
}: FiltersProps) {
  const { draft, set, invalidRange } = useDraft(value)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!invalidRange) onApply(draft)
      }}
      className={cn(
        // Sticky below the 76px topbar while the list scrolls.
        "sticky top-[100px] hidden max-h-[calc(100dvh-124px)] min-h-[min(626px,calc(100dvh-124px))] flex-col overflow-y-auto rounded-panel border border-border bg-card p-5 lg:flex",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base leading-6 font-bold text-foreground">Bộ lọc</h2>
        {active && (
          <span className="rounded-full bg-success-soft px-3 text-[11px] leading-6 font-semibold text-foreground">
            Đang lọc
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <DateField id="filter-from" label="Từ ngày" value={draft.from} max={draft.to} disabled={disabled} onChange={(v) => set("from", v)} />
        <DateField id="filter-to" label="Đến ngày" value={draft.to} min={draft.from} disabled={disabled} onChange={(v) => set("to", v)} />
        <SelectField
          id="filter-source"
          label={labels.source}
          value={draft.source}
          placeholder={labels.sourcePlaceholder}
          options={sourceOptions(sources)}
          disabled={disabled}
          onChange={(v) => set("source", v)}
        />
        <StatusChips value={draft.status} disabled={disabled} onChange={(v) => set("status", v)} />
        {invalidRange && <RangeError />}
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <Button type="submit" size="action" disabled={disabled || invalidRange}>
          Áp dụng bộ lọc
        </Button>
        <Button type="button" size="action" variant="outline" disabled={disabled} onClick={onReset}>
          Đặt lại
        </Button>
      </div>
    </form>
  )
}

// ---------- Mobile bottom sheet ----------

export function DepositFilterSheet({
  open,
  onOpenChange,
  ...props
}: FiltersProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { value, sources, onApply, onReset, labels = DEPOSIT_LABELS } = props
  const { draft, set, invalidRange } = useDraft(value)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 rounded-t-3xl border-0 px-6 pt-2.5 pb-[max(2rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <div aria-hidden className="mx-auto h-1 w-9 rounded-[2px] bg-border" />
        <SheetTitle className="mt-3.5 text-lg leading-[26px] font-bold">
          {labels.sheetTitle}
        </SheetTitle>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (invalidRange) return
            onApply(draft)
            onOpenChange(false)
          }}
          className="mt-5 flex flex-col gap-[18px]"
        >
          <div className="grid grid-cols-2 gap-[13px]">
            <DateField id="sheet-from" label="Từ ngày" value={draft.from} max={draft.to} onChange={(v) => set("from", v)} />
            <DateField id="sheet-to" label="Đến ngày" value={draft.to} min={draft.from} onChange={(v) => set("to", v)} />
          </div>
          <SelectField
            id="sheet-source"
            label={labels.source}
            value={draft.source}
            placeholder={labels.sourcePlaceholder}
            options={sourceOptions(sources)}
            onChange={(v) => set("source", v)}
          />
          <SelectField
            id="sheet-status"
            label="Trạng thái"
            value={draft.status}
            placeholder="Tất cả"
            options={STATUS_OPTIONS}
            onChange={(v) => set("status", v as DepositStatus)}
          />
          {invalidRange && <RangeError />}

          <div className="mt-1.5 grid grid-cols-2 gap-[13px]">
            <Button
              type="button"
              variant="outline"
              className="h-[52px] rounded-action bg-muted text-[15px] font-bold"
              onClick={() => {
                onReset()
                onOpenChange(false)
              }}
            >
              Đặt lại
            </Button>
            <Button
              type="submit"
              disabled={invalidRange}
              className="h-[52px] rounded-action text-[15px] font-bold"
            >
              Áp dụng
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function RangeError() {
  return (
    <p role="alert" className="text-xs leading-[18px] text-destructive">
      Từ ngày phải trước hoặc bằng đến ngày.
    </p>
  )
}
