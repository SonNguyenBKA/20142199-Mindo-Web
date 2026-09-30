import type { NftProduct } from "@/types/peer"

export const MAX_PEER_PER_ORDER = 500

/** "MINDO-CMX…-0013" → "#0013" (same rule as Mindo-API `shortAssetCode`). */
export const shortAssetCode = (assetCode: string) => {
  const suffix = assetCode.match(/-(\d+)$/)?.[1]
  return suffix ? `#${suffix}` : assetCode
}

export const remainingOf = (p: NftProduct) => Math.max(0, p.totalSupply - p.soldCount)

export const txCode = (id: string) => `TX#${id.slice(-8).toUpperCase()}`
