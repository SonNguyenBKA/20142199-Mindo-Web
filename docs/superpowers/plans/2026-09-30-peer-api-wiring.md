# Nối API mua bán Peer + nạp tiền VietQR — kế hoạch

**Spec:** `docs/superpowers/specs/2026-09-30-peer-api-wiring-design.md` (đã duyệt 30/09/2026)

**Mục tiêu:** web mua Peer đúng giá server, nạp tiền thật qua VietQR, dùng đủ API kho Peer, lịch sử mua, hoa hồng, doanh số đầu nhánh; kèm một PR nhỏ ở Mindo-API (huỷ lệnh nạp + giá USD theo tỷ giá lúc mua).

**Kiến trúc:** trình duyệt → BFF `src/app/api/bff/[...path]` (danh sách cho phép theo method) → Mindo-API. Mỗi API mới = rule BFF + hàm trong `src/services/*` + kiểu trong `src/types/*` + hook react-query.

**Công nghệ:** Mindo-API: NestJS + Prisma + vitest. Mindo-Web: Next 16, React 19, react-query 5, Tailwind 4 (đọc `AGENTS.md` và `node_modules/next/dist/docs/` trước khi đụng API của Next).

**Kiểm tra:**
- API: TDD bằng vitest (`npm test` trong `Mindo-API/api`).
- Web: chưa có test runner → mỗi task `npx tsc --noEmit` + `npm run lint`; cuối mỗi PR `npm run build` rồi thử trên staging (argent Chromium, desktop 1440 + mobile 390).

**Quy ước:** mỗi PR tách nhánh từ nhánh chính mới nhất (API `main`, web `master`); kiểm nhánh ngay trước commit. Commit tiếng Anh, mô tả PR và comment code tiếng Việt, **không** gắn dòng ghi công Claude. Repo web **công khai** — soát diff tìm bí mật trước khi đẩy.

**Thứ tự:** PR A (API) → deploy staging → PR 1, 2, 4 (song song được) → PR 3 (cần kiểu từ PR 1 và trường USD từ PR A).

---

## PR A — Mindo-API: huỷ lệnh nạp + giá USD (`feat/deposit-cancel-and-usd-history`)

Thư mục: `Mindo-API/api`.

### Task A1 — Trạng thái `CANCELLED` cho lệnh nạp

**Sửa:** `prisma/schema.prisma`, `src/history/history.domain.ts`, `src/history/history.service.ts`, `src/history/history.domain.test.ts`
**Tạo:** `prisma/migrations/202609300001_deposit_cancelled/migration.sql`

1. Test trước (thêm vào `history.domain.test.ts`):

```ts
it('maps a cancelled deposit to the cancelled history status', () => {
  expect(depositHistoryStatus(DepositStatus.CANCELLED)).toBe(HistoryStatus.CANCELLED);
});
```

2. `npm test -- history.domain` → FAIL (enum chưa có `CANCELLED`).
3. Schema: `enum DepositStatus { PENDING CONFIRMED REJECTED CANCELLED }`. Migration:

```sql
ALTER TYPE "DepositStatus" ADD VALUE 'CANCELLED';
```

4. `npx prisma generate`. **Chú ý:** worktree dùng chung `node_modules` thì `prisma generate` ghi đè client của repo chính (memory `git-worktree-node-modules-symlink`) — làm trong repo chính hoặc cài `node_modules` riêng.
5. `depositHistoryStatus`: thêm `if (status === DepositStatus.CANCELLED) return HistoryStatus.CANCELLED;` trước dòng trả `FAILED`. `HistoryService.depositStatus` (lọc): `CANCELLED → DepositStatus.CANCELLED`, `FAILED → REJECTED`.
6. `npm test -- history.domain` → PASS.
7. Commit: `feat(deposit): add a cancelled status`

### Task A2 — `POST /investor/deposits/:id/cancel`

**Sửa:** `src/phase1/phase1.service.ts`, `src/phase1/phase1.controller.ts`
**Tạo:** `src/phase1/deposit-cancel.test.ts`

