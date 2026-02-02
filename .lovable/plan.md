
# Add Sample Video and Voice Recording Data

## Overview

Adding realistic test data to the `captured_videos` and `voice_recordings` tables to populate the inspection system with sample media references for testing purposes.

---

## Current State

- **captured_videos**: Empty (0 records)
- **voice_recordings**: Empty (0 records)
- **inspections**: 10 records with various vehicles (TVS, Bajaj, Hero, Yamaha, Royal Enfield, Honda, Suzuki)

---

## Data to Insert

### Captured Videos (8 records)

Based on the `VideoType` enum: `walkaround`, `engine_start`, `idle_sound`, `acceleration`

| Inspection | Vehicle | Video Type | Duration | URI |
|------------|---------|------------|----------|-----|
| TVS Apache RTR 160 | walkaround | 45s | `videos/apache-walkaround.mp4` |
| TVS Apache RTR 160 | engine_start | 12s | `videos/apache-engine-start.mp4` |
| Bajaj Pulsar NS200 | walkaround | 52s | `videos/pulsar-walkaround.mp4` |
| Bajaj Pulsar NS200 | idle_sound | 15s | `videos/pulsar-idle.mp4` |
| Hero Splendor Plus | walkaround | 38s | `videos/splendor-walkaround.mp4` |
| Royal Enfield Classic 350 | engine_start | 18s | `videos/classic-engine-start.mp4` |
| Royal Enfield Classic 350 | acceleration | 25s | `videos/classic-acceleration.mp4` |
| Honda Activa 6G | walkaround | 40s | `videos/activa-walkaround.mp4` |

### Voice Recordings (10 records)

Based on `DefectCategory` enum: `engine`, `transmission`, `electricals`, `frame`, `body`, `tyres`, `suspension`, `brakes`

| Inspection | Category | Transcript | Duration |
|------------|----------|------------|----------|
| TVS Apache RTR 160 | engine | "Engine running smooth, no knocking sounds detected. Oil level appears adequate." | 8s |
| TVS Apache RTR 160 | tyres | "Front tyre has approximately 60% tread remaining. Rear tyre showing minor wear on edges." | 10s |
| Bajaj Pulsar NS200 | brakes | "Front disc brake responsive. Rear drum brake requires adjustment, slight squeaking." | 9s |
| Bajaj Pulsar NS200 | electricals | "All indicators working. Headlight beam slightly misaligned to the left." | 7s |
| Hero Splendor Plus | engine | "Engine oil leak detected near the gasket area. Recommend replacement." | 6s |
| Hero Splendor Plus | transmission | "Gear shifts smooth for all gears. Clutch cable slightly loose." | 8s |
| Royal Enfield Classic 350 | suspension | "Front fork oil seals showing wear. Rear suspension adequate." | 7s |
| Yamaha FZ-S V3 | body | "Minor scratches on the fuel tank. Left side panel has a small crack." | 9s |
| Honda Activa 6G | electricals | "Battery in good condition. Self-start working properly." | 5s |
| Suzuki Access 125 | frame | "Frame appears straight, no visible damage from accidents." | 6s |

---

## SQL Migration

```sql
-- Insert sample captured videos
INSERT INTO captured_videos (inspection_id, video_type, uri, duration, latitude, longitude) VALUES
('11111111-1111-1111-1111-111111111111', 'walkaround', 'inspection-videos/apache-walkaround.mp4', 45, 12.9716, 77.5946),
('11111111-1111-1111-1111-111111111111', 'engine_start', 'inspection-videos/apache-engine-start.mp4', 12, 12.9716, 77.5946),
('22222222-2222-2222-2222-222222222222', 'walkaround', 'inspection-videos/pulsar-walkaround.mp4', 52, 12.9352, 77.6245),
('22222222-2222-2222-2222-222222222222', 'idle_sound', 'inspection-videos/pulsar-idle.mp4', 15, 12.9352, 77.6245),
('33333333-3333-3333-3333-333333333333', 'walkaround', 'inspection-videos/splendor-walkaround.mp4', 38, 12.9165, 77.6101),
('55555555-5555-5555-5555-555555555555', 'engine_start', 'inspection-videos/classic-engine-start.mp4', 18, 12.9784, 77.5712),
('55555555-5555-5555-5555-555555555555', 'acceleration', 'inspection-videos/classic-acceleration.mp4', 25, 12.9784, 77.5712),
('66666666-6666-6666-6666-666666666666', 'walkaround', 'inspection-videos/activa-walkaround.mp4', 40, 19.0760, 72.8777);

-- Insert sample voice recordings
INSERT INTO voice_recordings (inspection_id, category, audio_uri, transcript, duration) VALUES
('11111111-1111-1111-1111-111111111111', 'engine', 'voice-recordings/apache-engine.mp3', 'Engine running smooth, no knocking sounds detected. Oil level appears adequate.', 8),
('11111111-1111-1111-1111-111111111111', 'tyres', 'voice-recordings/apache-tyres.mp3', 'Front tyre has approximately 60% tread remaining. Rear tyre showing minor wear on edges.', 10),
('22222222-2222-2222-2222-222222222222', 'brakes', 'voice-recordings/pulsar-brakes.mp3', 'Front disc brake responsive. Rear drum brake requires adjustment, slight squeaking.', 9),
('22222222-2222-2222-2222-222222222222', 'electricals', 'voice-recordings/pulsar-electricals.mp3', 'All indicators working. Headlight beam slightly misaligned to the left.', 7),
('33333333-3333-3333-3333-333333333333', 'engine', 'voice-recordings/splendor-engine.mp3', 'Engine oil leak detected near the gasket area. Recommend replacement.', 6),
('33333333-3333-3333-3333-333333333333', 'transmission', 'voice-recordings/splendor-transmission.mp3', 'Gear shifts smooth for all gears. Clutch cable slightly loose.', 8),
('55555555-5555-5555-5555-555555555555', 'suspension', 'voice-recordings/classic-suspension.mp3', 'Front fork oil seals showing wear. Rear suspension adequate.', 7),
('44444444-4444-4444-4444-444444444444', 'body', 'voice-recordings/fzs-body.mp3', 'Minor scratches on the fuel tank. Left side panel has a small crack.', 9),
('66666666-6666-6666-6666-666666666666', 'electricals', 'voice-recordings/activa-electricals.mp3', 'Battery in good condition. Self-start working properly.', 5),
('77777777-7777-7777-7777-777777777777', 'frame', 'voice-recordings/access-frame.mp3', 'Frame appears straight, no visible damage from accidents.', 6);
```

---

## Implementation

1. Run database migration to insert sample videos (8 records)
2. Run database migration to insert sample voice recordings (10 records)

---

## Notes

- URIs point to placeholder paths in the storage buckets (`inspection-videos/` and `voice-recordings/`)
- Coordinates are set to Bangalore area for realism
- Transcripts are realistic 2-wheeler inspection observations
- Durations are typical for each video/recording type
