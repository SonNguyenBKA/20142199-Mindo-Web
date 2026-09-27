# Lịch sử nạp (Deposit history): design

- **Date:** 2026-09-27
- **Figma desktop:** node 1077:5, 7 frames: list, filters applied, detail drawer, empty, loading, error, pending tooltip.
- **Figma mobile:** node 1273:2889: list, filter sheet, detail page, empty, loading, error, tooltip.

## Backend (Mindo-API)

| Endpoint | Notes |
|---|---|
| `GET /investor/history/deposits?page&limit&from&to&status&source` | Returns `{ summary, available_sources, groups[{key,label,items}], applied_filters }` and `extra` pagination. |
| `GET /investor/history/deposits/:id` | Detail: overview, source, wallet_credit, note, receipt. |
| `GET /investor/history/deposits/:id/receipt` | Plain-text file. Only available for completed deposits. |
| `GET /investor/me` | Name and `balance_vnd` for the topbar. |
| `GET /investor/account` | `avatar.url` (optional). |

**Status values:** `completed` (Thành công), `pending` (Đang xử lý), `failed` (Thất bại).

**Known gaps in the BE (the UI stays generic and does not fake data):**
- The only source is VietQR, so the source dropdown comes from `available_sources`.
- The `source` filter is accepted but not applied.
- The sender bank and masked account are always null; the UI shows "—".
- Groups can repeat across pages, so the client merges them by `key`.

## Decisions

- **Pagination:** infinite scroll with an IntersectionObserver sentinel and `useInfiniteQuery` from @tanstack/react-query.
- **Filters:** stored in URL search params (`from`, `to`, `status`, `source`). The desktop panel and the mobile sheet edit a draft; "Áp dụng" writes it to the URL.
- **Detail:** opened with the `?id=` param. On desktop (lg and up) it is a 480px right drawer over a scrim. On mobile it is a full-screen sheet that looks like a page.
- **Routes:** `/lich-su-nap` is the home page after login (it replaces `/dashboard`). `/nap-tien`, `/peer` and `/lich-su-peer` show a "Sắp ra mắt" placeholder.
- **BFF:** `GET /api/bff/[...path]` forwards whitelisted investor endpoints with the Bearer token from the cookie. It refreshes the token when it expires or gets a 401, and passes non-JSON responses (the receipt) straight through.

## Layout

- **App shell, `(app)` route group:**
  - Desktop: 260px navy sidebar, plus a 76px topbar with the page title, a "Số dư ví" box and an avatar showing initials.
  - Mobile (below lg): a page header with back, title, page actions and a menu button. The menu button opens a drawer with the sidebar nav.
- **Tokens added:**
  - `--warning-soft` #FDEFD3
  - `--warning-foreground` #8A5A00
  - `--success-foreground` #4D7C0F
  - The sidebar tokens take their values from Figma.
- **Shared pieces:**
  - `StatusBadge`
  - `StatCard`
  - `EmptyState`, used for the empty and error states
  - `FilterChip`
  - Money and date formatters in `src/lib/format.ts`, using the VN timezone
