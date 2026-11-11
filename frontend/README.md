# ABPL Frontend

A Vue 3 frontend for the American Badminton Premier League website and its private content dashboard. Published content is loaded from the PostgreSQL-backed API in `../backend`; no hardcoded fallback silently replaces saved content.

## Requirements

- Node.js 22.12+ or 24 and npm.
- The backend API running on port 3300, normally through the root Docker Compose stack.
- JavaScript enabled in the browser. Anton, Barlow, and Barlow Condensed are self-hosted through Fontsource; no Google Fonts request is required. System fallbacks remain available.

## Development

From the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite. Its default port is 5173; it selects another port when that port is occupied. Vite proxies `/api` to `http://127.0.0.1:3300`, or `API_PROXY_TARGET` if set. If Vite chooses a different port, add that browser origin to the backend's `ALLOWED_ORIGINS`.

## Verification and Production

Run these commands inside `frontend`:

```sh
npm test
npm run build
npm run preview
```

`npm run test:watch` runs component tests in watch mode. Tests cover public routes, metadata, mobile navigation, biography cards, motion, admin authentication, field coverage, publishing, conflicts, and unsaved-edit protection. Tests use the backend seed document as a fixture; that fixture is not bundled into the application.

The supplied Dockerfile builds the application and serves it with nginx. nginx provides Vue Router's HTML5-history fallback; it does not proxy API requests. Set the build-time `VITE_API_URL` to the separately deployed backend origin, such as `https://abpl-api.kethan.dev`. If deploying `dist` elsewhere, configure a fallback to `dist/index.html` for page requests, including legacy `.html` URLs and `/admin-login`. Vite development and preview servers already provide these behaviors.

The supplied deployment is rooted at `/`. Subdirectory deployment requires adapting Vite's base, nginx locations, and root-relative admin/public links. This is a client-rendered application, not a server-rendered or pre-rendered site.

## Pages

- `/` with `/index.html` as an alias.
- `/about` with `/about.html` as an alias.
- `/team` with `/team.html` as an alias.
- `/league` with `/info` and `/info.html` as aliases.
- `/stats` with `/stats.html` as an alias.
- `/admin-login`, a separate sign-in page with no link from the public UI.
- `/admin`, a protected dashboard with page content, site settings, appearance, and account controls.

Unknown routes show a not-found page with a link home.

## Source Layout

- `src/views`: public pages, login, and dashboard.
- `src/components`: public components and reusable administrative forms.
- `src/admin/editor.js`: the complete editable field definition and collection helpers.
- `src/stores/content.js`: published content, load/error state, navigation, and theme settings.
- `src/services/api.js`: API requests and in-memory session/CSRF state. Passwords and tokens are not stored in localStorage.
- `src/data/site.js`: fixed public route paths.
- `src/composables` and `src/directives`: media preferences and lifecycle-managed reveal effects.
- `src/assets/style.css`: the migrated ABPL visual system and responsive styles.
- `src/assets/logo.png`: the inherited original crest, used when no replacement is configured.
- `src/assets/admin.css`: scoped, task-focused administrative UI styles.

The original navy, gold, maroon, typography, and page content are retained. Team cards use native buttons with keyboard support, and closed mobile navigation is removed from keyboard access. Event listeners, observers, and animation frames are cleaned up when their components unmount.

## Motion Implementation

The public site follows the approved Courtside Cinema direction in the root PRODUCT.md and .impeccable surface brief. It uses Vue and plain CSS for UI, Three.js for an original 3D shuttle, GSAP for scoped scene motion, and IntersectionObserver for visibility. There is no React or Tailwind dependency. The implementation is organized in this order:

