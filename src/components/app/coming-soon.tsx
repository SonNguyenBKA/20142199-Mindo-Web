import { ConstructionIcon } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/app/empty-state"
import { MobileHeader } from "@/components/app/mobile-header"
import { HOME_PATH } from "@/components/app/nav-items"
import { buttonVariants } from "@/components/ui/button"

/** Placeholder for app sections that are not built yet. */
export function ComingSoon() {
  return (
    <>
      <MobileHeader />
      <main className="flex flex-1 items-center justify-center p-6 lg:p-8">
        <div className="w-full rounded-panel lg:border lg:border-border lg:bg-card">
          <EmptyState
            icon={<ConstructionIcon />}
            title="Sắp ra mắt"
            description="Tính năng này đang được phát triển. Vui lòng quay lại sau."
            action={
              <Link href={HOME_PATH} className={buttonVariants({ size: "md" })}>
                Xem lịch sử nạp
              </Link>
            }
          />
        </div>
      </main>
    </>
  )
}
