"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { MobileHeader } from "@/components/app/mobile-header"
import { AgencyTab } from "@/components/peer/agency/agency-tab"
import { BuyTab } from "@/components/peer/buy/buy-tab"
import { OwnedTab } from "@/components/peer/owned/owned-tab"
import { isPeerTab, PEER_TABS, PeerTabs, type PeerTab } from "@/components/peer/peer-tabs"

/** `/peer`: three tabs kept in the URL (`?tab=`, `?sp` = product being bought, `?q` / `?page` for "Peer của tôi"). */
export function PeerView() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const raw = params.get("tab")
  const tab: PeerTab = isPeerTab(raw) ? raw : "so-huu"

  const setParams = (next: Record<string, string | null>, push = false) => {
    const sp = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") sp.delete(k)
      else sp.set(k, v)
    }
    const url = sp.size ? `${pathname}?${sp}` : pathname
    if (push) router.push(url, { scroll: false })
    else router.replace(url, { scroll: false })
  }
  const goTab = (t: PeerTab) =>
    setParams({ tab: t === "so-huu" ? null : t, q: null, page: null, sp: null }, true)

  const tabs = <PeerTabs value={tab} onChange={goTab} />
  const title = PEER_TABS.find((t) => t.value === tab)?.mobileTitle

  return (
    <>
      <MobileHeader title={title} />
      <main className="flex flex-1 flex-col gap-4 px-6 pb-10 lg:gap-5 lg:px-8 lg:py-8">
        {tab === "so-huu" && (
          <BuyTab
            tabs={tabs}
            productId={params.get("sp")}
            onProductChange={(id) => setParams({ sp: id }, true)}
            onViewPeers={() => goTab("cua-toi")}
          />
        )}
        {tab === "cua-toi" && (
          <OwnedTab
            tabs={tabs}
            query={params.get("q") ?? ""}
            page={Math.max(1, Number(params.get("page")) || 1)}
            onQueryChange={(q) => setParams({ q, page: null })}
            onPageChange={(p) => setParams({ page: p > 1 ? String(p) : null })}
            onBuy={() => goTab("so-huu")}
          />
        )}
        {tab === "dai-ly" && <AgencyTab tabs={tabs} />}
      </main>
    </>
  )
}