1. [src/composables/usePointerEffects.js](src/composables/usePointerEffects.js) coordinates magnetic controls, card tilt/glare, and the lagging cursor from one delegated pointer listener and one settling animation-frame loop. Positions are read on target changes, then transforms are written once per frame. Attraction is limited to 5px and tilt to 5 degrees. Static cards do not receive a clickable cursor.
2. [src/components/TeamMemberCard.vue](src/components/TeamMemberCard.vue) retains its native biography button, flip state, Escape handling, and inert hidden face. The shared pointer controller supplies tilt without per-card pointer listeners or reactive updates on every pointer event.
3. [src/components/PageHero.vue](src/components/PageHero.vue) integrates full-bleed court photography, the editable league title, a league link, and [src/components/ShuttleScene.vue](src/components/ShuttleScene.vue). The scene contains an original sixteen-feather model from [src/graphics/shuttle.js](src/graphics/shuttle.js), with pointer response and bounded scroll-driven pose changes. The scene and announcements have separate pause controls. Rendering stops when settled, offscreen, paused, reduced-motion, or hidden; a still of the same model remains when WebGL is unavailable.
4. [src/composables/useViewportMotion.js](src/composables/useViewportMotion.js) stops hero and quote scroll work outside the viewport or in hidden tabs. [src/composables/usePhotoParallax.js](src/composables/usePhotoParallax.js) adds scoped GSAP ScrollTrigger movement to Home photographs, with a gentler range for the portrait and full reversion when motion is disabled, hidden, or unmounted. [src/composables/useMediaQuery.js](src/composables/useMediaQuery.js) combines live system preferences with the administrator's motion setting and tracks page visibility.
5. [src/directives/reveal.js](src/directives/reveal.js) reveals content at 20% visibility with a maximum 240ms sibling stagger. Keyboard focus, reduced motion, disabled site motion, and missing IntersectionObserver support reveal content immediately.
6. [src/components/SiteSkeleton.vue](src/components/SiteSkeleton.vue) mirrors the public header, cinematic hero, photographic story layout, or route-specific content grid during the initial API request. It exposes one loading status, hides decorative placeholders from assistive technology, and pauses shimmer in hidden tabs. Failures still offer a working retry action; background refreshes retain published content.
7. [src/App.vue](src/App.vue) owns the decorative cursor and short route fade/slide transition. The shared header stays mounted, outgoing content becomes inert, route height is held during the change, and keyboard focus moves to the main content. The old simulated progress bar is removed.
8. [src/assets/style.css](src/assets/style.css) defines the photographic public layout, typography, fill reveals, icon shifts, spring-like press/release easing, card glare, shimmer, and route transitions. Motion primarily uses transform, translate, scale, and opacity; will-change is limited to active pointer targets. The public design is scoped separately from administrative styles.

Home uses an editorial photo sequence instead of equal feature cards. About, Team, League, Stats, and the recovery route share the new photographic hero and public typography while retaining their data bindings. Missing leadership portraits use initials rather than invented people. [src/data/photography.js](src/data/photography.js) centralizes image metadata and the footer's expandable credits. Source, license, processing, and original-render details are recorded in [src/assets/README.md](src/assets/README.md).

The native cursor is never hidden. Custom pointer effects are disabled for coarse pointers, reduced motion, forced colors, hidden documents, and the admin interface. The dashboard's Appearance motion switch also disables JavaScript-driven effects. Reduced-motion announcements wrap into a static list instead of hiding offscreen messages. Administrative forms and content editing behavior are unchanged.

[src/App.test.js](src/App.test.js) covers reveal thresholds, preference changes, keyboard recovery, pointer batching/settling, viewport and visibility cleanup, loading/retry states, scene pause/fallback, original model geometry/disposal, and existing public workflows. Use the root README's local Docker Compose override to run the real PostgreSQL/API/nginx stack. After source edits, rebuild the frontend service to update the container-served page:

```sh
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build --wait frontend
```

Names, franchise cities, dates, and other unannounced details start as placeholders and can be replaced in the dashboard. Contact links open the configured email address. Social links remain non-interactive when their URL is blank. All existing public content fields are editable; the Vue page layouts and fixed route paths remain source-controlled.

The dashboard publishes the entire validated document with a revision check. Uploads are stored in PostgreSQL. The root README describes credentials, development startup, persistence, and production security requirements. The Three.js scene loads only on Home and releases its GPU resources on unmount.
