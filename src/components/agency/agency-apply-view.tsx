"use client"

import { ChevronLeftIcon, RotateCwIcon, ShieldAlertIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { useAccount, useAgency } from "@/components/account/use-account"
import { AgencyApplyForm } from "@/components/agency/agency-apply-form"
import { AgencyBenefitsCard, AgencyStepsCard } from "@/components/agency/agency-benefits"
import { AgencyStatusCard } from "@/components/agency/agency-status-card"
import { EmptyState } from "@/components/app/empty-state"
import { MobileHeader } from "@/components/app/mobile-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

/** "Quay lại" always lands on Peer › Đại lý. */
const AGENCY_BACK_PATH = "/peer?tab=dai-ly"

/** `/dang-ky-dai-ly`: application form, or the application's current status. */
export function AgencyApplyView() {
  const router = useRouter()
  const agency = useAgency()
  const account = useAccount()
  const kycDone = account.data?.onboarding?.kyc_completed ?? false
  const goBack = () => router.push(AGENCY_BACK_PATH)

  return (
    <>
      <MobileHeader onBack={goBack} />
      <main className="flex flex-1 flex-col gap-4 px-6 pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:content-start lg:items-start lg:gap-x-6 lg:gap-y-3 lg:px-8 lg:py-7">
        <button
          type="button"
          onClick={goBack}
          className="-ml-1 hidden w-fit items-center gap-1 rounded-sm text-[13px] font-semibold text-link outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/30 lg:col-span-2 lg:flex"
        >
          <ChevronLeftIcon className="size-4" strokeWidth={2} />
          Quay lại
        </button>
        <div className="flex flex-col gap-4">
          {agency.isPending || account.isPending ? (
            <Skeleton className="h-[420px] rounded-block" />
          ) : agency.isError ? (
            <EmptyState
              tone="danger"
              icon={<RotateCwIcon strokeWidth={1.8} />}
              title="Không tải được thông tin đại lý"
              action={
                <Button size="action" onClick={() => agency.refetch()}>
                  Thử lại
                </Button>
              }
            />
          ) : agency.data ? (
            <AgencyStatusCard agency={agency.data} />
          ) : (
            <section className="flex flex-col gap-5 rounded-block border border-border bg-card p-5 lg:p-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-foreground lg:text-xl">Thông tin đại lý</h2>
                <p className="text-[13px] leading-5 text-muted-foreground">
                  Hồ sơ được Mindo xét duyệt trước khi kích hoạt. Mỗi tài khoản chỉ gửi một hồ sơ.
                </p>
              </div>
              {!kycDone && (
                <div className="flex gap-2.5 rounded-control bg-warning-soft px-4 py-3 text-[13px] leading-5 text-warning-foreground">
                  <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
                  <span>Cần xác minh danh tính (KYC) trên ứng dụng Mindo trước khi đăng ký đại lý.</span>
                </div>
              )}
              <AgencyApplyForm account={account.data} disabled={!kycDone} />
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:gap-6">
          <AgencyBenefitsCard />
          <AgencyStepsCard />
        </aside>
      </main>
    </>
  )
}
