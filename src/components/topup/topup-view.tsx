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
import { createMockTopupService, type TopupOrder } from "@/services/topup.service"

type Step = "amount" | "qr" | "pending" | "expired"

export function TopupView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user } = useSession()
  const demo = searchParams.get("demo")
  const service = React.useMemo(
    () => createMockTopupService({ demo, balance: Number(user.balance_vnd) || 0 }),
    [demo, user.balance_vnd]
  )

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
    try {
      const next = await service.create(value)
      setAmount(value)
      setOrder(next)
      start(Math.ceil((next.expiresAt - Date.now()) / 1000))
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
    refetchInterval: polling ? 3000 : false,
  })
  const result = status.data?.status === "pending" ? undefined : status.data

  // Settled → refresh balance (server layout) and the history list.
  React.useEffect(() => {
    if (!result) return
    void queryClient.invalidateQueries({ queryKey: ["deposit-history"] })
    router.refresh()
  }, [result, queryClient, router])

  // QR window elapsed without payment.
  const qrExpired = step === "qr" && !!order && countdown.done && !result
  const view: Step | "success" | "failed" = result
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
    await service.cancel(order).catch(() => null)
    setBusy(null)
    toast.info("Đã huỷ giao dịch nạp tiền.")
    reset()
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
