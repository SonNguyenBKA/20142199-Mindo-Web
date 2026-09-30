# Nối API mua bán Peer + nạp tiền VietQR — thiết kế

- **Ngày:** 30/09/2026
- **Phạm vi:** Mindo-Web + một PR nhỏ ở Mindo-API
- **Nguồn API:** Mindo-API `docs/web-peer-api.md` (commit `ba1af48`, đã chạy trên staging)
- **Figma** (file `oneBH6QD5NcZD7fxNeKEkn`):
  - Peer desktop `1077:6` — nhất là "Sở hữu Peer theo cấp" (`1859:1519`, `1859:1655`), "Không đủ số dư" (`1892:2658`), "Đại lý · Đại lý khu vực" (`1861:1768`), "Chọn kỳ" (`1880:1856`); mobile `1273:2890`
  - Lịch sử Peer desktop `1077:7` ("Lịch sử sở hữu & bán Peer")
- **Thay thế:** các quyết định "Sở hữu Peer" và "Peer của tôi" trong `2026-09-27-peer-design.md` (bản sửa cùng ngày). Tab Đại lý cũng đổi, xem mục 5.

## Vì sao

Web được dựng trước khi API mua Peer mới lên (`ba1af48`), nên:
- Bấm mua lỗi 400: web gửi `payment_type: "wallet"`, API chỉ nhận `BALANCE`.
- Giá sai: web tính `số lượng × product.unitPriceVnd`, còn API lấy 25 USD × tỷ giá rồi chiết khấu lũy kế 20/30/40%.
- Nạp tiền là dữ liệu giả hoàn toàn.
- Kho Peer, lịch sử mua, hoa hồng chỉ dùng một phần API hoặc chưa có.

## Các quyết định đã chốt

| Câu hỏi | Chốt | Lý do |
|---|---|---|
| Giá trên form lấy từ đâu | Web tính ngay, server chốt | Bấm +/− thấy số đổi tức thì; server vẫn là nguồn đúng cuối cùng qua snapshot |
| Tiền tệ chính | USD chính, VND phụ | Đúng Figma; ví và tiền bị trừ vẫn ghi VND |
| Chiết khấu lũy kế vs Figma "theo đơn này" | Theo API, sửa câu chữ + dòng chiết khấu theo đoạn | API là luật thật; % hiệu dụng lẻ khó hiểu nếu không chia đoạn |
| Chọn bộ sưu tập | 1 bộ → vào thẳng form; ≥ 2 bộ → lưới chọn | Đúng Figma khi chỉ có một đợt bán, không phải làm lại khi có thêm |
| Nút Huỷ nạp tiền | Thêm API huỷ | Lịch sử nạp không còn lệnh "Đang xử lý" treo |
| Trang lịch sử Peer | Chỉ phần Sở hữu | API chưa có bán; khi có thì bật phần Bán |
| Giá USD cho lịch sử và chi tiết Peer | API trả sẵn theo tỷ giá lúc mua | Web tự quy bằng tỷ giá hiện tại sẽ lệch với lúc mua |

## 1. Mindo-API — thay đổi cần có

Một PR, có test, deploy staging trước khi web dùng.

### 1.1 Huỷ lệnh nạp

- `DepositStatus` thêm `CANCELLED` (migration).
- `POST /api/v1/investor/deposits/:id/cancel` (Bearer):
  - Không phải lệnh của mình → 404.
  - Đang `PENDING` → `CANCELLED`, ghi `reviewedAt`, audit log `DEPOSIT_CANCELLED`, trả `depositView`.
  - Đã `CANCELLED` → trả nguyên trạng (gọi lại vô hại).
  - `CONFIRMED` / `REJECTED` → 409.