1. Test (mock prisma theo kiểu `web-peer.contract.test.ts`, `new Phase1Service(prisma as never, {} as never, …)`):
   - Lệnh của người khác → `NotFoundException`.
   - `PENDING` → gọi `deposit.update` với `status: CANCELLED`, ghi `auditLog` `DEPOSIT_CANCELLED`, trả `display_status: 'cancelled'`.
   - Đã `CANCELLED` → trả nguyên, không gọi `update`.
   - `CONFIRMED` → `ConflictException`.
2. Chạy → FAIL.
3. Service:

```ts
async cancelDeposit(userId: string, id: string) {
  const deposit = await this.prisma.deposit.findFirst({ where: { id, userId } });
  if (!deposit) throw new NotFoundException('Không tìm thấy lệnh nạp');
  if (deposit.status === DepositStatus.CANCELLED) return this.depositView(deposit);
  if (deposit.status !== DepositStatus.PENDING) throw new ConflictException('Lệnh nạp đã được xử lý, không thể huỷ');
  const updated = await this.prisma.deposit.update({
    where: { id },
    data: { status: DepositStatus.CANCELLED, reviewedAt: new Date(), reviewNote: 'Người dùng huỷ' },
  });
  await this.prisma.auditLog.create({ data: { actorId: userId, action: 'DEPOSIT_CANCELLED', entityType: 'Deposit', entityId: id } });
  return this.depositView(updated);
}
```

   Controller (cạnh `createDeposit`):

```ts
@ApiBearerAuth() @UseGuards(JwtAuthGuard) @Post('investor/deposits/:id/cancel')
cancelDeposit(@Req() req: AuthedRequest, @Param('id') id: string) {
  return this.service.cancelDeposit(authUser(req).id, id).then((data) => ok(data, 'Đã huỷ lệnh nạp'));
}
```

4. Chạy → PASS. Commit: `feat(deposit): let investors cancel a pending deposit`

### Task A3 — Tiền về lệnh đã huỷ vẫn được cộng

**Sửa:** `src/phase1/phase1.service.ts` (`syncVietQrPayment`), `src/phase1/deposit-cancel.test.ts`

1. Test: `$transaction: vi.fn((cb) => cb(tx))`; lệnh `CANCELLED` nhận webhook đủ tiền → `deposit.update` với `status: CONFIRMED`, `reviewNote` chứa "sau khi lệnh đã huỷ", `user.update` cộng số dư, có `ledgerEntry` `CREDIT`. Thêm ca tìm theo nội dung chuyển khoản (`recent`) trúng lệnh `CANCELLED`.
2. Chạy → FAIL (đang ném "Lệnh nạp không còn chờ thanh toán").
3. Sửa:
   - `recent`: `status: { in: [PENDING, CONFIRMED, CANCELLED] }`.
   - `const payable = deposit.status === DepositStatus.PENDING || deposit.status === DepositStatus.CANCELLED;` thay điều kiện `!== PENDING`.
   - `reviewNote: deposit.status === DepositStatus.CANCELLED ? 'Xác nhận tự động qua webhook VietQR (tiền về sau khi lệnh đã huỷ)' : 'Xác nhận tự động qua webhook VietQR'`.
4. Chạy → PASS. Chạy lại `vietqr.service.test.ts` để chắc không vỡ. Commit: `fix(deposit): credit money that arrives after a deposit was cancelled`

### Task A4 — Trường USD theo tỷ giá lúc mua

**Sửa:** `src/history/history.domain.ts`, `src/history/history.service.ts`, `src/phase1/phase1.service.ts` (`nftAssetView`, `myNftsPaged`, `myNftDetail`)
**Tạo:** `src/history/history.usd.test.ts`

1. Test:
   - `vndToUsd(new Prisma.Decimal('650000'), new Prisma.Decimal('26000'))` → `'25.00'`.
   - `nftHistory`: đơn có `usdVndRate = 26000` và đơn cũ `usdVndRate = null` (dùng tỷ giá hiện hành từ `agencyPackageSetting.findUnique`) → mỗi dòng có `amount_usd`, `gross_amount_usd`, `discount_usd`; `summary.total_spent_usd` = tổng từng đơn theo tỷ giá của đơn.
   - `nftDetail` có ba trường USD.
   - `myNftDetail`: `purchase` có `quantity`, `effective_unit_price_vnd` (tổng / số lượng, làm tròn), `effective_unit_price_usd`, `usd_vnd_rate`.
