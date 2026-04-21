# AGENTS.md

This file defines how human contributors and coding/design agents should collaborate on the Loft Cafe website repository.

## Mission

Deliver and maintain a visually distinctive, high-performance cafe website that combines loft-inspired art direction with advanced motion and interaction design.

## Collaboration Roles

- Creative Direction Agent
  - Owns visual cohesion, mood, and narrative consistency.
  - Validates typography, color direction, and section pacing.
- Frontend Implementation Agent
  - Owns markup, layout, responsive behavior, and accessibility semantics.
  - Implements reusable patterns without introducing framework bloat.
- Motion Systems Agent
  - Owns animation choreography, parallax logic, shader effects, and interaction feel.
  - Ensures smooth performance and reduced-motion compliance.
- Content/Brand Agent
  - Owns copy clarity, tone, menu naming consistency, and section messaging.
- QA Agent
  - Owns browser/device checks, keyboard navigation, and visual regression checks.

## Working Agreement

- Keep the visual direction aligned to "industrial loft, cinematic warmth, modern edge".
- Prioritize performance and accessibility over decorative complexity.
- New motion should be purposeful, not ornamental noise.
- Do not add heavy dependencies unless a measured requirement justifies them.
- Preserve graceful fallback behavior when advanced browser features are unavailable.

## Required Checks Before Merge

- `index.html` remains semantic and screen-reader friendly.
- All primary interactions work on mobile and desktop.
- `prefers-reduced-motion` is respected.
- No broken internal anchors.
- Documentation in `/docs` is updated when architecture or design strategy changes.

## Definition Of Done

- Feature is implemented and visually integrated.
- Feature is responsive and accessible.
- Performance impact assessed qualitatively.
- Supporting docs updated (tasks, notes, or research if relevant).

## Ownership Areas

- `index.html`: structure/content semantics.
- `styles.css`: design system, layout, animation styling.
- `script.js`: interaction engines and progressive enhancement.
- `docs/*`: planning artifacts, rationale, implementation notes.

## Change Management Rules

- Keep commits focused by concern: structure, style, behavior, docs.
- Avoid mixing broad refactors with feature delivery in one change.
- Document tradeoffs in `docs/DESIGN_NOTES.md` for non-obvious decisions.
