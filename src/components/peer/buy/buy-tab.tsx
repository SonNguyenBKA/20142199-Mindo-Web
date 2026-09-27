"use client"

import { ChevronLeftIcon, HexagonIcon, RotateCwIcon } from "lucide-react"
import * as React from "react"

import { useAccount } from "@/components/account/use-account"
import { AgencyHint } from "@/components/agency/agency-cta"
import { EmptyState } from "@/components/app/empty-state"
import { useSession } from "@/components/app/session-context"
import { BuyResult, type BuyOutcome } from "@/components/peer/buy/buy-result"
import { OrderSummaryCard, OrderSummaryInline } from "@/components/peer/buy/order-summary"
import { ProductGrid } from "@/components/peer/buy/product-grid"
import { QuantityPicker } from "@/components/peer/buy/quantity-picker"
import { PeerThumb } from "@/components/peer/peer-artwork"
import { PeerCard, PeerToolbar, ToolbarPill } from "@/components/peer/peer-shared"
import { useBuyPeer, usePeerProducts } from "@/components/peer/use-peer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/auth-errors"
import { formatVnd } from "@/lib/format"
import { MAX_PEER_PER_ORDER, remainingOf, totalVnd } from "@/lib/peer"
import type { NftProduct } from "@/types/peer"

/** "Sở hữu Peer": collections on sale → quantity + summary → result. */
export function BuyTab({
  tabs,
  productId,
  onProductChange,
  onViewPeers,
}: {
  tabs: React.ReactNode
  productId: string | null
  onProductChange: (id: string | null) => void
  onViewPeers: () => void
}) {
  const products = usePeerProducts()
  const [outcome, setOutcome] = React.useState<BuyOutcome | null>(null)
  const selected = productId ? products.data?.find((p) => p.id === productId) : undefined

  if (outcome) {
    return (
      <BuyResult
        outcome={outcome}
        onRetry={() => setOutcome(null)}
        onViewPeers={() => {
          setOutcome(null)
          onViewPeers()
        }}
      />
    )
  }

  return (
    <>
      <PeerToolbar tabs={tabs}>
        {selected && (
          <ToolbarPill>
            <span className="text-muted-foreground">Giá niêm yết</span>
            <b className="font-bold text-foreground lg:text-sm">{formatVnd(selected.unitPriceVnd)} / Peer</b>
          </ToolbarPill>
        )}
      </PeerToolbar>

      {products.isPending ? (
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-block" />
          ))}
        </div>
      ) : products.isError ? (
        <PeerCard className="flex flex-1 items-center justify-center">
          <EmptyState
            tone="danger"
            icon={<RotateCwIcon strokeWidth={1.8} />}
            title="Không tải được danh sách Peer"
            description="Vui lòng kiểm tra kết nối và thử lại."
            action={
              <Button size="action" onClick={() => products.refetch()}>
                Thử lại
              </Button>
            }
          />
        </PeerCard>
      ) : selected ? (
        <BuyForm product={selected} onBack={() => onProductChange(null)} onDone={setOutcome} />
      ) : products.data.length === 0 ? (
        <PeerCard className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<HexagonIcon strokeWidth={1.6} />}
            title="Chưa có Peer mở bán"
            description="Các đợt Peer mới sẽ xuất hiện tại đây."
          />
        </PeerCard>
      ) : (
        <PeerCard className="flex flex-col gap-4 border-0 bg-transparent lg:border lg:bg-card lg:p-6">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[15px] font-semibold text-foreground lg:text-lg">Peer đang mở bán</h2>
            <p className="text-xs text-muted-foreground lg:text-[13px]">Chọn một bộ sưu tập để sở hữu</p>
          </div>
          <ProductGrid products={products.data} onSelect={(p) => onProductChange(p.id)} />
        </PeerCard>
      )}
    </>
  )
}

const AGENCY_CODE_ERROR = /mã đại lý|tự nhận hoa hồng|agency_code/i

