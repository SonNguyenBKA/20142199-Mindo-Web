"use client"

import { cn } from "cn"
import Image from "next/image"
import * as React from "react"

/** Peer artwork: Mindo logo on the navy tile (Figma "Artwork / Logo Mindo", 150 → 100, radius 36 / 28). */
export function PeerThumb({ className }: { className?: string }) {
  return (
    <div className={cn("flex aspect-square items-center justify-center rounded-[24%] bg-primary", className)}>
      <Image src="/logo.jpg" alt="" width={200} height={200} className="size-2/3 rounded-[28%] object-contain" />
    </div>
  )
}

/** Grid card shared by "Sở hữu Peer" and "Peer của tôi" (Figma "Thẻ / Peer #0017"). */
export function PeerTile({
  title,
  subtitle,
  label,
  value,
  badge,
  muted,
}: {
  title: string
  subtitle: string
  label: string
  value: React.ReactNode
  badge?: React.ReactNode
  muted?: boolean
}) {
  return (
    <div className="relative isolate flex h-full flex-col overflow-hidden rounded-block border border-border bg-linear-160 from-card from-35% to-info-soft p-[15px] transition-shadow group-hover:shadow-card">
      <TilePattern />
      {/* Hover: the Peer flips once around its vertical axis like a coin (no spin back on leave). */}
      <div className="perspective-[600px]">
        <PeerThumb
          className={cn(
            "mx-auto w-full max-w-[150px] motion-safe:group-hover:animate-peer-flip motion-safe:group-focus-visible:animate-peer-flip",
            muted && "opacity-50"
          )}
        />
      </div>
      {badge && <div className="absolute top-2.5 right-2.5">{badge}</div>}
      <p className="mt-5 truncate text-[13.5px] leading-[18px] font-semibold text-foreground">{title}</p>
      <p className="mt-[3px] truncate text-[11px] leading-[15px] text-muted-foreground">{subtitle}</p>
      <p className="mt-1 text-[11px] leading-[15px] text-placeholder">{label}</p>
      <p className="mt-1 text-[15px] leading-5 font-bold text-foreground">{value}</p>
    </div>
  )
}

/** Faint dot grid fading out from the top-right, plus two rings in the bottom-right corner. */
function TilePattern() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle,var(--referral-border)_1px,transparent_1.3px)] bg-size-[12px_12px] mask-[linear-gradient(210deg,black,transparent_55%)]" />
      <span className="absolute -right-12 -bottom-12 size-36 rounded-full border border-referral-border" />
      <span className="absolute -right-5 -bottom-5 size-20 rounded-full border border-referral-border" />
    </div>
  )
}

/** Large detail artwork. Mobile adds the glow + rings from Figma "Artwork". */
export function PeerHero({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[272px] items-center justify-center overflow-hidden rounded-panel border border-white/10 bg-linear-140 from-artwork-from to-artwork-to lg:h-[560px] lg:border-0 lg:bg-none lg:bg-brand-deep",
        className
      )}
    >
      {/* eslint-disable @next/next/no-img-element -- decorative static SVGs */}
      <img src="/icons/peer/hero-glow.svg" alt="" className="pointer-events-none absolute size-[260px] lg:hidden" />
      <img src="/icons/peer/hero-ring-1.svg" alt="" className="pointer-events-none absolute size-[216px] lg:hidden" />
      <img src="/icons/peer/hero-ring-2.svg" alt="" className="pointer-events-none absolute size-[292px] lg:hidden" />
      <img src="/icons/peer/hero-ring-3.svg" alt="" className="pointer-events-none absolute size-[376px] lg:hidden" />
      <img src="/icons/peer/hero-badge-ring.svg" alt="" className="pointer-events-none absolute size-[150px] lg:hidden" />
      {/* eslint-enable @next/next/no-img-element */}
      <div className="pointer-events-none absolute inset-0 bg-linear-140 from-white/14 via-transparent via-50% to-transparent lg:hidden" />
      <Image
        src="/logo.jpg"
        alt=""
        width={340}
        height={340}
        priority
        className="relative size-[132px] rounded-full shadow-[0_10px_26px_0_rgb(1_14_33/0.5)] lg:size-[340px] lg:rounded-[96px] lg:shadow-none"
      />
      <span className="absolute bottom-6 left-6 hidden rounded-full bg-primary/72 px-4 text-[12.5px] leading-8 font-semibold text-white lg:block">
        {label}
      </span>
    </div>
  )
}
