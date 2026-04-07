

# DriveX Ops Dashboard — Phased Build Plan

## Overview

The Ops Dashboard is a massive internal platform with 8+ modules, RBAC, queue engines, SLA tracking, audit trails, and more. Building it all at once is not feasible — we will build it **sequentially in phases**, with each phase delivering a usable increment.

This plan covers **Phase 1: Foundation + Dashboard Home**, which must exist before any module can work.

---

## Phase 1: Foundation + Dashboard Home

This phase builds the skeleton that all modules plug into.

### Step 1 — Ops Layout Shell
Create a new route tree under `/ops/*` with:
- Left sidebar navigation matching the playbook's A4.1 structure (Dashboard, Entities, Auctions & Deals, Logistics, Finance, Documentation, Trust & Compliance, Disputes, Reports, Settings)
- Collapsible sidebar with sub-items per module
- Top header bar with: Global Search, City Filter dropdown, Notification Bell, User Context (name/role)
- Navigation items hidden based on user role (not greyed out)
- Mobile-responsive layout

### Step 2 — Ops Auth + RBAC Foundation
- Create `ops_users` table (separate from existing `user_profiles`) with fields: user_id, email, full_name, phone, roles (array), status, city_filter, created_at, last_login
- Create `ops_audit_log` table for the shared audit trail infrastructure
- Create an Ops Login page at `/ops/login` using existing auth system but scoped to ops users
- Build a role-checking utility that determines which nav items and modules are visible
- Roles: super_admin, ops_manager, onboarding_ops, kam, auction_ops, logistics_coordinator, runner, finance_ops, doc_exec, doc_lead, qa_audit

### Step 3 — Dashboard Home (`/ops/dashboard`)
Build the home screen with:
- **Summary Cards (top row):** Active Auctions, Deals in Pipeline, Pending Pickups, Payment Exceptions, Overdue Documentation, Open Disputes, KYC Pending, Active Cascades — each with color logic and click-through navigation
- **Queue Health Table (middle):** Table showing every queue's health — Total Items, Assigned, Unassigned, On Track, Warning, Overdue, Avg Resolution Time. Each row clickable.
- **Recent Activity Feed (right panel):** Chronological feed of significant events (mock data for now)
- All data will use mock/seed data initially since the ops-specific tables are new

### Step 4 — Reusable Queue Component
Build the shared `QueueComponent` from section A5.1:
- Configurable columns, filters, sorting, pagination (25/50/100)
- SLA status pills (Green/Yellow/Orange/Red)
- Bulk select with checkbox column
- Filter bar with chips
- CSV export of current filtered view
- URL-synced filters for shareable links
- Row click handler for detail navigation
- This component will be reused by every module going forward

---

## Database Changes (Phase 1)

New tables:
1. `ops_users` — Ops team identity (separate from customer auth)
2. `ops_audit_log` — Shared audit trail for all ops actions

Seed data will be inserted to populate the dashboard with realistic mock values.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/ops/OpsLogin.tsx` | New — Ops login page |
| `src/pages/ops/OpsDashboard.tsx` | New — Dashboard home |
| `src/components/ops/OpsLayout.tsx` | New — Sidebar + header shell |
| `src/components/ops/OpsSidebar.tsx` | New — Left navigation |
| `src/components/ops/OpsHeader.tsx` | New — Top bar with search, city filter, notifications |
| `src/components/ops/SummaryCard.tsx` | New — Reusable summary card |
| `src/components/ops/QueueHealthTable.tsx` | New — Queue health summary |
| `src/components/ops/ActivityFeed.tsx` | New — Recent activity feed |
| `src/components/ops/QueueComponent.tsx` | New — Reusable queue/table component |
| `src/components/ops/SLAPill.tsx` | New — SLA status indicator |
| `src/contexts/OpsAuthContext.tsx` | New — Ops auth + role context |
| `src/hooks/useOpsRole.ts` | New — Role checking utilities |
| `src/data/opsNavigation.ts` | New — Navigation config with role permissions |
| `src/data/opsMockData.ts` | New — Mock data for dashboard |
| `src/App.tsx` | Modified — Add `/ops/*` route tree |

---

## Subsequent Phases (built after Phase 1)

- **Phase 2:** Module 1 — Entity Onboarding (OEM Directory, Broker Directory, KYC Review Queue)
- **Phase 3:** Module 2 — Auction & Deal Management (Live Auctions, Deal Tracker, Cascade Monitor)
- **Phase 4:** Module 3 — Logistics (Pickup Queue, Runner Interface)
- **Phase 5:** Module 4 — Finance & Settlements
- **Phase 6:** Module 5 — Documentation & Services
- **Phase 7:** Modules 6-8 — Trust, Disputes, Reports
- **Phase 8:** Settings & System Configuration

Each phase will be planned in detail when we reach it, using the playbook as the source of truth.

