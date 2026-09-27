# Peer (`/peer`) design

- **Date:** 2026-09-27
- **Figma desktop:** node 1077:6 (13 frames)
- **Figma mobile:** node 1273:2890 (11 frames)

## Backend mapping (Mindo-API)

| UI | Endpoint | Notes |
|---|---|---|
| Price, tiers, exchange rate | `GET /investor/agency/packages/config` | Returns `base_price_usd`, `usd_vnd_rate`, `unit_price_vnd`, and `tiers[{code, from_package, to_package, discount_percent}]`. |
| Agency state, owned packages | `GET /investor/agency/me` | Returns the raw row (camelCase) or `null`: `status`, `totalPackagesPurchased`, and `packages[]`. Each package carries `startingPackageNumber`, `endingPackageNumber`, `unitPriceUsd`, `pricingBreakdown`, `status`, `createdAt` and `id`. |
| Buy | `POST /investor/agency/packages` `{quantity}` | Only an APPROVED agency can call it; anyone else gets 403. On success it returns the purchase along with `pricing_breakdown` and `total_packages_purchased`. |
| Commissions | `GET /investor/referrals/dashboard` | Returns `total_commission_vnd`, `direct_referrals`, `settings.direct_rate_percent`, `is_branch_root`, `system_code`, `downline_count`, `downline_sales_vnd`, `branch_commission_vnd`, and `recent_commissions` (the 20 most recent). |

## Decisions

- **Pricing is cumulative, exactly as the BE computes it.**
  - Peers are numbered `total+1 … total+qty`, and each segment is priced at its own tier's rate.
  - The web recomputes the price with the same formula to show a preview. The server's result is the one that counts.
  - The subtitle under the tier cards reads "Tính theo tổng số Peer bạn đã sở hữu".
- **Accounts that are not approved agencies** see a notice card in place of the buy form. Each agency status gets its own copy.
- **Hidden:**
  - the referral code input, because the package API does not accept it
  - the "Đang chờ duyệt" result, which the BE never produces
  - blockchain and certificate details on the Peer detail page
- **Insufficient balance:** a warning, a "Nạp thêm tiền" button linking to `/nap-tien`, and the buy button disabled.
- **The Peer của tôi list** is built from `packages[]`, excluding CANCELLED ones.
  - Each package number becomes one Peer.
  - Its price is `unitPriceUsd × (1 − rate)` of the segment containing that number.
  - Search works by number, with 8 items per page, all on the client.
- **The Đại lý tab** shows amounts in VND, as the BE returns them.
  - The month filter runs on the client over the 20 most recent commissions, with a note saying so.
  - The detail drawer is built from the row data.
  - The downline sales block appears only for branch roots and shows all-time totals.
- **URL state:** `?tab=so-huu|cua-toi|dai-ly` and `?page` / `?q` on Peer của tôi. The detail page is `/peer/[number]`.

## Revision (same day): "Sở hữu Peer" is a list of Peers on sale

This revision replaces the agency-package decisions above for the Sở hữu Peer and Peer của tôi tabs. The Đại lý tab is unchanged.

**Sở hữu Peer**
- The tab lists the collections on sale from `GET /api/v1/nfts`. The BFF forwards it as public, to `/nfts`.
- Selecting a card opens the buy form (`?sp=<productId>`).
- **Quantity:** at most min(500, remaining supply).
- **Summary:** shown in VND.
- **Referral code:** optional and sent as `agency_code`.
- **Buying:** `POST /investor/invest/snapshot-price`, then `POST /investor/invest`.
- **Blocked states:**
  - KYC is required, so the buy button is disabled until `onboarding.kyc_completed` is true.
  - An insufficient balance shows the warning and the "Nạp thêm tiền" button.
- **Errors:** a bad agency code stays on the form as a field error. Any other error opens the failure result.
- **Removed:** the tier discount cards, the USD prices and every agency-package call.

**Peer của tôi**
- The list comes from `GET /investor/me/nfts`, one card per `NftAsset`. The number shown is the `assetCode` suffix, as in the BE's `shortAssetCode`.
- The detail page `/peer/[id]` uses the asset id. It takes the unit price and the TX code from `GET /investor/history/nfts/:orderId`.
