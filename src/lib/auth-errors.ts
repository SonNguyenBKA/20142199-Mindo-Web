import { isApiError } from "@/lib/api-error"

/** Error codes returned by Mindo-API (see api/src/auth/auth.service.ts). */
export const AuthErrorCode = {
  InvalidCredentials: "AUTH_INVALID_CREDENTIALS",
  EmailNotVerified: "AUTH_EMAIL_NOT_VERIFIED",
  AccountLocked: "AUTH_ACCOUNT_LOCKED",
  EmailTaken: "AUTH_EMAIL_TAKEN",
  RegisterConflict: "AUTH_REGISTER_CONFLICT",
  ConfirmMismatch: "AUTH_CONFIRM_MISMATCH",
  ReferralInvalid: "AUTH_REFERRAL_INVALID",
  OtpInvalid: "AUTH_OTP_INVALID",
  OtpCooldown: "AUTH_OTP_COOLDOWN",
  ResetTicketInvalid: "AUTH_RESET_TICKET_INVALID",
  CurrentPasswordWrong: "AUTH_CURRENT_PASSWORD_WRONG",
  PasswordUnchanged: "AUTH_PASSWORD_UNCHANGED",
  ValidationFailed: "VALIDATION_FAILED",
  NetworkError: "NETWORK_ERROR",
} as const

const MESSAGES: Record<string, string> = {
  [AuthErrorCode.InvalidCredentials]: "Email hoặc mật khẩu không đúng.",
  [AuthErrorCode.AccountLocked]:
    "Tài khoản tạm thời bị khoá do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.",
  [AuthErrorCode.EmailTaken]: "Email này đã được đăng ký.",
  [AuthErrorCode.ConfirmMismatch]: "Mật khẩu xác nhận không khớp.",
  [AuthErrorCode.ReferralInvalid]: "Mã giới thiệu không hợp lệ.",
  [AuthErrorCode.OtpInvalid]: "Mã không đúng. Vui lòng thử lại.",
  [AuthErrorCode.OtpCooldown]: "Bạn vừa yêu cầu mã. Vui lòng đợi trước khi gửi lại.",
  [AuthErrorCode.ResetTicketInvalid]:
    "Phiên đặt lại mật khẩu đã hết hạn. Vui lòng thực hiện lại.",
  [AuthErrorCode.CurrentPasswordWrong]: "Mật khẩu hiện tại không đúng.",
  [AuthErrorCode.PasswordUnchanged]: "Mật khẩu mới phải khác mật khẩu hiện tại.",
}

/** Which form field a given error code belongs to (if any). */
const FIELD_BY_CODE: Record<string, string> = {
  [AuthErrorCode.EmailTaken]: "email",
  [AuthErrorCode.RegisterConflict]: "email",
  [AuthErrorCode.ConfirmMismatch]: "confirm_password",
  [AuthErrorCode.ReferralInvalid]: "ref_by",
  [AuthErrorCode.CurrentPasswordWrong]: "old_password",
  [AuthErrorCode.PasswordUnchanged]: "new_password",
}

export function getErrorCode(error: unknown): string | undefined {
  return isApiError(error) ? error.code : undefined
}

/** User-facing Vietnamese message for any thrown error. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]
    if (error.status === 429)
      return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."
    // 500 carries Nest's generic English text; other 5xx (e.g. 503 "Chưa thể gửi email OTP") are user-facing.
    if (error.status === 500 || (error.status > 500 && !error.message))
      return "Hệ thống đang bận. Vui lòng thử lại sau."
    return error.message
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại."
}

/** Field the error should be attached to, or undefined for a form-level banner. */
export function getErrorField(error: unknown): string | undefined {
  const code = getErrorCode(error)
  return code ? FIELD_BY_CODE[code] : undefined
}