2. Chạy → FAIL.
3. Code:

```ts
// history.domain.ts
export const vndToUsd = (vnd: Prisma.Decimal, rate: Prisma.Decimal) => vnd.div(rate).toFixed(2);
```

   - `HistoryService` thêm `private currentUsdRate()` đọc `agencyPackageSetting.findUnique({ where: { id: 'default' } })`, mặc định `25000`.
   - `nftSummary`: thêm truy vấn `purchaseOrder.findMany({ where: { userId, status: COMPLETED }, select: { totalVnd: true, usdVndRate: true } })`, cộng `vndToUsd` từng đơn → `total_spent_usd`.
   - `nftAssetView`: kiểu `order` thêm `quantity`, `usdVndRate`; tính tỷ giá = `order.usdVndRate ?? rate hiện hành` (truyền vào view từ caller).
4. Chạy → PASS. Commit: `feat(history): report Peer purchases in USD at the rate they were bought`

### Task A5 — Tài liệu, kiểm toàn bộ, PR, deploy

1. `docs/web-peer-api.md`: endpoint huỷ, trạng thái `cancelled`, các trường USD mới.
2. `npm test` (toàn bộ) + `npx tsc --noEmit` + build.
3. PR vào `main`, chờ người dùng merge.
4. Deploy staging theo memory `mindo-deploy-server` (`/www/mindo`, cả hai file compose, build tách nền, kiểm trong image) — **hỏi người dùng trước khi deploy**. Kiểm migration đã chạy: `POST /investor/deposits/:id/cancel` không trả 404 route.

---

## PR 1 — Web: mua Peer đúng giá (`fix/peer-buy-server-pricing`)

### Task 1.1 — Kiểu, service, BFF

**Sửa:** `src/types/peer.ts`, `src/services/peer.service.ts`, `src/app/api/bff/[...path]/route.ts`

- BFF: GET `invest/config`; POST `invest/calculate-price`.
- Kiểu (tên trường đúng như API trả):

```ts
export type TierRule = { code: AgencyTierCode; title: string; from_package: number; to_package: number | null; discount_percent: number }

/** `GET /investor/invest/config` */
export type PurchaseConfig = {
  product: { id: string; name: string; available_supply: number }
  base_price_usd: string
  usd_vnd_rate: string
  unit_price_vnd: string
  max_quantity_per_order: number
  current_title: AgencyTierCode | null
  total_packages_purchased: number
  balance_vnd: string
  kyc_verified: boolean
  tiers: TierRule[]
}

export type PricingSegment = {
  tier: AgencyTierCode; title: string; from_package: number; to_package: number
  quantity: number; discount_rate: number; gross_amount_vnd: number; net_amount_vnd: number
}

/** `POST /investor/invest/calculate-price` */
export type PurchaseQuote = {
  amount: number; nft_id: string
  total_vnd: string; gross_total_vnd: string; discount_vnd: string; discount_percent: number
  gross_amount_usd: string; discount_amount_usd: string; net_amount_usd: string; usd_vnd_rate: string
  agency_title: AgencyTierCode; agency_title_label: string; current_title: AgencyTierCode | null
  total_packages_before: number; total_packages_after: number
  pricing_breakdown: PricingSegment[]
  balance_vnd: string; balance_after_vnd: string; shortage_vnd: string
  can_purchase: boolean; kyc_verified: boolean
  referral_code: string | null; referral_code_valid: boolean | null; referrer_name: string | null
}
export type PriceSnapshot = PurchaseQuote & { price_snapshot: string; expires_in: number }
```

- `PurchaseOrder`: thêm `transaction_code`, `gross_total_vnd`, `discount_vnd`, `effective_discount_percent`, `agency_title`, `referral_code`, `pricing_breakdown`, `balance_after_vnd`, `usd_vnd_rate`, `unit_price_usd`.
- Service: `config(productId?)`, `quote({productId, quantity, referralCode?})`, `buy({productId, quantity, referralCode?})` — `snapshot-price` với `payment_type: "BALANCE"` và `nft_id`, rồi `invest` với `price_snapshot` (+ `referral_code`). Bỏ `agency_code`.
- Kiểm: `tsc` (báo lỗi ở `buy-tab.tsx`, sửa ở 1.4), `lint`.

