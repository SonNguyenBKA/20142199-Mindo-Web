import { get, post } from "@/lib/axios"
import type {
  ForgotPasswordVerifyResponse,
  LoginRequest,
  LoginResponse,
  OtpDelivery,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
  VerifyAccountResponse,
  VerifyOtpRequest,
} from "@/types/auth"

export const authService = {
  login: (body: LoginRequest) => post<LoginResponse>("/auth/login", body),

  logout: () => post<{ logged_out: boolean }>("/auth/logout"),

  me: () => get<User>("/auth/me"),

  register: (body: RegisterRequest) =>
    post<RegisterResponse>("/auth/register", body),

  resendRegisterOtp: (email: string) =>
    post<OtpDelivery>("/auth/register/otp", { email }),

  verifyAccount: (body: VerifyOtpRequest) =>
    post<VerifyAccountResponse>("/auth/verify-account", body),

  forgotPassword: (email: string) =>
    post<OtpDelivery>("/auth/forgot-password", { email }),

  verifyForgotPasswordOtp: (body: VerifyOtpRequest) =>
    post<ForgotPasswordVerifyResponse>("/auth/forgot-password/verify-otp", body),

  resetPassword: (body: ResetPasswordRequest) =>
    post<ResetPasswordResponse>("/auth/reset-password", body),
}
