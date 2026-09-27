# Auth UI (Đăng nhập / Đăng ký) — Design

- **Date:** 2026-09-27
- **Figma:** https://www.figma.com/design/oneBH6QD5NcZD7fxNeKEkn/Mindo?node-id=1077-3 (section "Desktop · Đăng nhập · Đăng ký", 16 frames)
- **Backend:** `/Users/Work_home/Project_Hungs/Mindo/Mindo-API` (NestJS 11). Swagger: `http://localhost:4000/docs`. Contract doc: `Mindo-API/docs/app-auth-api.md`.

## Goals

- Implement every auth screen in the Figma section as Next.js pages wired to the real Mindo-API. The QR login flow is the exception and uses a mocked service.
- Put all colours and typography in one shared token layer, and build every screen from shared components, so that restyling later happens in one place.

## Decisions

| Topic | Decision |
|---|---|
| QR login | Build the full UI with all 5 states against a mock `qrAuthService`. The BE has no QR endpoint yet. |
| Token storage | httpOnly cookies set by Next.js route handlers (BFF). The browser never sees the tokens. |
| After login | Redirect to a placeholder `/dashboard` that requires login and has a logout button. |
| Forms | react-hook-form + zod. The rules mirror the BE validators. |
| Out of scope | Changing the password while logged in, dark mode, a real QR endpoint. |

## 1. Design tokens

The Figma file has no Variables, so the values below were extracted from the frames. They are defined in `src/app/globals.css` by overriding the shadcn CSS variables and exposed through `@theme inline`, so Tailwind utilities like `bg-primary` and `text-muted-foreground` work.

| Token | Value | Usage |
|---|---|---|
| `--primary`, `--foreground` | `#021C41` | Primary button, headings, active segment, links |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--background` | `#F5F7FA` | Page bg, segmented track |
| `--card` | `#FFFFFF` | Card |
| `--shadow-card` | `0 12px 32px rgba(2,28,65,.08)` | Card shadow |
| `--input-bg` | `#F9FAFB` | Input / OTP cell bg |
| `--border`, `--input` | `#E9EDF2` | Input, checkbox border |
| `--muted-foreground` | `#617084` | Descriptions, secondary text |
| `--placeholder` | `#7D899A` | Placeholder |
| `--destructive` | `#D93036` | Error text / icon |
| `--destructive-soft` | `#FCE9EB` | Error banner bg |
| `--disabled` | `#B9C2CF` | Disabled primary button bg |
| Radius | card 28px, button/input 16px, OTP cell 14px, segmented 14px (thumb 11px), checkbox 6px, alert 12px | |

**Typography:** Be Vietnam Pro, loaded with `next/font/google`, weights 400/500/600/700 and subsets `latin` + `vietnamese`.

| Style | Size / line-height / weight |
|---|---|
| Card title | 30/40 bold |
| Logo text | 23/32 bold |
| Description | 14.5/22 regular, muted |
| Label | 13/18 medium |
| Input text | 14/22 medium |
| Button | 15/22 semibold |
| Small text / links | 13.5/20 (regular muted; semibold primary for links) |
| OTP digit | 20/26 bold |

**Card layout:** 480px wide, padding 44px × 48px, 26px gap between sections. Fields have a 18px gap, and each label sits 8px above its input. Inputs and buttons are 56px high. On screens narrower than 520px the card takes the full width with 16px side margins, and its padding shrinks to 28px × 24px.

## 2. Shared components

`src/components/ui/`: these are shadcn primitives restyled to the tokens above.
- `button`: variants `default` (primary), `outline`, `ghost`, `link`; size `lg` = 56px. `loading` prop shows a spinner and disables the button. The disabled style uses `--disabled`.
- `input`: 56px high, `--input-bg`, radius 16, placeholder colour, and an error state (`aria-invalid` → destructive border).
- `password-input`: `input` with an eye / eye-off toggle.
- `checkbox`, `label`: from shadcn, restyled.
- `input-otp`: 6 cells with a 12px gap, 58px high, auto-advance, paste support, and an error state.
- `segmented-control`: 44px track with a sliding thumb. Generic options API.
- `alert`: destructive-soft banner with an icon and a message.

`src/components/auth/`:
- `auth-card`: layout shell with `Logo`, `title`, `description`, `children` (body), `actions`, `footer`.
- `logo`: the Figma logo asset (`public/logo.png`) plus the "Mindo" wordmark.
- `status-icon`: 84px (or 72px) ring with a success / error / pending / scanned glyph.
- `resend-timer`: mm:ss countdown. When it reaches 0 it shows a "Gửi lại mã" link.
- `form-field`: react-hook-form `Controller` wrapper with label, control and inline error message.

## 3. Routes and screens

All auth pages sit in the `src/app/(auth)/` route group, which shares a layout that centres the card on a `--background` page.