- Lịch sử nạp: `depositHistoryStatus(CANCELLED)` → `HistoryStatus.CANCELLED` ("Đã huỷ"). Bộ lọc trạng thái nhận thêm `cancelled`.
- **Tiền về lệnh đã huỷ vẫn được cộng.** Webhook `syncVietQrPayment` hiện từ chối mọi lệnh khác `PENDING`; đổi thành nhận cả `CANCELLED` (và cả lệnh `PENDING` đã quá `expiresAt` — như hiện tại). Lệnh chuyển thẳng sang `CONFIRMED`, `reviewNote` ghi rõ "Tiền về sau khi lệnh đã huỷ". Không làm vậy thì khách chuyển tiền xong rồi mới bấm huỷ sẽ mất tiền.
- Tìm lệnh theo nội dung chuyển khoản (`recent`) cũng phải xét cả `CANCELLED`.

### 1.2 Giá USD theo tỷ giá lúc mua

Tỷ giá của đơn: `order.usdVndRate`; đơn cũ trước migration không có → dùng tỷ giá hiện hành trong `AgencyPackageSetting`.

- `GET /investor/history/nfts`:
  - Mỗi dòng thêm `amount_usd`, `gross_amount_usd`, `discount_usd`.
  - `summary` thêm `total_spent_usd` (cộng từng đơn theo tỷ giá của đơn đó).
- `GET /investor/history/nfts/:id`: thêm `amount_usd`, `gross_amount_usd`, `discount_usd`.
- `GET /investor/me/nfts` (chế độ phân trang) và `GET /investor/me/nfts/:id`: `purchase` thêm `quantity`, `effective_unit_price_vnd` (= tổng đơn / số lượng, làm tròn), `effective_unit_price_usd`, `usd_vnd_rate`.
- USD làm tròn 2 chữ số, trả chuỗi như các trường `*_usd` sẵn có.

### 1.3 Tài liệu

Cập nhật `docs/web-peer-api.md`: endpoint huỷ, trạng thái `cancelled`, các trường USD mới.

## 2. Form mua (tab Sở hữu Peer)

### Dữ liệu

| Nguồn | Dùng cho |
|---|---|
| `GET /nfts` | Danh sách bộ sưu tập đang bán; quyết định có hiện lưới chọn hay không |
| `GET /investor/invest/config?project_id=` | Giá USD, tỷ giá, đơn giá VND, các mốc, danh hiệu hiện tại, tổng Peer đã mua, số dư, KYC, tối đa mỗi đơn |
| `POST /investor/invest/calculate-price` | Kiểm mã giới thiệu, `can_purchase`, `shortage_vnd`; là số "chính thức" để hiện khi đã về |
| `POST /investor/invest/snapshot-price` → `POST /investor/invest` | Mua |

### Tính giá trên web

- `src/lib/peer-pricing.ts` chép đúng `priceAgencyPackages` của API (chia đoạn theo mốc, làm tròn từng đoạn bằng `Math.round`), nhận các mốc và đơn giá từ `config` — không viết cứng con số nào.
- Dùng để hiện số ngay khi bấm +/−. `calculate-price` gọi sau 300 ms kể từ lần đổi cuối (số lượng hoặc mã); khi về, số của server đè lên. Lệch nhau (hiếm, chỉ khi admin đổi giá giữa chừng) thì lấy server và làm mới `config`.
- Nút mua chỉ bật khi quote server của đúng số lượng + mã hiện tại đã về và `can_purchase = true`.

### Bố cục (Figma "Sở hữu Peer theo cấp")

- **Chọn số lượng:** ô số + nút nhanh 10 / 50 / 200; tối đa `min(max_quantity_per_order, số còn lại)`.
- **Thẻ danh hiệu:** 3 thẻ từ `config.tiers`. Thẻ "Đang áp dụng" = danh hiệu đạt được sau đơn này. Dòng phụ: "Tính theo tổng số Peer bạn sở hữu · đang có N Peer". Giá mỗi thẻ ghi USD/Peer.
- **Gợi ý lên cấp:** "Sở hữu thêm X Peer để lên {cấp} · giảm Y%" với X tính từ tổng sau đơn; nút "Thêm X" cộng vào số lượng. Đã ở TIER_3 thì ẩn.
- **Mã giới thiệu:** một ô (mã người dùng hoặc mã đại lý — API nhận cả hai). Mã đúng → dòng "Người giới thiệu: {tên}". Mã sai → lỗi dưới ô; phần giá giữ số tính theo không mã.
- **Tóm tắt đơn:**
  - Số lượng, Giá niêm yết (USD), Cấp đại lý (huy hiệu).
  - Chiết khấu: một dòng mỗi đoạn — "Peer 41–49 · −20%", "Peer 50–60 · −30%" — hoặc một dòng nếu không vượt mốc.
  - **Thành tiền** USD cỡ lớn; dưới là "≈ {VND}" và "Tỷ giá tạm tính 1 USD = {rate}".
  - Số dư ví (VND).
  - Không đủ tiền (Figma `1892:2658`): số dư đỏ + "Thiếu {shortage_vnd}" + nút "Nạp thêm tiền". Chưa KYC: cảnh báo như hiện tại, lấy `kyc_verified` từ quote.

