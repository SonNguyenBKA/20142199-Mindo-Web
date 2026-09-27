import type { Metadata } from "next"

import { AgencyApplyView } from "@/components/agency/agency-apply-view"

export const metadata: Metadata = { title: "Đăng ký đại lý · Mindo" }

export default function AgencyApplyPage() {
  return <AgencyApplyView />
}
