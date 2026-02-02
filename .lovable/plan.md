

# Add Countdown Timer Showing Time Remaining Until Auction Ends

## Overview

Add a prominent, animated countdown timer to the `LiveBidFeed` component that shows time remaining until the auction ends. The timer will display hours, minutes, and seconds with visual urgency indicators as time runs low.

---

## Current State

- `BrokerAuctionDetail.tsx` already tracks `timeLeft` state and has a `formatTime` function
- A basic timer exists in the "Auction Details" section (line 497-499) but it's small and not prominent
- `LiveBidFeed` component currently shows bid count but no countdown timer
- The component receives bids but not auction end time information

---

## Solution

Add a countdown timer to `LiveBidFeed` by:
1. Passing `endTime` and `auctionType` as new props
2. Creating a local timer that updates every second
3. Adding a prominent timer display with urgency states (normal, warning, critical)
4. Including smooth digit animations for visual appeal

---

## Visual Design

```text
+---------------------------------------------------+
| ● Live Bidding              [New!]    👥 12       |
+---------------------------------------------------+
|                                                   |
|  ┌─────────────────────────────────────────────┐  |
|  │  ⏱  Time Remaining                          │  |
|  │                                              │  |
|  │     02 : 34 : 56                            │  |
|  │    hrs   min   sec                          │  |
|  │                                              │  |
|  │  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░  25% remaining        │  |
|  └─────────────────────────────────────────────┘  |
|                                                   |
|  Highest Bid                                      |
|  ₹85,000                              📈         |
+---------------------------------------------------+
```

### Urgency States

| Time Remaining | State | Visual |
|----------------|-------|--------|
| > 30 minutes | Normal | Default colors |
| 5-30 minutes | Warning | Yellow/amber tint, subtle pulse |
| < 5 minutes | Critical | Red tint, faster pulse, shake animation |
| 0 (ended) | Ended | Gray, "Auction Ended" text |

---

## Implementation

### File: `src/components/broker/LiveBidFeed.tsx`

### Step 1: Update Props Interface

```typescript
interface LiveBidFeedProps {
  bids: RealtimeBid[];
  currentHighestBid: number;
  bidCount: number;
  myBrokerId?: string;
  endTime?: string;           // NEW: Auction end time
  auctionType?: string;       // NEW: To hide timer for one_click
}
```

### Step 2: Add Timer State and Effect

```typescript
const [timeLeft, setTimeLeft] = useState(0);

// Update countdown timer
useEffect(() => {
  if (!endTime || auctionType === "one_click") return;
  
  const updateTimer = () => {
    const remaining = new Date(endTime).getTime() - Date.now();
    setTimeLeft(Math.max(0, remaining));
  };
  
  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return () => clearInterval(interval);
}, [endTime, auctionType]);
```

### Step 3: Add Timer Format Helper

```typescript
const formatCountdown = (ms: number) => {
  if (ms <= 0) return { hours: "00", minutes: "00", seconds: "00" };
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0")
  };
};

const getTimerUrgency = (ms: number) => {
  if (ms <= 0) return "ended";
  if (ms < 5 * 60 * 1000) return "critical";
  if (ms < 30 * 60 * 1000) return "warning";
  return "normal";
};
```

### Step 4: Add Countdown Timer Component (Insert Before Highest Bid Card)

```tsx
{/* Countdown Timer */}
{endTime && auctionType !== "one_click" && (
  <div className={cn(
    "rounded-xl p-4 border transition-all duration-300",
    getTimerUrgency(timeLeft) === "critical" && "bg-destructive/10 border-destructive/30 animate-pulse",
    getTimerUrgency(timeLeft) === "warning" && "bg-warning/10 border-warning/30",
    getTimerUrgency(timeLeft) === "normal" && "bg-muted/50 border-border",
    getTimerUrgency(timeLeft) === "ended" && "bg-muted border-border opacity-60"
  )}>
    <div className="flex items-center gap-2 mb-3">
      <Clock className={cn(
        "w-4 h-4",
        getTimerUrgency(timeLeft) === "critical" && "text-destructive animate-pulse",
        getTimerUrgency(timeLeft) === "warning" && "text-warning",
        getTimerUrgency(timeLeft) === "normal" && "text-muted-foreground",
        getTimerUrgency(timeLeft) === "ended" && "text-muted-foreground"
      )} />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {timeLeft <= 0 ? "Auction Ended" : "Time Remaining"}
      </span>
    </div>
    
    <div className="flex items-center justify-center gap-1 text-center">
      {/* Hours */}
      <div className="flex flex-col items-center">
        <span className={cn(
          "text-3xl font-mono font-bold tabular-nums",
          getTimerUrgency(timeLeft) === "critical" && "text-destructive",
          getTimerUrgency(timeLeft) === "warning" && "text-warning",
          getTimerUrgency(timeLeft) === "normal" && "text-foreground",
          getTimerUrgency(timeLeft) === "ended" && "text-muted-foreground"
        )}>
          {formatCountdown(timeLeft).hours}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">hrs</span>
      </div>
      
      <span className="text-2xl font-bold text-muted-foreground mx-0.5">:</span>
      
      {/* Minutes */}
      <div className="flex flex-col items-center">
        <span className={cn(
          "text-3xl font-mono font-bold tabular-nums",
          getTimerUrgency(timeLeft) === "critical" && "text-destructive",
          getTimerUrgency(timeLeft) === "warning" && "text-warning",
          getTimerUrgency(timeLeft) === "normal" && "text-foreground",
          getTimerUrgency(timeLeft) === "ended" && "text-muted-foreground"
        )}>
          {formatCountdown(timeLeft).minutes}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">min</span>
      </div>
      
      <span className="text-2xl font-bold text-muted-foreground mx-0.5">:</span>
      
      {/* Seconds */}
      <div className="flex flex-col items-center">
        <span className={cn(
          "text-3xl font-mono font-bold tabular-nums",
          getTimerUrgency(timeLeft) === "critical" && "text-destructive animate-pulse",
          getTimerUrgency(timeLeft) === "warning" && "text-warning",
          getTimerUrgency(timeLeft) === "normal" && "text-foreground",
          getTimerUrgency(timeLeft) === "ended" && "text-muted-foreground"
        )}>
          {formatCountdown(timeLeft).seconds}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">sec</span>
      </div>
    </div>
  </div>
)}
```

### Step 5: Update LiveBidFeed Usage in BrokerAuctionDetail.tsx

```tsx
<LiveBidFeed
  bids={bids}
  currentHighestBid={currentHighestBid}
  bidCount={bidCount}
  myBrokerId={broker?.id}
  endTime={auction.end_time}           // NEW
  auctionType={auction.auction_type}   // NEW
/>
```

---

## Technical Notes

- Import `cn` from `@/lib/utils` for conditional class merging
- Timer updates independently from parent to avoid re-renders
- Uses `tabular-nums` font feature for stable digit widths
- Pulses and color changes provide clear visual urgency cues
- Timer is hidden for "one_click" auction type (as in existing logic)

---

## Files Changed

| File | Changes |
|------|---------|
| `src/components/broker/LiveBidFeed.tsx` | Add props, timer state, countdown UI |
| `src/pages/broker/BrokerAuctionDetail.tsx` | Pass endTime and auctionType to LiveBidFeed |

