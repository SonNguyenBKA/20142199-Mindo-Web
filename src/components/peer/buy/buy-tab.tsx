"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ChevronLeftIcon, HexagonIcon, RotateCwIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { AgencyHint } from "@/components/agency/agency-cta"
import { EmptyState } from "@/components/app/empty-state"
import { BuyResult, type BuyOutcome } from "@/components/peer/buy/buy-result"
import { NextTierHint } from "@/components/peer/buy/next-tier-hint"
import { OrderSummaryCard, OrderSummaryInline } from "@/components/peer/buy/order-summary"
import { previewPricing, quotePricing } from "@/components/peer/buy/pricing"
import { ProductGrid } from "@/components/peer/buy/product-grid"
import { QuantityPicker } from "@/components/peer/buy/quantity-picker"
import { ReferralField } from "@/components/peer/buy/referral-field"
import { TierCards } from "@/components/peer/buy/tier-cards"
import { PeerThumb } from "@/components/peer/peer-artwork"
import { PeerCard, PeerToolbar, ToolbarPill } from "@/components/peer/peer-shared"
import { useBuyPeer, usePeerProducts, usePurchaseConfig, usePurchaseQuote } from "@/components/peer/use-peer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/auth-errors"
import { formatUsd, formatVnd } from "@/lib/format"
import { MAX_PEER_PER_ORDER, remainingOf } from "@/lib/peer"
import type { NftProduct, PurchaseConfig } from "@/types/peer"

/** "Sở hữu Peer": collections on sale → quantity + summary → result. One collection on sale skips the picker. */
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
  const onSale = products.data ?? []
  const single = onSale.length === 1 ? onSale[0] : undefined
  const selected = single ?? (productId ? onSale.find((p) => p.id === productId) : undefined)
  const config = usePurchaseConfig(selected?.id ?? "")

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
        {selected && config.data && (
          <ToolbarPill>
            <span className="text-muted-foreground">Giá niêm yết</span>
            <b className="font-bold text-foreground lg:text-sm">{formatUsd(config.data.base_price_usd)} / Peer</b>
            <span className="text-placeholder">≈ {formatVnd(config.data.unit_price_vnd)}</span>
          </ToolbarPill>
        )}
      </PeerToolbar>

      {products.isPending || (selected && config.isPending) ? (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
          <Skeleton className="h-[520px] rounded-block" />
          <Skeleton className="hidden h-[520px] rounded-block lg:block" />
        </div>
      ) : products.isError || (selected && config.isError) ? (
        <PeerCard className="flex flex-1 items-center justify-center">
          <EmptyState
            tone="danger"
            icon={<RotateCwIcon strokeWidth={1.8} />}
            title="Không tải được thông tin Peer"
            description="Vui lòng kiểm tra kết nối và thử lại."
            action={
              <Button size="action" onClick={() => (products.isError ? products.refetch() : config.refetch())}>
                Thử lại
              </Button>
            }
          />
        </PeerCard>
      ) : selected && config.data ? (
        <BuyForm
          key={selected.id}
          product={selected}
          config={config.data}
          onBack={single ? undefined : () => onProductChange(null)}
          onDone={setOutcome}
        />
      ) : onSale.length === 0 ? (
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
          <ProductGrid products={onSale} onSelect={(p) => onProductChange(p.id)} />
        </PeerCard>
      )}
    </>
  )
}

const REFERRAL_ERROR = /mã giới thiệu|người giới thiệu/i
const STALE_QUOTE = /báo giá mới/i

