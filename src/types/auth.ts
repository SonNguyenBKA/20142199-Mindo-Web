/** Response envelope used by every Mindo-API success response. */
export type ApiEnvelope<T> = {
  code: number
  data: T
  message: string
  extra?: {
    has_more: boolean
    last_page: number
    limit: number
    page: number
    total: number
  }
}

/** Error body returned by Mindo-API (auth errors, validation errors, guard errors). */
export type ApiErrorBody = {
  message?: string | string[]
  code?: string
  errors?: string[]
  statusCode?: number
  error?: string
}

export type UserRole = "investor" | "admin" | "compliance" | "finance"

export type User = {
  id: string
  email: string
  full_name: string
  nickname: string
  referral_code: string
  referred_by_id: string
  phone: string
  phone_number: string
  role: UserRole
  status: string
  kyc_status: string
  kyc_verified_at: number
  created_at: number
  updated_at: number
  balance_vnd: string
  email_verified_at: number
  terms_accepted_at: number
}

export type OtpDelivery = {
  sent: boolean
  delivery: "email"
  expires_in: number
  resend_available_in: number
}

// ---- Requests ----

export type LoginRequest = {
  email: string
  password: string
  remember_me?: boolean
}

export type RegisterRequest = {
  full_name: string
  email: string
  password: string
  confirm_password: string
  accept_terms: boolean
  ref_by?: string
}

export type VerifyOtpRequest = {
  email: string
  otp: string
}

export type ResetPasswordRequest = {
  reset_token: string
  new_password: string
  confirm_password: string
}

// ---- Responses (the `data` field of the envelope) ----

export type LoginResponse = { user: User }

export type RegisterResponse = {
  user: User
  verification_required: boolean
  otp: OtpDelivery
}

export type VerifyAccountResponse = { verified: boolean; email: string }

export type ForgotPasswordVerifyResponse = {
  verified: boolean
  reset_token: string
  expires_in: number
}

export type ResetPasswordResponse = { reset: boolean }

/** Raw token payload returned by the BE (never sent to the browser). */
export type TokenPair = {
  user: User
  access_token: string
  refresh_token: string
  session_id: string
}
