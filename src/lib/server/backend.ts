import "server-only"

import { API_URL } from "@/lib/server/session"
import type { ApiEnvelope, ApiErrorBody } from "@/types/auth"

export type BackendResult<T> =
  | { ok: true; status: number; body: ApiEnvelope<T> }
  | { ok: false; status: number; body: ApiErrorBody }

type BackendInit = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  token?: string
  headers?: HeadersInit
}

/** Server-side call to Mindo-API. Never throws; network failures map to 503. */
export async function backendFetch<T>(
  path: string,
  { method = "GET", body, token, headers }: BackendInit = {}
): Promise<BackendResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const json = await res.json().catch(() => ({}))
    return res.ok
      ? { ok: true, status: res.status, body: json as ApiEnvelope<T> }
      : { ok: false, status: res.status, body: json as ApiErrorBody }
  } catch {
    return {
      ok: false,
      status: 503,
      body: {
        code: "NETWORK_ERROR",
        message: "Không thể kết nối máy chủ. Vui lòng thử lại sau.",
      },
    }
  }
}
