import axios, { AxiosError } from "axios"

import { ApiError } from "@/lib/api-error"
import type { ApiEnvelope, ApiErrorBody } from "@/types/auth"

/**
 * Browser-side client. Always talks to the Next.js BFF (`/api/*`), which
 * forwards to Mindo-API and keeps tokens in httpOnly cookies.
 */
export const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response) {
      // Session is gone on an authenticated call → back to login.
      if (
        error.response.status === 401 &&
        error.config?.url?.startsWith("/bff/") &&
        typeof window !== "undefined"
      ) {
        const next = window.location.pathname + window.location.search
        // Full reload on purpose: drops all cached client state of the old session.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`/login?next=${encodeURIComponent(next)}`)
      }
      return Promise.reject(
        new ApiError(error.response.status, error.response.data ?? {})
      )
    }
    return Promise.reject(
      new ApiError(0, {
        code: "NETWORK_ERROR",
        message: "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.",
      })
    )
  }
)

/** POST and return the envelope's `data`. */
export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<ApiEnvelope<T>>(url, body)
  return res.data.data
}

/** GET and return the envelope's `data`. */
export async function get<T>(url: string): Promise<T> {
  const res = await api.get<ApiEnvelope<T>>(url)
  return res.data.data
}
