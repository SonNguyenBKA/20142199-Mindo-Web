"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/auth-errors"
import { accountService } from "@/services/account.service"
import type {
  AccountSettings,
  AgencyApplicationRequest,
  UpdateProfileRequest,
  UpdateSettingsRequest,
} from "@/types/account"

export const accountKeys = {
  account: ["account"] as const,
  settings: ["account", "settings"] as const,
  sessions: ["account", "sessions"] as const,
  referrals: ["referrals", "dashboard"] as const,
  agency: ["agency", "me"] as const,
  nftCount: ["me", "nfts", "count"] as const,
}

export const useAccount = () =>
  useQuery({ queryKey: accountKeys.account, queryFn: accountService.account })

export const useAccountSettings = () =>
  useQuery({ queryKey: accountKeys.settings, queryFn: accountService.settings })

export const useSessions = (enabled = true) =>
  useQuery({ queryKey: accountKeys.sessions, queryFn: accountService.sessions, enabled })

export const useReferralDashboard = () =>
  useQuery({ queryKey: accountKeys.referrals, queryFn: accountService.referrals })

export const useAgency = () =>
  useQuery({ queryKey: accountKeys.agency, queryFn: accountService.agency })

export const useNftCount = () =>
  useQuery({ queryKey: accountKeys.nftCount, queryFn: accountService.nftCount })

/** PATCH profile; refreshes the server layout so the topbar avatar/name follow. */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => accountService.updateProfile(body),
    onSuccess: (account) => {
      queryClient.setQueryData(accountKeys.account, account)
      router.refresh()
    },
  })
}

/** Upload an image and set it as the avatar in one step. */
export function useUpdateAvatar() {
  const updateProfile = useUpdateProfile()
  return useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await accountService.uploadFile(file)
      return updateProfile.mutateAsync({ avatar_file_id: uploaded.id })
    },
    onSuccess: () => toast.success("Đã cập nhật ảnh đại diện"),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

/** Optimistic settings update (language, email notifications). */
export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateSettingsRequest) => accountService.updateSettings(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: accountKeys.settings })
      const previous = queryClient.getQueryData<AccountSettings>(accountKeys.settings)
      if (previous) queryClient.setQueryData(accountKeys.settings, { ...previous, ...body })
      return { previous }
    },
    onError: (error, _body, context) => {
      if (context?.previous) queryClient.setQueryData(accountKeys.settings, context.previous)
      toast.error(getErrorMessage(error))
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(accountKeys.settings, settings)
      toast.success("Đã lưu tuỳ chọn")
    },
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountService.revokeSession(id),
    onSuccess: () => {
      toast.success("Đã đăng xuất thiết bị")
      return queryClient.invalidateQueries({ queryKey: accountKeys.sessions })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

/** Submit the agency application; the returned row becomes the cached `agency/me`. */
export function useApplyAgency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AgencyApplicationRequest) => accountService.applyAgency(body),
    onSuccess: (agency) => queryClient.setQueryData(accountKeys.agency, agency),
  })
}
