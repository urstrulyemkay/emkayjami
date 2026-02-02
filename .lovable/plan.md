
# Sound Notifications Implementation Plan

## Overview

Adding subtle, professional sound notifications that align with the app's "Truth Terminal" aesthetic - forensic and banking-like rather than playful consumer sounds. The sounds will provide immediate audio feedback for key actions without being intrusive.

---

## Sound Design Philosophy

Based on the app's personality guidelines from memory:
- **Subtle and professional** - soft ticks, gentle chimes, understated alerts
- **Forensic/banking app feel** - no playful sounds like confetti or game-like effects
- **Contextual feedback** - different tones for positive, negative, and neutral actions

---

## Sound Categories & Triggers

| Category | Sound Type | Events |
|----------|------------|--------|
| **Positive** | Soft ascending chime | Bid placed, auction won, payment confirmed, document verified, login success |
| **Negative** | Low subtle tone | Outbid, strike received, bid failed, insufficient coins, deadline warning |
| **Neutral** | Soft tick/click | Navigation, toggle, file selected, status update |
| **Alert** | Gentle pulse | New bid on watched auction, deadline reminder, important notification |
| **Coin** | Soft coin tick | Coins earned, coins spent |

---

## Technical Implementation

### Phase 1: Sound System Hook

Create a centralized `useSoundNotifications` hook:

```text
src/hooks/useSoundNotifications.ts

Features:
- Preloads audio files for instant playback
- Provides playSound(type) function
- Respects user's sound preference (stored in localStorage)
- Handles browser autoplay restrictions gracefully
- Volume control (subtle default, adjustable)
```

### Phase 2: Sound Assets

Create audio files in `public/sounds/`:

| File | Duration | Use Case |
|------|----------|----------|
| `success.mp3` | ~200ms | Bid placed, win, verification success |
| `coin-earn.mp3` | ~150ms | Coins earned |
| `coin-spend.mp3` | ~150ms | Coins spent |
| `outbid.mp3` | ~300ms | Outbid notification |
| `alert.mp3` | ~250ms | Important alerts, deadline warnings |
| `error.mp3` | ~200ms | Errors, failures |
| `tick.mp3` | ~100ms | UI interactions, toggles |
| `notification.mp3` | ~200ms | New activity, incoming bids |

Note: Will use base64-encoded minimal audio or generate via Web Audio API to avoid file dependencies initially.

### Phase 3: Integration Points

**Auction & Bidding (useRealtimeBids.ts, BrokerAuctionDetail.tsx):**
- Play "success" when bid is placed
- Play "outbid" when user is outbid
- Play "notification" when new bid arrives (if watching)

**Wallet (useBrokerWallet.ts):**
- Play "coin-earn" for earned/bonus transactions
- Play "coin-spend" for spent/penalty transactions

**Service Tracking (useServiceTracking.ts, BrokerWonVehicleDetail.tsx):**
- Play "success" when service status updated to completed
- Play "tick" when document uploaded

**Authentication (BrokerLogin.tsx):**
- Play "success" on successful login

**Strikes (useBrokerStrikes.ts):**
- Play "error" when new strike is detected

**Help & Support (BrokerHelp.tsx):**
- Play "success" when ticket submitted

**General UI:**
- Play "tick" on bottom nav tab changes (optional, may skip for subtlety)

---

## User Preference Control

Add sound toggle in BrokerProfile.tsx:
- "Sound Notifications" switch (on/off)
- Persisted to localStorage
- Default: ON

---

## File Changes Summary

### New Files:
1. `src/hooks/useSoundNotifications.ts` - Central sound management hook
2. `src/lib/sounds.ts` - Sound definitions and base64 audio data (or Web Audio synthesis)

### Modified Files:
1. `src/hooks/useRealtimeBids.ts` - Add outbid and new bid sounds
2. `src/hooks/useBrokerWallet.ts` - Add coin transaction sounds
3. `src/hooks/useServiceTracking.ts` - Add service completion sounds
4. `src/pages/broker/BrokerAuctionDetail.tsx` - Add bid placement sound
5. `src/pages/broker/BrokerLogin.tsx` - Add login success sound
6. `src/pages/broker/BrokerProfile.tsx` - Add sound preference toggle
7. `src/pages/broker/BrokerHelp.tsx` - Add ticket submission sound
8. `src/pages/broker/BrokerWonVehicleDetail.tsx` - Add service update sounds

---

## Technical Details

### Sound Hook API:

```typescript
const { playSound, soundEnabled, toggleSound } = useSoundNotifications();

// Usage
playSound('success');  // Bid placed
playSound('outbid');   // Got outbid
playSound('coin-earn'); // Earned coins
playSound('tick');     // UI interaction
```

### Web Audio API Approach (No External Files):

To avoid file dependencies, generate sounds programmatically:
- Success: Short ascending two-tone (C5 -> E5)
- Error: Short descending tone (E4 -> C4)
- Coin: Quick metallic tick
- Alert: Gentle pulse wave
- Tick: Brief click

### Browser Considerations:
- Sounds only play after user interaction (browser autoplay policy)
- Graceful degradation if Audio API unavailable
- No sounds during initial page load

---

## Implementation Order

1. Create `useSoundNotifications` hook with Web Audio API synthesis
2. Add sound preference toggle to BrokerProfile
3. Integrate into bidding flow (highest impact)
4. Add wallet transaction sounds
5. Add service tracking sounds
6. Add authentication sounds
7. Add remaining interaction sounds
