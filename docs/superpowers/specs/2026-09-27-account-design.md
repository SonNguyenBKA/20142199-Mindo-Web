# Tài khoản của tôi (My account): design

- **Date:** 2026-09-27
- **Figma desktop:** node 1887:2516
- **Figma mobile:** node 1889:2606
- Figma only shows the main screen. The dialogs are designed here, using the existing Dialog component.

## Backend (Mindo-API)

| Block | Endpoint | Notes |
|---|---|---|
| Name, email, phone, address, avatar, KYC, join date | `GET /investor/account` | `kyc.status`: `approved`, `pending`, `rejected`, `none` |
| Referral code, referred by, total commission | `GET /investor/referrals/dashboard` | `referral_code`, `referred_by{fullName,referralCode}`, `total_commission_vnd` |
| Agency tier | `GET /investor/agency/me` | Raw Prisma row or `null`. Uses `status` and `totalPackagesPurchased`. |
| Peer owned | `GET /investor/me/nfts` | Array; the UI shows its length |
| Wallet balance | session (`/investor/me`) | Already in `SessionProvider` |
| Language, email notifications, support URL | `GET/PATCH /investor/account/settings` | `language: vi\|en`, `email_notifications`, `support_center_url` |
| Devices | `GET /investor/account/sessions`, `DELETE …/sessions/:id`, `DELETE …/sessions` | Revoking all sessions also revokes the current one |
| Edit profile | `PATCH /investor/account/profile` | `full_name`, `phone_number`, `address`, `avatar_file_id` |
| Avatar upload | `POST /investor/files/upload` | Multipart field `file`, 10 MB, must be an image |
| Change password | `POST /investor/auth/update-password` | `old_password`, `new_password`, `confirm_password`. Error codes: `AUTH_CURRENT_PASSWORD_WRONG`, `AUTH_CONFIRM_MISMATCH`, `AUTH_PASSWORD_UNCHANGED` |

**Gaps in the BE (the web does not fake data):**
- Date of birth and CCCD number are not returned, so they are hidden.
- There is no "Tỉnh / thành phố" field. The UI shows "Địa chỉ" from `address` instead.
- There is no monthly commission and no USD amount. The UI shows "Tổng hoa hồng" in VND, with no "Chi tiết" link.
- There is no `password_changed_at`, so the password row shows a generic hint.
- There is no delete-account endpoint. The button opens a dialog that points to support (`support_center_url` when set).

## Agency tier mapping (web-side)

| BE tier | Packages | Web name |
|---|---|---|
| TIER_1 | 1–49 | Đại lý Hoàng Kim |
| TIER_2 | 50–199 | Đại lý Bạch Kim |
| TIER_3 | 200+ | Đại lý Kim Cương |

- The card is shown only when the agency is `APPROVED`.
- The progress line reads "Đơn từ {next.from} Peer để lên {next.name}". At the top tier it reads "Cấp cao nhất".

## Decisions

- **Route:** `/tai-khoan`, added to `APP_PATHS`.
  - Desktop: the topbar avatar links to this page.
  - Mobile: the drawer menu gets a "Tài khoản" item.
  - Titles for pages outside the nav come from a `PAGE_TITLES` map.
- **Data:** each block has its own React Query query, its own skeleton and its own error state.
- **Writes:**
  - **Edit profile** uses a dialog built with react-hook-form and zod. Changing the avatar uploads the file first, then sends a PATCH.
  - **Change password** uses a dialog. BE error codes are mapped to the matching field.
  - **Devices** open in a dialog.
    - The current session is marked "Thiết bị này" and has no revoke button.
    - "Đăng xuất tất cả" asks for confirmation, then calls `/api/auth/logout` and redirects to `/login`.
  - **Language and email notifications** save optimistically: the UI changes at once and rolls back if the request fails. The language setting is stored only; the UI is not translated yet.
  - After each change the related queries are invalidated and `router.refresh()` runs, so the layout's avatar and name update.
- **QR "Tìm hiểu"** opens a dialog with the scan steps.
- **BFF:**
  - `forwardWithSession(request, path, method)` forwards the method and the raw body with its content-type, which covers multipart.
  - `/api/bff/[...path]` exports GET, POST, PATCH and DELETE, each with its own whitelist.

## Layout

- **Desktop (lg and up):** content padding 32/28.
  - The left column is 360px: Profile card (navy), Referral card, Overview card.
  - The right column fills the remaining width: Personal info (2-column grid), Security and login, Preferences.
  - Gaps are 16px (cards) and 24px (columns).
- **Mobile:** one column in this order: Profile, Referral, Overview, Personal info, Security, Preferences, then a "Đăng xuất" button.
  - Personal info is a list of label/value rows. The referral source sits in a tinted pill.
  - Security rows are fully tappable and end with a chevron.
- **Shared pieces:**
  - Card blocks in `src/components/account/`.
  - Row pieces: `SettingRow` and `InfoField`.
  - `AgencyTierBadge`.
  - The Switch control, which lives in `ui/switch`.
  - New colours become tokens in `globals.css` (gold tier, profile-card navy gradient, referral tint).
