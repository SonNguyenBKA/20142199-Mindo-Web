"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { MobileHeader } from "@/components/app/mobile-header"
import { useSession } from "@/components/app/session-context"
import { AmountStep } from "@/components/topup/amount-step"
import { QrStep } from "@/components/topup/qr-step"
import {
  ExpiredStatus,
  FailedStatus,
  PendingStatus,
  SuccessStatus,
} from "@/components/topup/topup-status"
import { useCountdown } from "@/hooks/use-countdown"
import { getErrorMessage } from "@/lib/auth-errors"
import {
  createMockTopupService,
  createVietQrTopupService,
  type TopupOrder,
} from "@/services/topup.service"

type Step = "amount" | "qr" | "pending" | "expired"

export function TopupView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user } = useSession()
  // `?demo=` keeps the offline mock for design reviews; never in production.
  const demo = process.env.NODE_ENV === "production" ? null : searchParams.get("demo")
  const service = React.useMemo(
    () =>
      demo
        ? createMockTopupService({ demo, balance: Number(user.balance_vnd) || 0 })
        : createVietQrTopupService(),
    [demo, user.balance_vnd]
  )
  // One Idempotency-Key per "Tiếp tục": a double click or a retry after a timeout reuses it.
  const pendingKey = React.useRef<string | null>(null)

  const [step, setStep] = React.useState<Step>("amount")
  const [amount, setAmount] = React.useState<number | undefined>(2_000_000)
  const [order, setOrder] = React.useState<TopupOrder | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState<"cancel" | "confirm" | null>(null)
  const countdown = useCountdown()
  const { start } = countdown

  const create = async (value: number) => {
    setCreating(true)
    setCreateError(null)
    pendingKey.current ??= crypto.randomUUID()
    try {
      const next = await service.create(value, pendingKey.current)
      pendingKey.current = null
      setAmount(value)
      setOrder(next)
      start(Math.max(0, Math.ceil((next.expiresAt - Date.now()) / 1000)))
      setStep("qr")
    } catch (err) {
      setCreateError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  // Poll while the user is looking at the QR or waiting for reconciliation.
  const polling = !!order && (step === "qr" || step === "pending")
  const status = useQuery({
    queryKey: ["topup-status", order?.id],
    queryFn: () => service.getStatus(order as TopupOrder),
    enabled: polling,
    // Stop once the deposit is cancelled (here or from another device).
    refetchInterval: (q) => (polling && q.state.data?.status !== "cancelled" ? 3000 : false),
  })
  const cancelledElsewhere = status.data?.status === "cancelled"
  const result =
    status.data?.status === "pending" || status.data?.status === "cancelled" ? undefined : status.data

  // Settled → refresh balance (server layout) and the history list.
  React.useEffect(() => {
    if (!result) return
    void queryClient.invalidateQueries({ queryKey: ["deposit-history"] })
    router.refresh()
  }, [result, queryClient, router])

  // QR window elapsed without payment.
  const qrExpired = step === "qr" && !!order && countdown.done && !result
  const view: Step | "success" | "failed" = cancelledElsewhere
    ? "amount"
    : result
    ? result.status === "completed"
      ? "success"
      : "failed"
    : qrExpired
      ? "expired"
      : step

  const reset = () => {
    setOrder(null)
    setStep("amount")
    queryClient.removeQueries({ queryKey: ["topup-status"] })
  }

  const cancel = async () => {
    if (!order) return
    setBusy("cancel")
    const outcome = await service.cancel(order).catch((err) => {
      toast.error(getErrorMessage(err))
      return null
    })
    setBusy(null)
    if (outcome === "already-settled") {
      // The money landed first; the next poll moves to the success screen.
      toast.info("Tiền đã về, đang cập nhật số dư.")
      setStep("pending")
      return
    }
    if (outcome === "cancelled") {
      toast.info("Đã huỷ giao dịch nạp tiền.")
      reset()
    }
  }

  const confirmTransferred = async () => {
    if (!order) return
    setBusy("confirm")
    await service.markTransferred(order)
    setBusy(null)
    setStep("pending")
  }

  const onBack =
    view === "qr" || view === "expired"
      ? cancel
      : view === "amount"
        ? undefined
        : () => router.push("/lich-su-nap")

  return (
    <>
      <MobileHeader title="Nạp tiền" hideMenu={view !== "amount"} onBack={onBack} />
      <main className="flex flex-1 flex-col px-6 pb-2 lg:p-8">
        {view === "amount" && (
          <AmountStep initialAmount={amount} submitting={creating} error={createError} onSubmit={create} />
        )}
        {view === "qr" && order && (
          <QrStep
            order={order}
            remaining={countdown.remaining}
            onTransferred={confirmTransferred}
            onCancel={cancel}
            cancelling={busy === "cancel"}
            confirming={busy === "confirm"}
          />
        )}
        {view === "pending" && order && <PendingStatus order={order} />}
        {view === "expired" && order && (
          <ExpiredStatus order={order} renewing={creating} onRenew={() => create(order.amount)} onCancel={cancel} />
        )}
        {view === "success" && order && (
          <SuccessStatus
            order={order}
            paidAt={result?.paidAt}
            balanceAfter={result?.balanceAfter}
            onTopupAgain={reset}
          />
        )}
        {view === "failed" && order && <FailedStatus order={order} onRetry={reset} />}
      </main>
    </>
  )
}
