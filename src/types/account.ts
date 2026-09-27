import type { ReferralCommission } from "@/types/peer"

/** Shapes returned by Mindo-API investor account endpoints (only the fields the UI reads). */

export type KycStatus = "approved" | "pending" | "rejected" | "none"

export type FileView = {
  id: string
  name: string
  mime_type: string
  url: string
  public_url?: string | null
}

export type AccountDetail = {
  uid: string
  email: string
  full_name: string
  phone_number: string
  address: string
  avatar_file_id: string | null
  avatar: FileView | null
  kyc: {
    status: KycStatus
    rejection_reason: string | null
    submitted_at: number | null
    reviewed_at: number | null
  }
  onboarding: { profile_completed: boolean; kyc_completed: boolean }
  created_at: number
}

export type UpdateProfileRequest = {
  full_name?: string
  phone_number?: string
  address?: string
  avatar_file_id?: string
}

export type Language = "vi" | "en"

export type AccountSettings = {
  language: Language
  email_notifications: boolean
  in_app_notifications: boolean
  suspicious_login_alerts: boolean
  login_rate_limit_enabled: boolean
  support_center_url: string | null
}

export type UpdateSettingsRequest = Partial<
  Pick<AccountSettings, "language" | "email_notifications">
>

export type AccountSession = {
  id: string
  device_name: string
  device_type: string
  ip_address: string | null
  location: string | null
  is_current: boolean
  last_used_at: number
  created_at: number
}

export type ReferralDashboard = {
  referral_code: string
  referred_by: { id: string; fullName: string; referralCode: string } | null
  is_branch_root: boolean
  system_code: { code: string; label: string | null } | null
  direct_referrals: number
  direct_commission_vnd: string
  downline_count: number
  downline_sales_vnd: string
  branch_commission_vnd: string
  total_commission_vnd: string
  settings: { direct_rate_percent: number; branch_rate_percent: number }
  recent_commissions: ReferralCommission[]
}

export type AgencyStatus = "PENDING" | "APPROVED" | "REJECTED" | "LOCKED"

/** `GET /investor/agency/me` returns the raw Prisma row (camelCase) or null. */
export type AgencyMe = {
  id: string
  code: string
  status: AgencyStatus
  title: string | null
  totalPackagesPurchased: number
  businessName: string
  taxCode: string | null
  phone: string
  address: string
  rejectionReason: string | null
  createdAt: string
  reviewedAt: string | null
  approvedAt: string | null
  parent: { code: string; user: { fullName: string } } | null
} | null

export type AgencyApplicationRequest = {
  business_name: string
  phone: string
  address: string
  tax_code?: string
  parent_code?: string
}

export type ChangePasswordRequest = {
  old_password: string
  new_password: string
  confirm_password: string
}
