"use client"

import { cn } from "cn"

import { SegmentedControl } from "@/components/ui/segmented-control"

export type PeerTab = "so-huu" | "cua-toi" | "dai-ly"

export const PEER_TABS: { value: PeerTab; label: string; mobileTitle: string }[] = [
  { value: "so-huu", label: "Sở hữu Peer", mobileTitle: "Sở hữu Peer" },
  { value: "cua-toi", label: "Peer của tôi", mobileTitle: "Peer của tôi" },
  { value: "dai-ly", label: "Đại lý", mobileTitle: "Đại lý" },
]

export const isPeerTab = (v: string | null): v is PeerTab =>
  PEER_TABS.some((t) => t.value === v)

/** Figma "Segmented": grey pill on mobile, white bordered bar on desktop. */
export function PeerTabs({
  value,
  onChange,
  className,
}: {
  value: PeerTab
  onChange: (tab: PeerTab) => void
  className?: string
}) {
  return (
    <SegmentedControl
      aria-label="Mục Peer"
      options={PEER_TABS}
      value={value}
      onValueChange={onChange}
      itemClassName="text-[13px] data-[active=false]:text-muted-foreground"
      className={cn(
        "h-11 rounded-control lg:h-12 lg:w-[444px] lg:rounded-action lg:border lg:border-border lg:bg-card",
        className
      )}
    />
  )
}
