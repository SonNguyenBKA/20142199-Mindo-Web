import type { ApiErrorBody } from "@/types/auth"

export class ApiError extends Error {
  status: number
  code?: string
  errors: string[]

  constructor(status: number, body: ApiErrorBody = {}) {
    const message = Array.isArray(body.message)
      ? body.message[0]
      : body.message
    super(message || "Đã có lỗi xảy ra. Vui lòng thử lại.")
    this.name = "ApiError"
    this.status = status
    this.code = body.code
    this.errors = body.errors ?? (Array.isArray(body.message) ? body.message : [])
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