### Task 1.2 — Công thức giá trên web

**Tạo:** `src/lib/peer-pricing.ts`

Chép `priceAgencyPackages` của API (`api/src/phase2/phase2.domain.ts`); mốc lấy từ `config.tiers`:

```ts
export function pricePeers(totalBefore: number, quantity: number, unitPriceVnd: number, tiers: TierRule[]) {
  const start = totalBefore + 1
  const end = totalBefore + quantity
  const segments = tiers.flatMap((t) => {
    const from = Math.max(start, t.from_package)
    const to = Math.min(end, t.to_package ?? end)
    if (from > to) return []
    const qty = to - from + 1
    const grossVnd = unitPriceVnd * qty
    // Làm tròn từng đoạn như BE (Math.round trên VND).
    return [{ tier: t.code, from, to, quantity: qty, discountPercent: t.discount_percent, grossVnd, netVnd: Math.round(grossVnd * (1 - t.discount_percent / 100)) }]
  })
  const grossVnd = unitPriceVnd * quantity
  const netVnd = segments.reduce((s, x) => s + x.netVnd, 0)
  const attained = tiers.find((t) => end >= t.from_package && (t.to_package === null || end <= t.to_package)) ?? null
  return { start, end, segments, grossVnd, netVnd, discountVnd: grossVnd - netVnd, attained }
}

export const vndToUsd = (vnd: number, rate: number) => vnd / rate
/** Tier kế tiếp và số Peer còn thiếu để lên, tính từ tổng sau đơn. */
export function nextTier(totalAfter: number, tiers: TierRule[]) {
  const next = tiers.find((t) => t.from_package > totalAfter)
  return next ? { tier: next, missing: next.from_package - totalAfter } : null
}
```

- Xoá `totalVnd()` trong `src/lib/peer.ts`.
- Kiểm: `tsc`, `lint`. Đối chiếu tay ở Task 1.6.

### Task 1.3 — Hook

**Sửa:** `src/components/peer/use-peer.ts`
**Tạo:** `src/hooks/use-debounced-value.ts`

- `usePurchaseConfig(productId)` → key `["invest", "config", productId]`.
- `usePurchaseQuote({productId, quantity, referralCode})` → nhận giá trị đã debounce 300 ms; key gồm cả ba; `placeholderData: keepPreviousData`; `retry: false`.
- `useBuyPeer`: `onSettled` invalidate thêm `config` và `quote`.
- Kiểm: `tsc`, `lint`.

### Task 1.4 — Form mua theo Figma "Sở hữu Peer theo cấp"

**Sửa:** `src/components/peer/buy/buy-tab.tsx`, `order-summary.tsx`, `quantity-picker.tsx`
**Tạo:** `src/components/peer/buy/tier-cards.tsx`, `src/components/peer/buy/next-tier-hint.tsx`, `src/components/peer/buy/referral-field.tsx`
Tham chiếu Figma: `1859:1519`, `1859:1655`, `1892:2658` (desktop), khung tương ứng trong `1273:2890` (mobile) — lấy bằng `get_design_context` trước khi dựng.

- **Vào form:** `products.data.length === 1` → chọn luôn sản phẩm đó (không đẩy `?sp`); ≥ 2 → lưới như hiện tại.
- **Số lượng:** thêm nút nhanh 10 / 50 / 200 (ẩn nút vượt `max`).
- **Số hiển thị:** `pricePeers(config.total_packages_purchased, qty, Number(config.unit_price_vnd), config.tiers)` cho tức thì; khi quote của đúng `(qty, code)` về thì dùng số quote.
- **Thẻ danh hiệu:** 3 thẻ từ `config.tiers` + huy hiệu/màu từ `AGENCY_TIERS` theo `code`; "Đang áp dụng" = `attained`; giá mỗi thẻ `base_price_usd × (1 − %)` USD/Peer; dòng phụ "Tính theo tổng số Peer bạn sở hữu · đang có N Peer".
- **Gợi ý lên cấp:** `nextTier(totalAfter)` → "Sở hữu thêm X Peer để lên {tên} · giảm Y%, chỉ còn Z USD / Peer" + nút "Thêm X".
- **Mã giới thiệu:** `referral-field.tsx`; `referrer_name` → dòng xanh; lỗi mã → dòng đỏ dưới ô, giá giữ theo không mã.
- **Tóm tắt đơn:** Số lượng · Giá niêm yết (USD) · Cấp đại lý · một dòng chiết khấu mỗi đoạn ("Peer 41–49 · −20%") · **Thành tiền USD** lớn + "≈ VND" + "Tỷ giá tạm tính 1 USD = …" · Số dư ví (VND).
- **Chặn nút:** bật khi quote của đúng `(qty, code)` đã về và `can_purchase`; thiếu tiền → "Thiếu {shortage_vnd}" + "Nạp thêm tiền"; chưa KYC → cảnh báo (lấy `kyc_verified` từ quote/config, bỏ đọc `account.onboarding`).
- Pill "Giá niêm yết" trên toolbar: `{base_price_usd} USD / Peer · ≈ {unit_price_vnd}`.
- Kiểm: `tsc`, `lint`.

