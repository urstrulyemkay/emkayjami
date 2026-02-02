

# Add Fullscreen Image Viewer for Inspection Photos

## Overview

Add a fullscreen lightbox-style image viewer that opens when users click on any inspection photo. This will allow brokers to examine vehicle condition in detail.

---

## Current State

The `BrokerAuctionDetail.tsx` page displays inspection images in three locations:
1. **Main Hero Image** (line 359-379) - Large featured image at top
2. **Thumbnail Strip** (line 381-399) - Horizontal scroll of small previews
3. **Photo Evidence Grid** (line 585-598) - Grid inside the Inspection Report accordion

Currently, none of these are clickable - they just display the images statically.

---

## Solution

Create a fullscreen image viewer using the existing `Dialog` component with:
- Navigation between images (previous/next)
- Image counter (e.g., "3 of 12")
- Caption showing the angle name
- Close button
- Keyboard navigation support

---

## Implementation Details

### File: `src/pages/broker/BrokerAuctionDetail.tsx`

### Step 1: Add State Variables (after line 119)

```typescript
// Image viewer state
const [imageViewerOpen, setImageViewerOpen] = useState(false);
const [selectedImageIndex, setSelectedImageIndex] = useState(0);
```

### Step 2: Add Helper Functions

```typescript
const openImageViewer = (index: number) => {
  setSelectedImageIndex(index);
  setImageViewerOpen(true);
};

const navigateImage = (direction: "prev" | "next") => {
  const images = auction?.inspections?.captured_images || [];
  if (direction === "next") {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  } else {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }
};

// Keyboard navigation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!imageViewerOpen) return;
    if (e.key === "ArrowRight") navigateImage("next");
    if (e.key === "ArrowLeft") navigateImage("prev");
    if (e.key === "Escape") setImageViewerOpen(false);
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [imageViewerOpen]);
```

### Step 3: Add Click Handlers to Images

**Main Hero Image (lines 361-365):**
```typescript
<img
  src={auction.inspections.captured_images[0].uri}
  alt={auction.inspections?.vehicle_model || "Vehicle"}
  className="w-full h-full object-cover cursor-pointer"
  onClick={() => openImageViewer(0)}
/>
```

**Thumbnail Gallery (lines 390-394):**
```typescript
<img
  src={img.uri}
  alt={img.angle}
  className="w-full h-full object-cover cursor-pointer"
  onClick={() => {
    const index = auction.inspections!.captured_images.findIndex(i => i.id === img.id);
    openImageViewer(index);
  }}
/>
```

**Photo Evidence Grid (lines 587-596):**
Add click handler to the wrapper div:
```typescript
<div 
  key={image.id} 
  className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
  onClick={() => {
    const index = auction.inspections!.captured_images.findIndex(i => i.id === image.id);
    openImageViewer(index);
  }}
>
```

### Step 4: Add Import for Icons

Add to the lucide-react import (line 33):
```typescript
ChevronLeft, ChevronRight, X, Maximize2
```

### Step 5: Add Fullscreen Image Viewer Dialog (before closing fragment)

```typescript
{/* Fullscreen Image Viewer */}
<Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
  <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-none">
    {auction?.inspections?.captured_images && auction.inspections.captured_images.length > 0 && (
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          onClick={() => setImageViewerOpen(false)}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 z-50 text-white text-sm bg-black/50 px-3 py-1.5 rounded-full">
          {selectedImageIndex + 1} of {auction.inspections.captured_images.length}
        </div>

        {/* Previous Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12"
          onClick={() => navigateImage("prev")}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>

        {/* Main Image */}
        <img
          src={auction.inspections.captured_images[selectedImageIndex]?.uri}
          alt={auction.inspections.captured_images[selectedImageIndex]?.angle}
          className="max-w-full max-h-full object-contain"
        />

        {/* Next Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12"
          onClick={() => navigateImage("next")}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>

        {/* Caption */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white text-center">
          <p className="text-lg font-medium capitalize">
            {auction.inspections.captured_images[selectedImageIndex]?.angle.replace(/_/g, " ")}
          </p>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
```

---

## User Experience

| Interaction | Action |
|-------------|--------|
| Click any image | Opens fullscreen viewer at that image |
| Click left arrow | Navigate to previous image |
| Click right arrow | Navigate to next image |
| Press Left/Right arrow keys | Navigate between images |
| Press Escape or click X | Close the viewer |
| Click outside | Close the viewer |

---

## Visual Design

- Full black background (95% opacity) for focus
- Large centered image with object-contain to preserve aspect ratio
- Semi-transparent navigation buttons on hover
- Image counter badge in top-left corner
- Angle caption at bottom center
- Smooth transitions between images

---

## Files Changed

| File | Changes |
|------|---------|
| `src/pages/broker/BrokerAuctionDetail.tsx` | Add state, handlers, click events, and Dialog component |

