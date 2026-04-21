# Design Notes

## What Was Used To Build It

### Frontend Technologies

- HTML5 semantic structure.
- CSS custom properties and responsive layout primitives.
- Vanilla JavaScript interaction engines.
- Browser WebGL API for custom procedural shader background.
- Three.js runtime scene for 3D cup model, steam particles, and orbiting bean swarm.

### Typography

- `Syne` for headlines and brand-forward display tone.
- `Manrope` for readable body content.
- `JetBrains Mono` for micro labels and technical accents.

### Color System

- Base charcoal: `#0f1316`.
- Warm copper accent: `#ce8654`.
- Cool cyan accent: `#62b8b0`.
- Supporting gold highlight: `#e3c184`.
- Light contrast surface for menu section: `#ece6da` family.

### Motion System Inventory

- WebGL procedural fluid-noise background shader.
- Interactive Three.js model stage with pointer orbit response.
- 2D vector-field particle simulation panel.
- Layered 3D hero geometry with pointer-driven tilt.
- Scroll reveal transitions with progressive stagger.
- Card perspective tilt in menu and gallery blocks.
- Magnetic hover behavior for CTA buttons.
- Number count-up animation for hero stats.
- Ambient grain and scanline texture loops.
- Marquee motion strip in gallery section.

### Visual Texture Stack

- Real-time shader color field.
- Aurora gradient field and cinematic blended overlays.
- SVG turbulence-based grain overlay.
- Repeating scanline filter.
- Glassmorphism-inspired translucent surfaces.
- Radial gradients and blend-based lighting simulation.

## Layout Strategy

- Hero split layout for narrative and dynamic visual anchor.
- Light-themed menu panel to create contrast and rhythm.
- Story section with abstract geometry and dynamic orbital forms.
- Photo-driven gallery cards with cinematic overlays and hover zoom.
- Dedicated interactive studio section for model/simulation showcase.
- Centered reservation card as final conversion focus.

## Accessibility Strategy

- `prefers-reduced-motion` support disables intense motion.
- Logical heading hierarchy and semantic landmarks.
- High-contrast text in key actionable areas.
- Touch-safe adaptations for pointer-only features.
- Lazy-loading gallery photos with descriptive `alt` text.

## Performance Strategy

- Lightweight base code with selective Three.js integration for advanced 3D.
- GPU-friendly transform animations where possible.
- IntersectionObserver for deferred reveal work.
- Canvas resolution clamped to reduce excessive GPU load.