### Task 1.5 — Kết quả mua và lỗi báo giá cũ

**Sửa:** `src/components/peer/buy/buy-result.tsx`, `buy-tab.tsx`

- Thành công: thêm "Tiết kiệm" và "Cấp đại lý"; tiền hiện USD (theo `usd_vnd_rate` của đơn) + VND; "Số dư sau" = `order.balance_after_vnd`.
- Lỗi chứa "báo giá mới" → invalidate `config` + quote, `toast.info("Giá đã cập nhật, vui lòng kiểm tra lại")`, ở lại form.
- Lỗi mã (`/mã giới thiệu|người giới thiệu/i`) → lỗi dưới ô.
- Lỗi khác → màn thất bại, "Thành tiền" lấy từ quote.
- Kiểm: `tsc`, `lint`, `npm run build`.

### Task 1.6 — Thử trên staging, mở PR

- Đối chiếu `pricePeers` với `calculate-price` ở 4 ca: 0→1, 40→60, 190→210, 0→250 (đặt tài khoản thử về đúng tổng Peer bằng cách mua dần, hoặc so bằng test tay trong console với `total_packages_purchased` giả).
- Mua không mã; mã sai; mã của chính mình; mã đúng (hiện tên).
- Số dư thiếu; chưa KYC; 1 sản phẩm (vào thẳng form) và 2 sản phẩm (hiện lưới).
- Số tiền bị trừ khớp "≈ VND" trên web.
- Commit: `fix(peer): price orders on the server and pay with the Mindo balance`

---

## PR 2 — Web: nạp tiền VietQR thật (`feat/topup-vietqr`)

### Task 2.1 — BFF

**Sửa:** `src/app/api/bff/[...path]/route.ts`, `src/lib/server/forward.ts`

- POST `deposits`, `deposits/${ID}/cancel`.
- `forward.ts`:

```ts
const idempotencyKey = request.headers.get("idempotency-key")
// trong headers của fetch:
...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
```

- Kiểm: `tsc`, `lint`.

### Task 2.2 — Service thật

**Sửa:** `src/services/topup.service.ts`, `src/types/deposit.ts`

- `DepositStatus` thêm `"cancelled"`.
- `TopupOrder` thêm `ttlSeconds` (từ `expires_at − createdAt`).
- `createVietQrTopupService()`:
  - `create(amount, key)` → `api.post("/bff/deposits", { amount_vnd: amount }, { headers: { "Idempotency-Key": key } })`; ánh xạ như spec mục 3 (`qrIsImage = /^https?:\/\//.test(vietqr.qr_code)`).
  - `getStatus(order)` → `depositService.detail(order.id)`: `completed` → `{status: "completed", paidAt: occurred_at, balanceAfter: wallet_credit.balance_after_vnd}`; `failed` → `failed`; `cancelled` → `cancelled`; còn lại `pending`.
  - `markTransferred` → không gọi API.
  - `cancel(order)` → `POST /bff/deposits/:id/cancel`; 409 → trả `"already-settled"` để view không về bước nhập.
- Mock chỉ dùng khi `process.env.NODE_ENV !== "production" && demo`.
- Kiểm: `tsc`, `lint`.

### Task 2.3 — Màn nạp tiền

