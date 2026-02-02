
# Post-Sale Services Flow for Won Vehicles

## Overview

You're right - the services flow for won vehicles is completely missing. While the app mentions RC transfer obligations, tracks mock data for delivery/RC status, and warns about penalties, there's no actual functional flow for brokers to:

1. View their won vehicles with service tracking
2. Track vehicle pickup and delivery status
3. Upload RC transfer proof
4. Request name transfer and other services
5. See deadline reminders and status updates

## Current State

| Component | Status |
|-----------|--------|
| Won bids list in BrokerBids | Basic view only - cards not clickable |
| RC Transfer Warning | Shows in auction detail (before purchase) |
| Service status tracking | Only in mock data, not in database |
| Service upload/proof flow | Does not exist |
| Deadline tracking | Not implemented |

## Proposed Solution

Create a complete post-sale services journey with the following components:

---

## Phase 1: Database Schema

### New Table: `broker_won_vehicles`
Tracks the post-sale journey for each won auction:

```text
┌─────────────────────────────────────────────────────────────────┐
│  broker_won_vehicles                                            │
├─────────────────────────────────────────────────────────────────┤
│  id                    UUID (PK)                                │
│  broker_id             UUID (FK → brokers)                      │
│  auction_id            UUID (FK → auctions)                     │
│  bid_id                UUID (FK → broker_bids)                  │
│  won_at                TIMESTAMP                                │
│  payment_status        TEXT (pending/completed/failed)          │
│  payment_completed_at  TIMESTAMP                                │
│  pickup_status         TEXT (pending/scheduled/completed)       │
│  pickup_scheduled_at   TIMESTAMP                                │
│  pickup_completed_at   TIMESTAMP                                │
│  delivery_status       TEXT (pending/in_transit/delivered)      │
│  delivered_at          TIMESTAMP                                │
│  rc_transfer_status    TEXT (pending/in_progress/completed)     │
│  rc_transfer_deadline  DATE (6 months from won_at)              │
│  rc_transfer_proof_uri TEXT                                     │
│  rc_transferred_at     TIMESTAMP                                │
│  name_transfer_status  TEXT (pending/in_progress/completed)     │
│  name_transferred_at   TIMESTAMP                                │
│  insurance_status      TEXT (pending/transferred/new)           │
│  notes                 TEXT                                     │
│  created_at            TIMESTAMP                                │
│  updated_at            TIMESTAMP                                │
└─────────────────────────────────────────────────────────────────┘
```

### New Table: `service_documents`
Stores proof uploads for various services:

```text
┌─────────────────────────────────────────────────────────────────┐
│  service_documents                                              │
├─────────────────────────────────────────────────────────────────┤
│  id                    UUID (PK)                                │
│  won_vehicle_id        UUID (FK → broker_won_vehicles)          │
│  service_type          TEXT (rc_transfer/name_transfer/etc)     │
│  file_name             TEXT                                     │
│  file_uri              TEXT                                     │
│  file_type             TEXT                                     │
│  uploaded_at           TIMESTAMP                                │
│  verified_at           TIMESTAMP                                │
│  verification_status   TEXT (pending/verified/rejected)         │
│  rejection_reason      TEXT                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: New Pages & Components

### 1. Won Vehicle Detail Page (`/broker/won/:id`)

A comprehensive service tracking page with:

**Header Section:**
- Vehicle image and details
- Purchase date and winning bid amount
- Overall completion progress bar

**Service Stages (Stepper/Timeline View):**
```text
[Payment] → [Pickup] → [Delivery] → [RC Transfer] → [Name Transfer]
    ✓          ✓         🔄            ⏳              ⏳