function BuyForm({
  product,
  onBack,
  onDone,
}: {
  product: NftProduct
  onBack: () => void
  onDone: (outcome: BuyOutcome) => void
}) {
  const { user } = useSession()
  const account = useAccount()
  const buy = useBuyPeer()
  const [quantity, setQuantity] = React.useState(1)
  const [agencyCode, setAgencyCode] = React.useState("")
  const [codeError, setCodeError] = React.useState<string | null>(null)

  const remaining = remainingOf(product)
  const max = Math.max(1, Math.min(MAX_PEER_PER_ORDER, remaining))
  const total = totalVnd(product, quantity)
  const kycDone = account.data?.onboarding?.kyc_completed ?? true

  const onBuy = () => {
    setCodeError(null)
    const code = agencyCode.trim().toUpperCase()
    buy.mutate(
      { productId: product.id, quantity, agencyCode: code || undefined },
      {
        onSuccess: (order) => onDone({ kind: "success", order, productName: product.name }),
        onError: (error) => {
          const message = getErrorMessage(error)
          // A bad referral code is fixable in place: keep the form, flag the field.
          if (code && AGENCY_CODE_ERROR.test(message)) return setCodeError(message)
          onDone({ kind: "failed", quantity, totalVnd: total, reason: message, at: new Date().toISOString() })
        },
      }
    )
  }

  const summary = {
    product,
    quantity,
    totalVnd: total,
    balanceVnd: user.balance_vnd,
    kycDone,
    buying: buy.isPending,
    onBuy,
  }

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <div className="flex flex-col gap-4 lg:gap-6 lg:rounded-block lg:border lg:border-border lg:bg-card lg:px-8 lg:pt-6 lg:pb-8">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 flex w-fit items-center gap-1 rounded-sm text-[13px] font-semibold text-link outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <ChevronLeftIcon className="size-4" strokeWidth={2} />
          Tất cả Peer
        </button>

        <div className="flex items-center gap-3.5">
          <PeerThumb className="size-14 shrink-0 lg:size-16" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="truncate text-base font-bold text-foreground lg:text-lg">{product.name}</h2>
            <p className="text-xs text-muted-foreground lg:text-[13px]">
              {product.symbol} · Còn lại {remaining.toLocaleString("vi-VN")} / {product.totalSupply.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
        {product.description && (
          <p className="text-[13px] leading-5 text-muted-foreground">{product.description}</p>
        )}

        <div className="h-px bg-border" />

        <QuantityPicker
          value={quantity}
          max={max}
          onChange={setQuantity}
          hint={
            remaining < MAX_PEER_PER_ORDER
              ? `Còn ${remaining.toLocaleString("vi-VN")} Peer có thể sở hữu`
              : `Tối đa ${MAX_PEER_PER_ORDER} Peer mỗi đơn`
          }
        />

        <AgencyHint />

        <div className="flex flex-col gap-2">
          <label htmlFor="agency_code" className="text-[13px] font-medium text-foreground">
            Mã giới thiệu (không bắt buộc)
          </label>
          <div
            className={`flex h-12 items-center gap-2.5 rounded-control border bg-input-bg px-3.5 focus-within:border-primary lg:w-[380px] lg:px-4 ${codeError ? "border-destructive" : "border-border"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static 20px icon */}
            <img src="/icons/account/gift.svg" alt="" width={20} height={20} className="size-5 shrink-0" />
            <input
              id="agency_code"
              value={agencyCode}
              onChange={(e) => {
                setAgencyCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 64))
                setCodeError(null)
              }}
              placeholder="Nhập mã của đại lý giới thiệu bạn"
              autoComplete="off"
              aria-invalid={!!codeError || undefined}
              aria-describedby={codeError ? "agency_code-error" : undefined}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground uppercase outline-none placeholder:text-placeholder placeholder:normal-case"
            />
          </div>
          {codeError && (
            <p id="agency_code-error" className="text-[13px] leading-5 text-destructive">
              {codeError}
            </p>
          )}
        </div>

        <OrderSummaryInline {...summary} />
      </div>
      <OrderSummaryCard {...summary} />
    </div>
  )
}
