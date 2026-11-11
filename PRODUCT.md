# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

The American Badminton Premier League public website introduces the league, its leadership, league format, and upcoming season. Visitors can explore the existing pages and contact the league. A separate authenticated dashboard maintains the published content.

## Users

Public visitors exploring ABPL and administrators managing the site. More specific audience priorities have not been established.

## Capabilities and Constraints

- Preserve the existing public content, routes, metadata, contact links, and administrative functionality.
- Preserve database-backed editing of text, navigation, images, appearance, and motion preferences.
- The existing implementation uses Vue 3, Vite, Vue Router, plain CSS, Express, and PostgreSQL. Continue using this stack.
- Run and verify the application through Docker Compose using the separate local override; do not replace the deployment configuration or reset stored data.
- The user approved a complete public-site redesign, not another motion-only refinement.

## Brand Commitments

- Keep the ABPL name and existing logo.
- The user's reference reels establish the ambition: immersive, cinematic websites with prominent imagery, spatial depth, and scroll-led transitions.
- References: https://www.instagram.com/kryntixstudio/reel/DdrMUbOpQX0/ ; https://www.instagram.com/reel/DVTYxhJjOwz/ ; https://www.instagram.com/reel/Dd_UfShp32b/
- The user approved sourcing licensed badminton imagery and building an original interactive 3D shuttle. Do not reuse the reels' characters, artwork, or source code.

## Evidence on Hand

- Published content is served by the API; backend/src/seed.json is the initial content fixture, not a replacement for saved content.
- frontend/src/assets/logo.png is the existing crest.
- Some leadership, franchise, and season details are placeholders. Do not invent names, dates, results, sponsors, testimonials, or participation claims.
- No user-owned badminton photos or footage have been supplied. Any sourced imagery must have a documented license and must not imply it depicts ABPL participants or events.

## Product Principles

- The public site must clearly identify ABPL and badminton while delivering the cinematic experience shown in the references.
- Preserve usable navigation and real content underneath the visual presentation.
- Keep the administrator's editing controls effective and the private dashboard task-focused.
- Prefer original sports-specific visuals over unrelated cinematic assets or decorative interface effects.

## Accessibility & Inclusion

Respect prefers-reduced-motion and the site's motion setting. Preserve keyboard access, visible focus, readable contrast, touch behavior, responsive layouts, and non-WebGL fallbacks. Decorative scenes must not obstruct content or controls.