function BuyForm({
  product,
  config,
  onBack,
  onDone,
}: {
  product: NftProduct
  config: PurchaseConfig
  /** Missing when this is the only collection on sale. */
  onBack?: () => void
  onDone: (outcome: BuyOutcome) => void
}) {
  const queryClient = useQueryClient()
  const buy = useBuyPeer()
  const [quantity, setQuantity] = React.useState(1)
  const [code, setCode] = React.useState("")
  const [buyCodeError, setBuyCodeError] = React.useState<string | null>(null)

  const referralCode = code.trim().toUpperCase() || undefined
  const input = { productId: product.id, quantity, referralCode }
  const settled = useDebouncedValue(input)
  const quote = usePurchaseQuote(settled)
  // The quote on screen is for exactly what the buyer sees — not a placeholder, not an older input.
  const current =
    !!quote.data &&
    !quote.isPlaceholderData &&
    settled.quantity === quantity &&
    settled.referralCode === referralCode

  const quoteError = quote.isError && settled.referralCode === referralCode ? getErrorMessage(quote.error) : null
  const codeError = buyCodeError ?? (referralCode && quoteError && REFERRAL_ERROR.test(quoteError) ? quoteError : null)

  // Server numbers when they match; otherwise the instant preview from the same formula.
  const pricing = current ? quotePricing(quote.data!) : previewPricing(config, quantity)

  const remaining = remainingOf(product)
  const max = Math.max(1, Math.min(config.max_quantity_per_order || MAX_PEER_PER_ORDER, remaining))
  const canBuy = current && pricing.canPurchase === true && !codeError && !buy.isPending

  const onBuy = () => {
    setBuyCodeError(null)
    buy.mutate(input, {
      onSuccess: (order) => onDone({ kind: "success", order, productName: product.name }),
      onError: (error) => {
        const message = getErrorMessage(error)
        // The tier moved (another order landed first): re-price in place instead of failing.
        if (STALE_QUOTE.test(message)) {
          queryClient.invalidateQueries({ queryKey: ["invest"] })
          toast.info("Giá đã cập nhật, vui lòng kiểm tra lại.")
          return
        }
        // A bad referral code is fixable in place: keep the form, flag the field.
        if (referralCode && REFERRAL_ERROR.test(message)) return setBuyCodeError(message)
        onDone({
          kind: "failed",
          quantity,
          totalUsd: pricing.netUsd,
          totalVnd: pricing.netVnd,
          reason: message,
          at: new Date().toISOString(),
        })
      },
    })
  }

  const summary = { pricing, canBuy, buying: buy.isPending, onBuy }
  const baseUsd = Number(config.base_price_usd)

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <div className="flex flex-col gap-4 lg:gap-6 lg:rounded-block lg:border lg:border-border lg:bg-card lg:px-8 lg:pt-7 lg:pb-8">
        {onBack && (
          <>
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
                  {product.symbol} · Còn lại {remaining.toLocaleString("vi-VN")} /{" "}
                  {product.totalSupply.toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="h-px bg-border" />
          </>
        )}

        <QuantityPicker
          value={quantity}
          max={max}
          onChange={setQuantity}
          hint={
            remaining < (config.max_quantity_per_order || MAX_PEER_PER_ORDER)
              ? `Còn ${remaining.toLocaleString("vi-VN")} Peer có thể sở hữu`
              : `Tối đa ${config.max_quantity_per_order || MAX_PEER_PER_ORDER} Peer mỗi đơn`
          }
        />

        <div className="hidden h-px bg-border lg:block" />

        <div className="flex flex-col gap-2.5 lg:gap-3.5">
          <TierCards
            tiers={config.tiers}
            baseUsd={baseUsd}
            active={pricing.attained}
            ownedBefore={config.total_packages_purchased}
          />
          <NextTierHint
            tiers={config.tiers}
            baseUsd={baseUsd}
            totalAfter={pricing.totalAfter}
            maxExtra={max - quantity}
            onAdd={(extra) => setQuantity(quantity + extra)}
          />
        </div>

        <AgencyHint />

        <ReferralField
          value={code}
          onChange={(next) => {
            setCode(next)
            setBuyCodeError(null)
          }}
          error={codeError}
          referrerName={current ? (quote.data?.referrer_name ?? null) : null}
        />

        <OrderSummaryInline {...summary} />
      </div>
      <OrderSummaryCard {...summary} />
    </div>
  )
}