**Sửa:** `src/components/topup/topup-view.tsx`, `qr-step.tsx`, `amount-step.tsx`, `topup-status.tsx`, `src/components/deposit/deposit-status.tsx`

- Key idempotency: `useRef` giữ key cho lần bấm "Tiếp tục" hiện tại; tạo mới sau khi tạo lệnh thành công hoặc khi "Tạo mã mới".
- Đếm ngược theo `expiresAt`; `progress = remaining / order.ttlSeconds`.
- Hết hạn QR: vẫn poll (tiền về muộn vẫn được cộng).
- Huỷ: gọi `cancel`; `"already-settled"` → giữ màn, để lần poll kế đưa sang thành công.
- Tối thiểu 10.000đ ở bước nhập.
- Lịch sử nạp: nhãn/màu cho `cancelled` ("Đã huỷ"); bộ lọc trạng thái thêm "Đã huỷ".
- Kiểm: `tsc`, `lint`, `npm run build`.

### Task 2.4 — Thử, mở PR

- Tạo lệnh → QR đúng ngân hàng/số TK/nội dung/số tiền; quét bằng app ngân hàng xem khớp (không cần chuyển thật).
- Admin duyệt tay → web tự sang "Thành công", số dư trên thanh trên đổi.
- Bấm "Tiếp tục" hai lần nhanh → chỉ một lệnh trong `/lich-su-nap`.
- Huỷ → lịch sử hiện "Đã huỷ".
- Commit: `feat(topup): create real VietQR deposits, poll and cancel them`

---

## PR 3 — Web: kho Peer, chi tiết, lịch sử Peer (`feat/peer-inventory-history`)

Cần PR 1 (kiểu) và PR A đã lên staging (trường USD).

### Task 3.1 — Kho Peer phân trang

**Sửa:** BFF (GET `me/nfts/${ID}`), `src/types/peer.ts`, `src/services/peer.service.ts`, `src/components/peer/use-peer.ts`, `owned/owned-tab.tsx`, `owned/peer-grid-card.tsx`, `src/services/account.service.ts`

- Kiểu `OwnedPeer` theo `nftAssetView` (snake_case, có `purchase.effective_unit_price_usd/vnd`, `quantity`, `usd_vnd_rate`).
- `owned({ q, page })` → `api.get("/bff/me/nfts", { params: { q: q || undefined, page, limit: 8 } })` → `{ data, extra }`.
- Owned tab: bỏ lọc/cắt trang ở client; tổng lấy `extra.total`; tìm kiếm debounce 300 ms.
- `nftCount` → `?limit=1`, đọc `extra.total`.
- Kiểm: `tsc`, `lint`.

### Task 3.2 — Chi tiết Peer

**Sửa:** `owned/peer-detail-view.tsx`, `use-peer.ts`, `peer.service.ts`

- `ownedDetail(id)` → `GET /bff/me/nfts/:id`; bỏ tải cả kho rồi `find` và bỏ gọi `history/nfts/:orderId`.
- "Giá sở hữu" = `effective_unit_price_usd` USD, dòng phụ `≈ effective_unit_price_vnd`.
- Kiểm: `tsc`, `lint`.

### Task 3.3 — Trang `/lich-su-peer`

**Sửa:** BFF (GET `history/nfts`), `src/app/(app)/lich-su-peer/page.tsx`
**Tạo:** `src/types/peer-history.ts`, `src/services/peer-history.service.ts`, `src/components/peer-history/{peer-history-view,peer-history-filters,peer-history-list,peer-history-summary,peer-history-detail-sheet,use-peer-history}.tsx|ts`
Tham chiếu Figma `1077:7` (`1089:684` sổ giao dịch, `1089:941` bộ lọc, `1090:777` chi tiết sở hữu) + mobile tương ứng — `get_design_context` trước khi dựng.

