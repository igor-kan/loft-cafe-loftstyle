# Loft Cafe Loftstyle Website

Immersive one-page website concept for **Loft Cafe**, designed around industrial-loft aesthetics and advanced motion design patterns.

## What Is Included

- Cinematic hero section with layered 3D geometry and pointer-driven parallax.
- Real-time WebGL procedural background shader (no external rendering framework).
- Interactive Three.js studio scene with procedural 3D cup model, particle steam, and orbiting bean swarm.
- Real-time 2D vector-field simulation canvas with pointer-driven turbulence.
- Editorial photo gallery with cinematic overlays and tilt interactions.
- 2D kinetic UI system: reveal-on-scroll, card tilt, magnetic buttons, moving track banner.
- Custom cursor behavior for fine-pointer devices.
- Rich visual texture stack: grain, scanline overlay, soft-light atmospheric depth.
- Responsive layouts for desktop/tablet/mobile.
- Reduced-motion fallbacks for accessibility.
- Detailed project docs in `/docs` plus `AGENTS.md`.

## Run Locally

Use any static server. Example with Python:

```bash
cd loft-cafe-loftstyle
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Project Structure

```text
loft-cafe-loftstyle/
  AGENTS.md
  README.md
  index.html
  styles.css
  script.js
  docs/
    DESIGN_NOTES.md
    PLANNING.md
    RESEARCH.md
    TASKS.md
    TECH_STACK.md
```

## Build Approach

- Core stack: semantic HTML + modern CSS + JavaScript + Three.js (CDN).
- Most effects remain custom-coded while using Three.js for advanced 3D scene rendering.
- Performance-friendly defaults: limited overdraw, viewport-aware animation triggers.
- Visual language: copper + cyan accents, concrete neutrals, expressive typography.

## Next Expansion Options

1. Connect reservation form to backend endpoint.
2. Add CMS-driven menu and event content.
3. Add image/video assets optimized with responsive loading.
4. Add analytics and conversion tracking.
