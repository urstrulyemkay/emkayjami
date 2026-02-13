

## Fix Broker Level Consistency

### Problem
The broker profile shows **"Level 1 - Preferred"** because it mixes two sources:
- Level **number** comes from the database column `broker.level` (hardcoded to 1)
- Level **name** comes from `getLevelFromScore(broker.trust_score)` which maps trust_score 50 to "Preferred" (level 3)

This creates a mismatch like "Level 1 - Preferred" when it should show "Level 3 - Preferred".

### Solution
Derive the level entirely from `trust_score` instead of using the stale `broker.level` database column. This ensures the level number and name are always in sync.

### Changes

**File: `src/pages/broker/BrokerProfile.tsx`**
- Replace `broker.level` references with `levelConfig.level` (derived from trust score)
- Update the "Progress to Level" section to use the computed level instead of the DB column
- Update the next-level lookup to use `levelConfig.level` instead of `broker.level`

Specifically:
- Line 77: Change `LEVELS[broker.level]` to `LEVELS[levelConfig.level]` for next level lookup
- Line 78: Change `getProgressToNextLevel(broker.trust_score, broker.level)` to use `levelConfig.level`
- Line 144: The badge already uses `levelConfig` so that's correct
- Line 145: Change `broker.level` to `levelConfig.level` in the badge text
- Line 156-165: Update the progress section to use `levelConfig.level` consistently

**File: `src/contexts/BrokerAuthContext.tsx`** (signup function)
- No changes needed -- new brokers start with `trust_score` default (50 in DB) and `level` doesn't need to be manually set since we'll derive it

### Technical Detail

The `LEVELS` array in `brokerMockData.ts` is already correct:

| Level | Name | Score Range |
|-------|------|-------------|
| 1 | New | 0 - 20 |
| 2 | Active | 21 - 40 |
| 3 | Preferred | 41 - 60 |
| 4 | Trusted | 61 - 80 |
| 5 | Elite | 81 - 100 |

The fix is simply ensuring the UI reads from `getLevelFromScore()` everywhere instead of the database `level` column.

### Files Modified
- `src/pages/broker/BrokerProfile.tsx` -- use computed level consistently

