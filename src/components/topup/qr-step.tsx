"use client"

import { QRCodeSVG } from "qrcode.react"
import * as React from "react"

import { CopyButton } from "@/components/topup/copy-button"
import { Panel } from "@/components/topup/topup-shared"
import { Button } from "@/components/ui/button"
import { formatMMSS } from "@/hooks/use-countdown"
import { formatVnd } from "@/lib/format"
import { QR_TTL_SECONDS, type TopupOrder } from "@/services/topup.service"

type QrStepProps = {
  order: TopupOrder
  remaining: number
  onTransferred: () => void
  onCancel: () => void
  cancelling?: boolean
  confirming?: boolean
}

export function QrStep({ order, remaining, onTransferred, onCancel, cancelling, confirming }: QrStepProps) {
  const progress = Math.max(0, Math.min(1, remaining / QR_TTL_SECONDS))
  const rows = [
    { label: "Ngân hàng", value: order.bankName },
    { label: "Số tài khoản", value: order.accountNumber, copy: order.accountNumber.replace(/\s/g, "") },
    { label: "Chủ tài khoản", value: order.accountName, copy: order.accountName },
    { label: "Nội dung chuyển khoản", value: order.transferContent, copy: order.transferContent },
    { label: "Số tiền", value: formatVnd(order.amount), copy: String(order.amount) },
  ]

  const qr = order.qrIsImage ? (
    // eslint-disable-next-line @next/next/no-img-element -- remote VietQR image
    <img src={order.qrValue} alt="Mã QR chuyển khoản" className="size-full object-contain" />
  ) : (
    <QRCodeSVG
      value={order.qrValue}
      size={212}
      level="M"
      fgColor="currentColor"
      bgColor="transparent"
      title="Mã QR chuyển khoản"
      className="size-full"
    />
  )

  const actions = (
    <>
      <Button size="xl" loading={confirming} onClick={onTransferred}>
        Tôi đã chuyển khoản
      </Button>
      <Button
        size="xl"
        variant="outline"
        loading={cancelling}
        onClick={onCancel}
        className="h-11 text-muted-foreground lg:h-14 lg:text-foreground"
      >
        Huỷ giao dịch
      </Button>
    </>
  )

  return (
    <div className="flex flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,700px)_384px] lg:items-start lg:gap-8">
      {/* Countdown — top on mobile, right column on desktop */}
      <Panel className="order-first rounded-2xl bg-muted px-3.5 pt-3 pb-3.5 lg:order-last lg:bg-card lg:px-7 lg:pt-7 lg:pb-8">
        <p className="text-[11.5px] leading-[15px] text-muted-foreground lg:text-[13.5px] lg:leading-5">
          Mã QR còn hiệu lực
        </p>
        <p
          aria-live="polite"
          className="mt-0.5 text-[28px] leading-[35px] font-bold text-foreground tabular-nums lg:text-[40px] lg:leading-[50px]"
        >
          {formatMMSS(remaining)}
        </p>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-border lg:mt-3.5 lg:h-1.5">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="hidden lg:block">
          <p className="mt-4 text-[12.5px] leading-[19px] text-muted-foreground">
            Hết thời gian thì mã sẽ hết hiệu lực và bạn cần tạo mã mới. Tiền đã chuyển vẫn được đối soát bình thường.
          </p>
          <div className="my-8 h-px bg-border" />
          <h3 className="text-sm leading-5 font-semibold text-foreground">Sau khi chuyển khoản</h3>
          <ul className="mt-3 flex flex-col gap-4">
            {[
              "Hệ thống tự đối soát, thường dưới 1 phút.",
              "Bạn không cần bấm gì thêm — màn hình sẽ tự chuyển.",
              `Nếu quá 10 phút chưa vào tiền, liên hệ hỗ trợ kèm mã ${order.code}.`,
            ].map((t) => (
              <li key={t} className="flex gap-3 text-[12.5px] leading-[19px] text-muted-foreground">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-success" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel className="lg:p-8">
        <div className="hidden lg:block">
          <h2 className="text-xl leading-7 font-bold text-foreground">Quét mã để chuyển khoản</h2>
          <p className="mt-1 text-[13.5px] leading-5 text-muted-foreground">
            Mở app ngân hàng của bạn và quét mã QR bên dưới.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:mt-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex h-[230px] items-center justify-center rounded-2xl border border-border bg-card text-primary lg:size-[260px] lg:shrink-0 lg:rounded-[18px]">
            <div className="size-[180px] lg:size-[212px]">{qr}</div>
          </div>

          <dl className="rounded-2xl bg-muted px-4 lg:flex-1 lg:rounded-none lg:bg-transparent lg:px-0">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 border-b border-border py-1.5 last:border-b-0 lg:py-1 lg:first:pt-0"
              >
                <div className="min-w-0 flex-1">
                  <dt className="text-[11px] leading-[14px] text-muted-foreground lg:text-[13px] lg:leading-5">
                    {row.label}
                  </dt>
                  <dd className="truncate text-[13px] leading-[17px] font-semibold text-foreground lg:text-sm lg:leading-5">
                    {row.value}
                  </dd>
                </div>
                {row.copy && <CopyButton value={row.copy} label={row.label} />}
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-3 flex flex-col gap-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:mt-8 lg:gap-3 lg:pb-0">
          {actions}
        </div>
      </Panel>
    </div>
  )
}