- Dựng theo `src/components/deposit/*`.
- Thống kê: 2 ô — "Tổng tiền đã chi" (`total_spent_usd` USD, dòng phụ "{total_nfts_owned} Peer đã sở hữu") và "Peer đang nắm giữ" (`holding_nfts`).
- Bộ lọc: Từ ngày, Đến ngày, Trạng thái, Bộ sưu tập (`GET /nfts`). Không có "Loại giao dịch".
- Danh sách nhóm theo tháng; Giá trị = `amount_usd` USD; phân trang `extra`.
- Ngăn chi tiết (`history/nfts/:id`): tổng quan, dòng chiết khấu theo đoạn, mã giới thiệu, tỷ giá lúc mua, mã Peer (link sang `/peer/[assetId]` qua `navigation.nft_asset_ids`).
- Kiểm: `tsc`, `lint`, `npm run build`.

### Task 3.4 — Thử, mở PR

- Tìm Peer theo mã; qua trang; chi tiết hiện giá thực trả khớp đơn.
- Lịch sử: lọc theo ngày/trạng thái/bộ sưu tập; tổng chi USD khớp tổng các đơn.
- Commit: `feat(peer): server-paged inventory and a purchase history page`

---

## PR 4 — Web: hoa hồng theo kỳ + Đại lý khu vực (`feat/peer-commissions`)

### Task 4.1 — Service và kiểu

**Sửa:** BFF (GET `referrals/commissions`, `referrals/commissions/${ID}`, `referrals/branch-sales`), `src/types/peer.ts`
**Tạo:** `src/services/referral.service.ts`

- `Commission` theo `commissionView`: `id`, `type: "direct" | "branch"`, `rate_percent`, `amount_vnd`, `amount_usd`, `usd_vnd_rate`, `status`, `buyer{id, full_name, email, referral_code}`, `order{id, transaction_code, …}`.
- `commissions({from, to, type, page})` → `{ data: {summary, items, applied_filters}, extra }`.
- `branchSales({from, to, page})` → `{ data: {system_code, period, metrics, orders}, extra }`.
- Kiểm: `tsc`, `lint`.

### Task 4.2 — Tab Đại lý theo kỳ

**Sửa:** `src/components/peer/agency/{agency-tab,commission-utils,period-select,commission-list,commission-detail-sheet,commission-summary}.tsx|ts`
Figma: `1861:1592` (tài khoản thường), `1880:1621` (chi tiết), `1880:1856` (chọn kỳ).

- `monthRange("2026-09")` → `{ from: "2026-09-01", to: "2026-09-30" }` (theo lịch, API tự hiểu giờ Việt Nam); "Tất cả" → không gửi.
- Bộ chọn kỳ: 12 tháng gần nhất (không suy từ dữ liệu).
- Lọc loại: Tất cả / Trực tiếp / Đầu nhánh.
- Tổng kỳ = `summary.total_commission_vnd`; phân trang thật; bỏ câu "20 giao dịch gần nhất".
- Ngăn chi tiết gọi `commissions/:id`.
- Kiểm: `tsc`, `lint`.

### Task 4.3 — Đại lý khu vực

**Sửa:** `commission-summary.tsx` (`DownlineCard`)
**Tạo:** `src/components/peer/agency/branch-sales.tsx`
Figma: `1861:1768`.

- Chỉ khi `dashboard.is_branch_root`; cùng kỳ đang chọn; `metrics` (tuyến dưới, số đơn, tổng Peer, doanh số, thưởng đầu nhánh) + bảng đơn tuyến dưới phân trang; 403 → ẩn khối.
- Kiểm: `tsc`, `lint`, `npm run build`.

### Task 4.4 — Thử, mở PR

- Tài khoản thường: không thấy khối Đại lý khu vực; đổi kỳ/loại; mở chi tiết.
- Tài khoản đầu nhánh: số liệu theo kỳ khớp `branch-sales`.
- Commit: `feat(peer): commissions by period and branch sales for branch roots`

---

## Sau cùng

- Cập nhật `docs/superpowers/specs/2026-09-27-peer-design.md`: trỏ sang spec 30/09 cho các phần đã thay.
- Xoá chú thích "UI-only MOCK" ở đầu `topup.service.ts`.

## Điều kiện để thử trên staging (chủ repo/PM)

1. Tạo ít nhất một sản phẩm Peer (`POST /admin/nfts`) — thêm cái thứ hai để thử lưới chọn.
2. Tài khoản thử đã KYC, có số dư (admin duyệt tay lệnh nạp).
3. VietQR trên staging có cấu hình ngân hàng.
4. Một tài khoản đã nhận mã ref tổng.
