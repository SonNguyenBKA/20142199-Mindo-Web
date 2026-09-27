import { ClipboardCheckIcon, SendIcon, StoreIcon, TicketPercentIcon } from "lucide-react"

import { AgencyTierBadge } from "@/components/account/agency-tier-badge"
import { AGENCY_TIERS } from "@/lib/agency-tier"

/** "Quyền lợi đại lý": tier ladder + other perks. */
export function AgencyBenefitsCard() {
  return (
    <section className="flex flex-col gap-4 rounded-panel border border-referral-border bg-linear-140 from-referral-from to-referral-to to-70% p-5 lg:p-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[15px] font-bold text-foreground lg:text-base">Quyền lợi đại lý</h2>
        <p className="text-xs text-referral-muted">Chiết khấu tăng theo tổng số Peer bạn sở hữu</p>
      </div>
      <ul className="flex flex-col gap-2">
        {AGENCY_TIERS.map((tier, i) => {
          const next = AGENCY_TIERS[i + 1]
          return (
            <li key={tier.code} className="flex items-center gap-3 rounded-control bg-card px-3 py-2.5">
              <AgencyTierBadge tier={tier} size={28} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-semibold text-foreground">{tier.name}</span>
                <span className="text-[11.5px] text-muted-foreground">
                  {next ? `${tier.fromPackage} – ${next.fromPackage - 1} Peer` : `Từ ${tier.fromPackage} Peer`}
                </span>
              </div>
              <span className="text-lg font-bold text-foreground">−{tier.discountPercent}%</span>
            </li>
          )
        })}
      </ul>
      <ul className="flex flex-col gap-2.5 text-[12.5px] leading-[18px] text-foreground">
        <Perk icon={<TicketPercentIcon />}>Mã đại lý riêng để giới thiệu và nhận hoa hồng</Perk>
        <Perk icon={<StoreIcon />}>Cửa hàng đại lý của bạn trên Mindo</Perk>
      </ul>
    </section>
  )
}

function Perk({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 [&_svg]:mt-px [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-link">
      {icon}
      <span>{children}</span>
    </li>
  )
}

const STEPS = [
  { icon: <SendIcon />, title: "Gửi hồ sơ", text: "Điền thông tin đại lý và gửi cho Mindo." },
  { icon: <ClipboardCheckIcon />, title: "Chờ duyệt", text: "Bộ phận kiểm duyệt xem xét hồ sơ của bạn." },
  { icon: <StoreIcon />, title: "Bắt đầu", text: "Sở hữu Peer theo gói với mức chiết khấu đại lý." },
]

/** "Quy trình": the three steps of the application. */
export function AgencyStepsCard() {
  return (
    <section className="flex flex-col gap-4 rounded-block border border-border bg-card p-5 lg:p-6">
      <h2 className="text-[15px] font-semibold text-foreground lg:text-base">Quy trình đăng ký</h2>
      <ol className="flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-tile bg-info-soft text-link [&_svg]:size-[18px]">
              {step.icon}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold text-foreground">
                {i + 1}. {step.title}
              </span>
              <span className="text-xs leading-[18px] text-muted-foreground">{step.text}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
