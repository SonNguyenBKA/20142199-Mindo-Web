import {
  ArrowLeftRightIcon,
  Clock3Icon,
  CreditCardIcon,
  HexagonIcon,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  href: string
  /** Sidebar label */
  label: string
  /** Desktop topbar title */
  title: string
  /** Short mobile header title */
  mobileTitle: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/nap-tien", label: "Nạp tiền", title: "Nạp tiền", mobileTitle: "Nạp tiền", icon: CreditCardIcon },
  { href: "/lich-su-nap", label: "Lịch sử nạp", title: "Lịch sử nạp tiền", mobileTitle: "Lịch sử nạp", icon: Clock3Icon },
  { href: "/peer", label: "Peer", title: "Peer", mobileTitle: "Peer", icon: HexagonIcon },
  { href: "/lich-su-peer", label: "Lịch sử Mindo Peer", title: "Lịch sử Mindo Peer", mobileTitle: "Lịch sử Peer", icon: ArrowLeftRightIcon },
]

export { HOME_PATH } from "@/lib/routes"

/** Titles for app pages that are not in the sidebar nav. */
const PAGE_TITLES: Record<string, { title: string; mobileTitle: string }> = {
  "/tai-khoan": { title: "Tài khoản của tôi", mobileTitle: "Tài khoản của tôi" },
  "/dang-ky-dai-ly": { title: "Đăng ký đại lý", mobileTitle: "Đăng ký đại lý" },
}

export function findNavItem(pathname: string) {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
}

/** Desktop / mobile title for any app page. */
export function pageTitle(pathname: string) {
  const item = findNavItem(pathname) ?? PAGE_TITLES[pathname]
  return { title: item?.title ?? "Mindo", mobileTitle: item?.mobileTitle ?? "Mindo" }
}
