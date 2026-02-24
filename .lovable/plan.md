

## Show Dummy Progress Value on Broker Profile

### What's happening now
The broker's `trust_score` is 50 in the database, which correctly maps to **Level 3 - Preferred** (range 41-60). The progress bar to Level 4 (Trusted) calculates to **45%**, which should already be visible.

However, the progress bar may appear subtle. To make it clearer that the broker is progressing, we'll ensure the display shows a meaningful filled state.

### Changes

**File: `src/pages/broker/BrokerProfile.tsx`**
- Use a minimum dummy progress value of 45% (or the real calculated value, whichever is higher) so the bar always looks meaningfully filled
- Alternatively, since the real calculation already yields 45% for the current data, just ensure the progress bar renders with a visible color indicator and the percentage text is prominent

Since the math already produces 45%, the bar should be visible. If it's not showing, the issue may be that `progressToNext` is computed with the wrong level. Let me verify: `getProgressToNextLevel(50, 3)` uses `LEVELS[2]` (minScore=41) and `LEVELS[3]` (minScore=61), so progress = `(50-41)/(61-41)*100 = 45%`. This is correct.

The fix is simply to ensure the progress bar is visually prominent -- no code change may even be needed if it's already rendering correctly. But to be safe and ensure the user sees meaningful progress:

- Add a fallback minimum display value (e.g., ensure at least 35% is shown)
- Make the progress percentage text bolder/larger for visibility

### Technical Details

In `src/pages/broker/BrokerProfile.tsx` around line 162:
- The `Progress` component already receives `value={progressToNext}` which should be ~45%
- Ensure the progress bar has a visible color by adding a custom class if needed
- The current data (trust_score=50) already produces a good progress value, so no dummy override is strictly needed -- but we can add a comment noting this is real calculated progress
