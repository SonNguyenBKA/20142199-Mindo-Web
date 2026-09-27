import { api, get, post } from "@/lib/axios"
import type {
  AccountDetail,
  AccountSession,
  AccountSettings,
  AgencyApplicationRequest,
  AgencyMe,
  ChangePasswordRequest,
  FileView,
  ReferralDashboard,
  UpdateProfileRequest,
  UpdateSettingsRequest,
} from "@/types/account"
import type { ApiEnvelope } from "@/types/auth"

const patch = async <T>(url: string, body: unknown) =>
  (await api.patch<ApiEnvelope<T>>(url, body)).data.data

const del = async <T>(url: string) => (await api.delete<ApiEnvelope<T>>(url)).data.data

export const accountService = {
  account: () => get<AccountDetail>("/bff/account"),

  updateProfile: (body: UpdateProfileRequest) =>
    patch<AccountDetail>("/bff/account/profile", body),

  uploadFile: async (file: File) => {
    const form = new FormData()
    form.append("file", file)
    // The instance defaults to JSON, which would make axios serialise FormData;
    // multipart lets the browser set the boundary.
    const res = await api.post<ApiEnvelope<FileView>>("/bff/files/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60_000,
    })
    return res.data.data
  },

  settings: () => get<AccountSettings>("/bff/account/settings"),

  updateSettings: (body: UpdateSettingsRequest) =>
    patch<AccountSettings>("/bff/account/settings", body),

  sessions: () => get<AccountSession[]>("/bff/account/sessions"),

  revokeSession: (id: string) =>
    del<{ logged_out: boolean }>(`/bff/account/sessions/${encodeURIComponent(id)}`),

  revokeAllSessions: () => del<{ logged_out: boolean }>("/bff/account/sessions"),

  changePassword: (body: ChangePasswordRequest) =>
    post<{ changed: boolean }>("/bff/auth/update-password", body),

  referrals: () => get<ReferralDashboard>("/bff/referrals/dashboard"),

  agency: () => get<AgencyMe>("/bff/agency/me"),

  applyAgency: (body: AgencyApplicationRequest) =>
    post<NonNullable<AgencyMe>>("/bff/agency/applications", body),

  nftCount: async () => (await get<unknown[]>("/bff/me/nfts")).length,
}
