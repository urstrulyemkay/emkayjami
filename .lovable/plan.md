

## Plan: OEM Multi-Role Dashboards (SM / GM / EA)

### Context
The existing OEM prototype covers the **Sales Executive (SE)** role: login → vehicle registration → inspection → auction creation → live → result → pickup. We're now adding three managerial roles **on top** of it without rebuilding any SE screens. The Ops dashboard (`/ops/*`) and Broker app (`/broker/*`) remain untouched.

### Scope Summary
| Role | Path Prefix | Persona | Screens |
|------|-------------|---------|---------|
| Sales Manager | `/sm/*` | Single-store operational lead | Dashboard, Pipeline, Auctions, Team (SE roster), Reports |
| General Manager | `/gm/*` | Multi-store regional head | Dashboard, Stores list + drill-down, Team (SM+SE), Auctions, Reports |
| Entity Admin | `/ea/*` | Org owner | Dashboard (org scorecard), Stores (+create), Team (+create GM), Auctions, Reports, Profile/Settings |

Plus: a `/role-select` post-login fork screen, a shared notification center, and a shared Vehicle Detail bottom sheet.

### Build Sequence (4 batches, presented as one approval)

**Batch 1 — Foundation**
- `src/data/oemMockData.ts` — single source of truth: 1 org (Ananda Honda), 1 GM, 4 stores, 4 SMs, 12 SEs, 39 vehicles across all stages, 9 live auctions, completed/failed history, notifications.
- `src/data/oemTypes.ts` — `Vehicle`, `Store`, `SalesManager`, `SalesExecutive`, `GeneralManager`, `Auction`, `Notification`, `Stage` types.
- Shared components in `src/components/oem/`:
  - `MetricCard`, `StageBadge`, `VehiclePipelineBar`, `AlertBanner`, `StoreCard`, `SEPerformanceRow`, `TimePeriodToggle`, `AuctionMiniCard`, `EmptyState`
  - `OemAppShell` (top header with logo / context label / bell + avatar, bottom 5-tab nav — variant-driven for SM / GM / EA)
  - `VehicleDetailSheet` (shared bottom sheet with status timeline + contextual CTA)
  - `NotificationCenter` route component
- `RoleSelect` page at `/role-select` — post-login fork (auto-advances if single role; toggles Manager/Field view if SM has `can_execute`).

**Batch 2 — Sales Manager (`/sm/*`)** — 5 screens
- `SmDashboard` — greeting, alert strip, Today's Pulse (4 metric cards + period toggle), VehiclePipelineBar (11 vehicles), live auctions horizontal scroll, team activity row, action-required list, recent results.
- `SmPipeline` — search, stage filter pills, sortable vehicle list with stage badges and contextual right-side actions.
- `SmAuctions` — tabs Live/Scheduled/Completed/Failed; failed tab includes Re-list / Revise CTAs.
- `SmTeam` — SE roster with full cards, "+ Add SE" sheet, SE detail bottom sheet with activity feed.
- `SmReports` — period toggle, summary KPIs, conversion bar, deals table, SE contribution horizontal bars (Tailwind divs, no chart library).

**Batch 3 — General Manager (`/gm/*`)** — 5 screens
- `GmDashboard` — portfolio KPIs, store health cards (4), store comparison table (sticky first column, amber/red cells for low values), live auctions across stores, SM activity table.
- `GmStores` — searchable list of all stores with attention filter.
- `GmStoreDetail` (`/gm/store/:storeId`) — read-only render of the SM dashboard for that store, scoped to its data.
- `GmTeam` — tabs SMs / SEs with store filter; SM rows tappable to detail sheet.
- `GmAuctions` — tabs Live / By Store (grouped + collapsible) / Completed / Failed.
- `GmReports` — store contribution bars, failure analysis, performance table.

**Batch 4 — Entity Admin (`/ea/*`)** — 6 screens
- `EaDashboard` — org scorecard (GMV, deals, conversion with trend chips), 6-month GMV trend bars, brand mix, stores summary, quick actions grid.
- `EaStores` (+ `EaStoreNew` sheet) — full store list with deactivate confirmation requiring typed store name.
- `EaTeam` (+ `EaGmNew` sheet) — tabs GM / SM / SE.
- `EaAuctions` — summary bar + 4 tabs.
- `EaReports` — full org scorecard, GMV by store + brand, deal table with status filter, payment status with pending table.
- `EaProfile` — profile, org details, legal/compliance status, platform stats, app settings, logout.

### Routing Integration (in `src/App.tsx`)
Add ~20 routes under three new prefixes. None of the existing SE routes (`/`, `/inspection/*`, `/auction/*`, `/auctions`, `/trust`) are modified. Add `/role-select` as a public route. The existing `/login` (MockLogin) flow is preserved; we'll add a "Continue as Manager" entry that hops to `/role-select`.

### Mock Data Strategy
A single shared `oemMockData.ts` ensures numbers reconcile across roles — e.g., GM's "9 live across stores" equals the sum of each SM's live count, and EA's "₹11.08L MTD GMV" equals the sum of all 4 store totals. All tier-3 KPIs (avg bid count, conversion %, time-to-first-bid) computed once and reused.

### Design System
Reuses existing Tailwind tokens (the SE prototype already uses DriveX red `#E8003D` via `--primary`). New stage colors (registered/inspected/listed/live/allocated/transit/closed) added to `tailwind.config.ts` as `stage-*` semantic tokens. Mobile-first (390px viewport target), tablet-responsive at 768px+.

### Out of Scope (Explicit)
- No backend tables / RLS — purely mock-data, frontend-only prototype.
- No real authentication — `/role-select` is reachable directly from login for demo purposes.
- No live realtime/WebSocket — countdown timers use local `setInterval`; bid feeds are static.
- No re-implementation of any SE, Ops, or Broker screens.

### Files to Create (~32) / Edit (2)
- **Edit:** `src/App.tsx` (routes), `tailwind.config.ts` (stage tokens)
- **Create — data (2):** `oemTypes.ts`, `oemMockData.ts`
- **Create — shared components (~12):** `MetricCard`, `StageBadge`, `VehiclePipelineBar`, `AlertBanner`, `StoreCard`, `SEPerformanceRow`, `TimePeriodToggle`, `AuctionMiniCard`, `EmptyState`, `OemAppShell`, `VehicleDetailSheet`, `NotificationCenter`
- **Create — pages (~17):** `RoleSelect` + 5 SM + 5 GM + 6 EA pages