```

**Each Stage Card Contains:**
- Status indicator (pending/in-progress/completed)
- Action buttons (e.g., "Upload Proof", "Schedule Pickup")
- Deadline warning if applicable
- Uploaded documents preview

**RC Transfer Section (Critical):**
- Large countdown timer showing days remaining (out of 180)
- Progress bar visual
- Upload proof button with camera/file options
- Verification status after upload
- Warning banner when < 30 days remaining
- Penalty info (-500 coins, -10 trust score)

**Documents Collected:**
- List of all uploaded service proofs
- Status badges (pending verification, verified, rejected)

### 2. Enhanced BrokerBids "Won" Tab

Update the existing Won tab to:
- Make cards clickable → navigate to `/broker/won/:id`
- Show mini service progress indicators
- Display upcoming deadlines
- Add RC deadline warning badge for urgent items

### 3. Service Upload Sheet Component

Reusable bottom sheet for uploading service proofs:
- Camera capture option
- File picker option
- Preview before upload
- Service type selection
- Optional notes field

---

## Phase 3: Hooks & Business Logic

### `useBrokerWonVehicles` Hook

```text
Returns:
- wonVehicles: list of all won vehicles with service status
- loading: boolean
- refetch: function

Features:
- Fetches from broker_won_vehicles joined with auctions/inspections
- Sorts by urgency (RC deadline approaching first)
- Filters by status (all/active/completed)
```

### `useServiceTracking` Hook

```text
Params: wonVehicleId

Returns:
- vehicle: full vehicle details with all service statuses
- documents: uploaded proofs
- loading/saving states

Actions:
- updateServiceStatus(serviceType, status)
- uploadProof(serviceType, file)
- getRemainingDays(deadline)
```

---

## Phase 4: Services Provided by DriveX

Based on the context of 2-wheeler transactions, implement tracking for:

| Service | Description | Deadline |
|---------|-------------|----------|
| **Payment** | Confirm payment to DriveX | 24-48 hours |
| **Pickup** | Schedule/confirm vehicle pickup | 3-5 days |
| **Delivery** | Track transit to broker | Varies |
| **RC Transfer** | Transfer Registration Certificate | 6 months |
| **Name Transfer** | Change ownership in RTO records | 6 months |
| **Insurance** | Transfer or new policy | 30 days |
| **NOC** | No Objection Certificate (if interstate) | As needed |

---

## Phase 5: Notifications & Reminders

Create reminder system for:
- Payment due (24 hours before deadline)
- RC transfer reminders at 30, 15, 7 days remaining
- Overdue warnings with penalty information
- Document verification status updates

---

## File Changes Summary

### New Files:
1. `src/pages/broker/BrokerWonVehicleDetail.tsx` - Main service tracking page
2. `src/components/broker/ServiceStageCard.tsx` - Individual service stage component
3. `src/components/broker/ServiceProgressStepper.tsx` - Visual stepper for stages
4. `src/components/broker/ServiceUploadSheet.tsx` - Upload proof bottom sheet
5. `src/components/broker/RCTransferCountdown.tsx` - RC deadline countdown widget
6. `src/hooks/useBrokerWonVehicles.ts` - Fetch won vehicles
7. `src/hooks/useServiceTracking.ts` - Individual vehicle service tracking
8. `supabase/migrations/xxx_create_broker_services.sql` - Database tables

### Modified Files:
1. `src/App.tsx` - Add route `/broker/won/:id`
2. `src/pages/broker/BrokerBids.tsx` - Make won cards clickable, add status badges
3. `src/components/broker/BrokerBottomNav.tsx` - Optional: Add services tab

---

## User Flow Diagram

```text
Broker wins auction
       ↓
System creates entry in broker_won_vehicles
       ↓
Broker sees won vehicle in "My Bids → Won" tab
       ↓
Clicks on won vehicle card
       ↓
Opens /broker/won/:id with service stages
       ↓
Completes each stage:
   • Payment → Confirm
   • Pickup → Schedule & confirm
   • Delivery → Track & confirm receipt
   • RC Transfer → Upload proof → Await verification
   • Name Transfer → Upload proof → Await verification
       ↓
All complete → Vehicle marked as "Completed"
```

---

## Technical Considerations

1. **RLS Policies**: Brokers can only view/update their own won vehicles
2. **Storage Bucket**: New `service-documents` private bucket for proofs
3. **Realtime**: Enable for `broker_won_vehicles` for status updates
4. **Deadline Enforcement**: Database trigger to auto-apply penalties after 6 months
5. **Verification Flow**: Initially manual (admin marks verified), can automate later

