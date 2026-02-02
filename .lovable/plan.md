
# Fix: Highest Bid Mismatch Between Display and Activity

## Problem Identified

The "HIGHEST BID" card shows ₹36,500 but the Activity shows a leading bid of ₹38,000. This is a data synchronization issue.

**Root Cause**: The `auctions.current_highest_bid` field in the database is out of sync with the actual highest bid in `broker_bids`. 

Looking at the data:
| Bid Amount | Commission | Effective Score | Status |
|------------|------------|-----------------|--------|
| ₹38,000 | ₹1,000 | 32,450 | active |
| ₹36,500 | ₹800 | 31,145 | active |
| ₹35,000 | ₹500 | 29,825 | active |

The `auctions` table shows `current_highest_bid: 36500`, but the actual highest by effective score is ₹38,000.

---

## Solution

### Two-Part Fix:

**1. Fix the Display Logic (Immediate)**
Instead of trusting the `auctions.current_highest_bid` field, derive the highest bid directly from the actual bids data which is already fetched and sorted by effective score.

**Changes in `useRealtimeBids.ts`:**
```text
In fetchBids():
- After fetching bids (already sorted by effective_score DESC)
- Set currentHighestBid from the first bid's bid_amount (bids[0].bid_amount)
- Set currentHighestCommission from first bid's commission_amount
- This ensures the displayed value always matches the activity feed
```

**2. Fix the Update Logic (Prevent Future Issues)**
When placing a new bid, don't blindly update `current_highest_bid` based on comparison. Instead, after inserting the bid, re-query the actual highest bid and update the auctions table correctly.

**Changes in `placeBid()` function:**
```text
After inserting the new bid:
- Query broker_bids for this auction, sorted by effective_score DESC, limit 1
- Update auctions.current_highest_bid with that bid's amount
- Update auctions.current_highest_commission with that bid's commission
```

---

## File Changes

### `src/hooks/useRealtimeBids.ts`

**Fix 1 - fetchBids (lines ~109-137):**
- Derive currentHighestBid from actual bids data instead of trusting auction table
- Use `typedBids[0]?.bid_amount` instead of `auction?.current_highest_bid`

**Fix 2 - placeBid (lines ~181-211):**
- After inserting bid, query for actual highest bid by effective_score
- Update auctions table with the correct highest bid values

---

## Technical Details

The fix prioritizes the bids data as the source of truth since:
1. Bids are sorted by `effective_score DESC` when fetched
2. The first bid in the array is always the actual leader
3. This matches what's shown in the Activity feed

```typescript
// In fetchBids - use actual bid data for highest bid
const highestBid = typedBids[0];
const actualHighestBid = highestBid?.bid_amount || 0;
const actualHighestCommission = highestBid?.commission_amount || 0;

setAuctionState({
  currentHighestBid: actualHighestBid,  // Changed from auction table value
  currentHighestCommission: actualHighestCommission,
  // ...rest
});
```

```typescript
// In placeBid - query actual highest after insert
const { data: actualHighest } = await supabase
  .from("broker_bids")
  .select("bid_amount, commission_amount")
  .eq("auction_id", auctionId)
  .eq("status", "active")
  .order("effective_score", { ascending: false })
  .limit(1)
  .single();

// Update with actual highest
await supabase
  .from("auctions")
  .update({
    current_highest_bid: actualHighest?.bid_amount || bidAmount,
    current_highest_commission: actualHighest?.commission_amount || commission,
    bid_count: (currentAuction?.bid_count || 0) + 1,
  })
  .eq("id", auctionId);
```

---

## Result

After this fix:
- The "HIGHEST BID" card will always show the bid with the highest effective score
- This will match the "Leading" badge in the Activity feed
- Future bids will correctly update the auction table
- The realtime subscription will also work correctly since it now derives from actual bid data
