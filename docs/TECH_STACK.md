# Tech Stack

## Runtime

- Static frontend (no backend runtime required for current version).

## Languages

- HTML
- CSS
- JavaScript

## Browser APIs Used

- WebGL (`canvas.getContext("webgl")`) for animated procedural background.
- Canvas 2D for vector-field particle simulation and latte-art fluid mini-game.
- IntersectionObserver for reveal and count-up triggers.
- RequestAnimationFrame for smooth, frame-synced motion.
- Pointer Events for tilt, magnetic, and custom cursor interactions.
- MatchMedia for reduced-motion and pointer capability detection.

## External Dependencies

- Three.js loaded via CDN for interactive 3D model and particle scene rendering.
- Fonts loaded from Google Fonts (`Syne`, `Manrope`, `JetBrains Mono`).
- Unsplash image CDN URLs used for gallery photography.

## Why This Stack

- Maximum control over motion and visual rendering.
- Lightweight dependency footprint with high-end visual capability.
- Easy deployment to any static host.
- Clean foundation for later framework or CMS integration.
