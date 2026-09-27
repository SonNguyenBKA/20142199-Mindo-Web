// Shapes returned by Mindo-API `/investor/history/deposits*` (api/src/history/history.service.ts).

export type DepositStatus = "completed" | "pending" | "failed"

export type DepositSource = { value: string; label: string }

export type DepositHistoryItem = {
  id: string
  type: "deposit"
  title: string
  source: string
  amount_vnd: string
  status: DepositStatus
  status_label: string
  status_message: string | null
  /** ISO timestamp */
  occurred_at: string
}

export type DepositHistoryGroup = {
  /** "YYYY-MM" */
  key: string
  /** "THÁNG 1/2025" */
  label: string
  items: DepositHistoryItem[]
}

export type DepositSummary = {
  scope: "all_time"
  total_deposited_vnd: string
  completed_count: number
  total_count: number
  pending_count: number
}

export type DepositHistoryFilters = {
  /** YYYY-MM-DD */
  from?: string
  /** YYYY-MM-DD */
  to?: string
  status?: DepositStatus
  source?: string
}

export type DepositHistoryResponse = {
  summary: DepositSummary
  available_sources: DepositSource[]
  groups: DepositHistoryGroup[]
  applied_filters: {
    from: string | null
    to: string | null
    status: DepositStatus | null
    source: string | null
  }
}

export type PageExtra = {
  has_more: boolean
  last_page: number
  limit: number
  page: number
  total: number
}

export type DepositDetail = {
  id: string
  transaction_code: string
  type: "deposit"
  status: DepositStatus
  status_label: string
  status_message: string | null
  title: string
  amount_vnd: string
  occurred_at: string
  overview: {
    method: string
    method_label: string
    transaction_type: string
    paid_amount_vnd: string | null
    fee_vnd: string
  }
  source: {
    provider: string
    source_account_masked: string | null
    transfer_content: string
    sender_bank: string | null
    source_data_available: boolean
    bank_reference_number: string | null
  }
  wallet_credit: {
    receiving_account: string
    balance_before_vnd: string | null
    balance_after_vnd: string | null
  }
  note: string
  receipt: { available: boolean; url: string | null }
}

export type Account = {
  uid: string
  full_name: string
  avatar: { url: string; public_url?: string | null } | null
}
