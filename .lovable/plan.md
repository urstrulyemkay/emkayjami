

# Add Smooth Scroll-to-Latest Animation on New Bid

## Overview

Add automatic smooth scrolling to the latest bid node when a new bid appears on the horizontal timeline. This ensures users always see the most recent bidding activity without manual scrolling.

---

## Current Behavior

- The timeline is a horizontal scrollable container (line 106)
- Bids are rendered oldest-to-newest (left-to-right)
- When a new bid arrives, `newBidFlash` is triggered, but the scroll position stays unchanged
- Users might miss new bids if the timeline has scrolled

---

## Solution

1. Add a ref to the scroll container
2. Add a ref to the latest bid element
3. When a new bid comes in (detected by `newBidFlash`), smoothly scroll the container to show the latest bid

---

## Implementation

### File: `src/components/broker/LiveBidFeed.tsx`

### Step 1: Add Refs

```typescript
const scrollContainerRef = useRef<HTMLDivElement>(null);
const latestBidRef = useRef<HTMLDivElement>(null);
```

### Step 2: Add Scroll Effect

Add a new `useEffect` that triggers smooth scroll when a new bid arrives:

```typescript
// Smooth scroll to latest bid when new bid comes in
useEffect(() => {
  if (newBidFlash && scrollContainerRef.current && latestBidRef.current) {
    // Small delay to ensure the new bid element is rendered
    setTimeout(() => {
      latestBidRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "end"
      });
    }, 100);
  }
}, [newBidFlash]);
```

### Step 3: Attach Refs to Elements

**Scroll container (line 106):**
```typescript
<div ref={scrollContainerRef} className="overflow-x-auto pb-4 scrollbar-thin">
```

**Latest bid node (the last item in the mapped array):**
Add ref to the outermost div of the last bid:
```typescript
<div 
  key={bid.id} 
  className="flex items-center"
  ref={isLast ? latestBidRef : null}
>
```

---

## Result

| Scenario | Behavior |
|----------|----------|
| New bid arrives | Timeline smoothly scrolls to show the latest bid on the right |
| Page load | No automatic scroll (users see from the beginning) |
| Manual scroll | Scroll position preserved until new bid |

---

## Visual Flow

```
Before new bid:
[Bid A] --- [Bid B] --- [Bid C]  |  (viewport edge)
                                  ↑ user is here

After new bid (auto-scroll):
         [Bid B] --- [Bid C] --- [Bid D ✨]
                                  ↑ smoothly scrolled here
```

---

## Files Changed

| File | Changes |
|------|---------|
| `src/components/broker/LiveBidFeed.tsx` | Add scroll container ref, latest bid ref, and scroll effect |

