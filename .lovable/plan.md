
# Fill Vehicle Information with Dummy Data

## Current Situation

The auction cards are pulling data from the database which already has realistic vehicle information:
- **TVS Apache RTR 160** - 2023, 12,450 km, Red
- **Bajaj Pulsar NS200** - 2022, 18,200 km, Black
- **Hero Splendor Plus** - 2021, 28,500 km, Blue
- **Yamaha FZ-S V3** - 2023, 8,500 km, Yellow
- **Royal Enfield Classic 350** - 2022, 15,000 km, Green
- **Honda Activa 6G** - 2022, 22,000 km, White

However, all cards show `/placeholder.svg` for thumbnails, and variants are empty.

---

## Solution

Update the `transformAuctionForCard` function in `BrokerDashboard.tsx` to provide:

1. **Realistic placeholder images** using external bike images (Unsplash URLs) mapped by vehicle make
2. **Vehicle variants** based on the make/model combination
3. **Better fallback handling** for any missing data

---

## Changes

### File: `src/pages/broker/BrokerDashboard.tsx`

Add a mapping object for realistic dummy thumbnails and variants:

```typescript
// Bike thumbnail URLs by make (using placeholder bike images)
const BIKE_THUMBNAILS: Record<string, string> = {
  "TVS": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "Bajaj": "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop",
  "Hero": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop",
  "Yamaha": "https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=400&h=300&fit=crop",
  "Royal Enfield": "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&h=300&fit=crop",
  "Honda": "https://images.unsplash.com/photo-1571646750667-720cacc6a570?w=400&h=300&fit=crop",
  "Suzuki": "https://images.unsplash.com/photo-1571646750667-720cacc6a570?w=400&h=300&fit=crop",
  "default": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
};

// Model variants for common bikes
const BIKE_VARIANTS: Record<string, string> = {
  "Apache RTR 160": "4V BS6",
  "Pulsar NS200": "ABS",
  "Splendor Plus": "i3S",
  "FZ-S V3": "FI",
  "Classic 350": "Signals",
  "Activa 6G": "DLX",
  "Access 125": "SE",
  "Jupiter": "ZX",
};
```

Update the `transformAuctionForCard` function to use these mappings:

```typescript
const transformAuctionForCard = (auction: AuctionWithInspection) => {
  const endTime = new Date(auction.end_time);
  const timeRemaining = Math.max(0, endTime.getTime() - Date.now());
  const grade = getGradeFromScore(auction.inspections?.condition_score);
  const make = auction.inspections?.vehicle_make || "Unknown";
  const model = auction.inspections?.vehicle_model || "Vehicle";

  return {
    id: auction.id,
    vehicle: {
      make: make,
      model: model,
      variant: BIKE_VARIANTS[model] || "",
      year: auction.inspections?.vehicle_year || 2023,
      kms: auction.inspections?.odometer_reading || 0,
      city: auction.geo_targeting_city || "Bangalore",
      grade: grade,
      thumbnail: BIKE_THUMBNAILS[make] || BIKE_THUMBNAILS["default"],
    },
    // ... rest remains same
  };
};
```

---

## Result

After this change:
- Each bike will display a realistic motorcycle image based on its make
- Variants will be shown (e.g., "Apache RTR 160 4V BS6")
- Better visual appearance in the dashboard cards

---

## Note for Images

You mentioned you'll provide actual images later. When ready:
1. Upload the images through Lovable's chat
2. I'll update the thumbnail mapping to use those local images instead of Unsplash URLs
