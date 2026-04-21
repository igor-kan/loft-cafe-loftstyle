# Tech Stack

## Runtime

- Static frontend (no backend runtime required for current version).

## Languages

- HTML
- CSS
- JavaScript

## Browser APIs Used

- WebGL (`canvas.getContext("webgl")`) for animated procedural background.
- IntersectionObserver for reveal and count-up triggers.
- RequestAnimationFrame for smooth, frame-synced motion.
- Pointer Events for tilt, magnetic, and custom cursor interactions.
- MatchMedia for reduced-motion and pointer capability detection.

## External Dependencies

- None in build/runtime JavaScript.
- Fonts loaded from Google Fonts (`Syne`, `Manrope`, `JetBrains Mono`).

## Why This Stack

- Maximum control over motion and visual rendering.
- Minimal dependency overhead and simpler portability.
- Easy deployment to any static host.
- Clean foundation for later framework or CMS integration.
