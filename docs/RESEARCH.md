# Research Notes

## Design Direction Research Summary

The target style combines industrial loft architecture with premium hospitality design language.

### Key Aesthetic Inputs

- Industrial textures: concrete, brushed metal, exposed structure.
- Warm contrast accents: copper, amber highlights, muted natural tones.
- Controlled cool tones for modernity: desaturated cyan and slate.
- Layered light behavior: glow, haze, grain, and contrast transitions.

### Motion and Interaction Trends Applied

- Ambient real-time backgrounds for atmospheric presence.
- Micro-depth interactions (tilt/parallax) to make UI feel tactile.
- Scroll-triggered reveal pacing for cinematic narrative progression.
- Kinetic type bands and moving labels for editorial energy.

## UX/Conversion Research Principles Applied

- Immediate value signal in hero section.
- Short, curated menu cards instead of exhaustive lists.
- Emotional reinforcement before conversion section.
- Single focused conversion action (reservation request).

## Accessibility and Performance Considerations

- Motion alternatives for `prefers-reduced-motion` users.
- Avoid dependency-heavy animation libraries to reduce startup overhead.
- Keep interactions pointer-aware and degrade cleanly on touch devices.
- Use semantic HTML and clear heading hierarchy.

## Risks Identified

- Advanced visual effects can overwhelm if not tuned.
- Heavy filters and large layered backgrounds can reduce frame rate.
- Highly stylized typography can hurt readability if overused.

## Mitigations Used

- Restrained effect density by section.
- Motion is mostly transform/opacity based for better compositing.
- Body copy kept on highly legible sans-serif.
- Strong contrast and clear CTA hierarchy.