### Lỗi

- "Danh hiệu hoặc số lượng sở hữu đã thay đổi, vui lòng lấy báo giá mới" → không sang màn thất bại; làm mới `config` + quote, toast "Giá đã cập nhật, vui lòng kiểm tra lại".
- Lỗi mã giới thiệu (`/mã giới thiệu|người giới thiệu/i`) → lỗi dưới ô, ở lại form.
- Lỗi khác → màn thất bại như hiện tại, số tiền lấy từ quote.

### Kết quả thành công

Thêm "Tiết kiệm" (`discount_vnd` quy USD), "Cấp đại lý"; "Số dư sau" lấy `balance_after_vnd` của đơn (session chưa kịp làm mới).

## 3. Nạp tiền VietQR

- **Tạo lệnh:** `POST /investor/deposits { amount_vnd }` qua BFF, header `Idempotency-Key` sinh một lần cho mỗi lần bấm "Tiếp tục" (bấm lại lúc đang chờ dùng lại key). `forward.ts` chuyển tiếp đúng header này.
- **Ánh xạ:**

| Màn | API |
|---|---|
| Mã tham chiếu | `transferCode` |
| Ngân hàng / Số TK / Chủ TK | `vietqr.bank_name` / `bank_account` / `user_bank_name` |
| Nội dung CK / Số tiền | `vietqr.content` / `vietqr.amount` |
| QR | `vietqr.qr_code`: bắt đầu bằng `http` → ảnh; còn lại → chuỗi EMV, web tự vẽ |
| Đếm ngược | `expires_at`; thanh tiến trình theo tổng thời gian thật của lệnh |

- **Theo dõi:** `GET /investor/history/deposits/:id` mỗi 3 giây khi đang ở màn QR hoặc chờ. `completed` → thành công (`wallet_credit.balance_after_vnd`); `failed` → thất bại; `cancelled` → về bước nhập tiền.
- **"Tôi đã chuyển khoản":** không gọi API, chỉ sang màn chờ; server tự đối soát.
- **Huỷ:** `POST /investor/deposits/:id/cancel` rồi về bước nhập tiền. Lỗi 409 (tiền vừa về) → không huỷ, để lần hỏi trạng thái kế tiếp đưa sang màn thành công.
- **Hết hạn QR:** vẫn hỏi trạng thái thêm vì tiền về muộn vẫn được cộng; nút "Tạo mã mới" tạo lệnh mới (key mới).
- **Tối thiểu** 10.000đ, khớp API.
- Bản mock giữ cho `?demo=` khi chạy dev, tắt ở production.
- `src/types/deposit.ts`: `DepositStatus` thêm `"cancelled"`; lịch sử nạp hiện nhãn "Đã huỷ".

## 4. Kho Peer, chi tiết Peer, lịch sử Peer

### Kho Peer (tab Peer của tôi)

- `GET /investor/me/nfts?page&limit=8&q` — tìm kiếm và phân trang ở server; tổng số lấy `extra.total`; ô tìm kiếm chờ 300 ms.
- Đếm Peer ở trang tài khoản: `?limit=1` rồi đọc `extra.total` thay vì tải cả mảng.

### Chi tiết Peer

- `GET /investor/me/nfts/:id`. "Giá sở hữu" = `effective_unit_price_usd`, dòng phụ `≈ effective_unit_price_vnd`. Mã giao dịch từ `purchase.order_id`.