| Route | Figma frames | Behaviour |
|---|---|---|
| `/login` | Đăng nhập (1079:2), QR chờ quét (1444:1612), QR đã quét (1445:1613), QR hết hạn (1445:1878), QR bị từ chối (1445:2412), QR thành công (1445:2679) | Segmented control switches between the Mật khẩu and Mã QR tabs, synced to `?method=qr`. The password tab has email, password, "Ghi nhớ đăng nhập" and a "Quên mật khẩu?" link. The QR tab is driven by `qrAuthService` (see §5). |
| `/register` | Đăng ký (1079:33) | Fields: full name, email, password, confirm password, optional referral code (sent as `ref_by`), and the terms checkbox (`accept_terms`). On success it goes to `/verify-email?email=…&flow=register`. |
| `/verify-email` | Xác thực email (1079:75), OTP chưa nhập (1079:122), OTP đã nhập (1079:158), OTP sai (1080:2), có thể gửi lại (1080:38), Đăng ký thành công (1079:106) | The submit button is disabled until all 6 digits are entered. Submitting with fewer than 6 digits shows the "Vui lòng nhập đủ mã xác thực 6 số." banner. `AUTH_OTP_INVALID` shows "Mã không đúng. Vui lòng thử lại." The resend countdown starts from `resend_available_in` (60s). On success the success card is shown, with a button to `/login`. "Quay lại đăng ký" goes to `/register`. |
| `/forgot-password` | Nhập email (1080:69), Xác thực OTP (1080:87), Mật khẩu mới (1080:118), Đổi thành công (1080:146) | A 4-step state machine inside one page. The `reset_token` stays in component state only. |
| `/dashboard` | — | Protected placeholder showing `user.full_name` and a logout button. |

## 4. API integration (BFF with httpOnly cookies)

**BE base:** `API_URL=http://localhost:4000/api/v1` is a server-only env var. The browser only calls same-origin `/api/auth/*`, so the BE needs no CORS change.

**Route handlers in `src/app/api/auth/`:**

| Next route | BE call | Cookie effect |
|---|---|---|
| `POST login` | `POST /investor/auth/login/email` | Sets `mindo_at` (maxAge 15m) and `mindo_rt` (maxAge 30d if `remember_me`, otherwise a session cookie). Returns `{ user }` only. |
| `POST logout` | `POST /investor/auth/logout` with Bearer | Clears both cookies, even if the BE call fails. |
| `POST refresh` | `POST /investor/auth/refresh-token` | Rotates both cookies. On 401 it clears them. |
| `GET me` | `GET /investor/me` with Bearer | Refreshes once and retries if the call returns 401. |
| `POST register`, `register/otp`, `verify-account`, `forgot-password`, `forgot-password/verify-otp`, `reset-password` | Same path under `/investor/auth/` | Pass-through with no cookies. |

Cookies are `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`.

**`src/proxy.ts`** (the Next 16 proxy, formerly middleware):
- A request to `/dashboard/**` with no `mindo_at` but a valid `mindo_rt` refreshes the tokens and continues. With no refresh token either, it redirects to `/login?next=…`.
- A request to an auth page with a valid session redirects to `/dashboard`.

**Client layer:**
- `src/lib/axios.ts`: an `api` instance with `baseURL: "/api"`. It unwraps the BE envelope `{ code, data, message }` → `data` and normalises errors into an `ApiError { status, code, message, errors[] }`.
- `src/services/auth.service.ts` holds typed functions per endpoint. `src/types/auth.ts` holds `User` and the DTO types.
- `src/lib/auth-errors.ts` maps each `code` to either a field error or a form banner:
  - `AUTH_EMAIL_TAKEN` → email field
  - `AUTH_REFERRAL_INVALID` → referral field
  - `AUTH_CONFIRM_MISMATCH` → confirm password field
  - `AUTH_INVALID_CREDENTIALS` → form banner
  - `AUTH_ACCOUNT_LOCKED` → form banner
  - `AUTH_OTP_INVALID` → "Mã không đúng. Vui lòng thử lại."
  - `AUTH_OTP_COOLDOWN` → banner, and restart the timer
  - `AUTH_RESET_TICKET_INVALID` → banner with a restart link
  - `VALIDATION_FAILED` → use the BE's Vietnamese `message`
  - 429 or network error → generic message
- **Login with `AUTH_EMAIL_NOT_VERIFIED`:** call `register/otp`, then route to `/verify-email?email=…&flow=login`. After verification the success card sends the user to `/login`.

## 5. QR login (mock)

`src/services/qr-auth.service.ts` exposes:
- `createSession()` → `{ sessionId, qrValue, expiresAt }`
- `subscribe(sessionId, cb)`, which emits `pending | scanned | approved | rejected | expired` and returns an unsubscribe function.

The mock implementation expires sessions after 60s. In dev, a `?qrDemo=scanned|approved|rejected|expired` query param forces a state. The UI renders the QR with `qrcode.react` (200px) and a countdown to `expiresAt`. "Tạo mã mới" and "Thử lại" call `createSession()` again. On `approved` it shows the success state and redirects to `/dashboard`. The real BE implementation will need to set cookies through a new BFF route; this is left as a TODO in the service.

## 6. Dependencies to add

- `react-hook-form`, `zod`, `@hookform/resolvers`
- shadcn `input-otp`, `checkbox`
- `qrcode.react`
- Assets exported from Figma into `public/`: logo, and icons where lucide has no equivalent.

## 7. Env

- `.env.example`: `API_URL=http://localhost:4000/api/v1`
- This replaces `NEXT_PUBLIC_API_URL` for BE calls, since BE calls are now server-only.

## 8. Verification

- `npm run lint` and `npm run build` pass.
- Run the app against a local Mindo-API and walk through: register → OTP → success → login → dashboard → logout; forgot password across all 4 steps; the unverified-login redirect; error states (wrong password, wrong OTP, email taken).
- Compare the pages visually with the Figma screenshots at 1440×900, and check the layout at 375px mobile width.