### Lịch sử Peer (`/lich-su-peer`, Figma `1077:7` — chỉ phần Sở hữu)

- **Thống kê:** 2 ô — "Tổng tiền đã chi" (`summary.total_spent_usd`, dưới là số Peer đã sở hữu) và "Peer đang nắm giữ" (`holding_nfts`). Bỏ ô "Tổng tiền đã thu" và "Lãi/lỗ tạm tính".
- **Bộ lọc:** Từ ngày / Đến ngày, Trạng thái, Bộ sưu tập (`GET /nfts`). Bỏ "Loại giao dịch".
- **Danh sách:** nhóm theo tháng từ `groups`; cột Thời gian · Peer · Giá trị (USD, `amount_usd`) · Trạng thái; phân trang theo `extra`.
- **Ngăn chi tiết:** `GET /investor/history/nfts/:id` — tổng quan, các đoạn chiết khấu, mã giới thiệu, tỷ giá lúc mua, danh sách mã Peer (bấm → trang chi tiết Peer).
- Cấu trúc code dựng theo `src/components/deposit/*`.

## 5. Tab Đại lý

- **Hoa hồng:** `GET /investor/referrals/commissions?from&to&type&page`.
  - Kỳ = tháng (giờ Việt Nam) → `from`/`to` đầu và cuối tháng; "Tất cả" = không gửi. Bộ chọn kỳ có 12 tháng gần nhất.
  - Lọc loại: Tất cả / Trực tiếp / Đầu nhánh.
  - Tổng kỳ lấy `summary.total_commission_vnd` (kèm `total_commission_usd`); phân trang thật; bỏ câu "20 giao dịch gần nhất".
  - Ngăn chi tiết: `GET /investor/referrals/commissions/:id`.
- **Đại lý khu vực** (Figma `1861:1768`): chỉ khi `referrals/dashboard.is_branch_root`. `GET /investor/referrals/branch-sales` theo cùng kỳ: số tuyến dưới, số đơn, tổng Peer, doanh số, thưởng đầu nhánh + bảng đơn tuyến dưới có phân trang. 403 → ẩn khối, không báo lỗi.
- `referrals/dashboard` vẫn dùng cho mã giới thiệu, `is_branch_root`, tỷ lệ %.

## 6. BFF

| Method | Thêm |
|---|---|
| GET | `invest/config`, `me/nfts/${ID}`, `history/nfts`, `referrals/commissions`, `referrals/commissions/${ID}`, `referrals/branch-sales` |
| POST | `invest/calculate-price`, `deposits`, `deposits/${ID}/cancel` |

Và `forward.ts` chuyển tiếp header `idempotency-key`.

## 7. Kiểm thử

- **API:** vitest cho endpoint huỷ (của người khác → 404, đã xác nhận → 409, gọi lại → trả nguyên), webhook cộng tiền cho lệnh đã huỷ, các trường USD với đơn có và không có `usdVndRate`.
- **Web:** chưa có test runner. Mỗi bước `npx tsc --noEmit` + `npm run lint`; cuối mỗi PR `npm run build` rồi thử trên staging, desktop và mobile.
  - `peer-pricing.ts` là chỗ dễ sai nhất: đối chiếu tay với `calculate-price` ở các ca 0→1, 40→60 (vượt mốc 50), 190→210 (vượt mốc 200), 0→250 (vượt cả hai).

## 8. Điều kiện để thử trên staging

1. Staging chưa có sản phẩm Peer (`GET /nfts` trả `[]`) — cần admin tạo (`POST /admin/nfts`).
2. Tài khoản thử đã KYC và có số dư (admin duyệt tay một lệnh nạp).
3. VietQR trên staging có cấu hình ngân hàng.
4. Một tài khoản đã nhận mã ref tổng để thử Đại lý khu vực.

## 9. Ngoài phạm vi

- Giao dịch bán Peer, "Tổng tiền đã thu", lãi/lỗ — chờ API.
- Kết quả "Đang chờ duyệt" trong Figma — API tạo đơn ở trạng thái hoàn tất ngay.
