# ABPL Frontend

A Vue 3 frontend for the American Badminton Premier League website and its private content dashboard. Published content is loaded from the PostgreSQL-backed API in `../backend`; no hardcoded fallback silently replaces saved content.

## Requirements

- Node.js 22.12+ or 24 and npm.
- The backend API running on port 3300, normally through the root Docker Compose stack.
- JavaScript enabled in the browser. The original Google Fonts stylesheet is retained; local fallback fonts work without it.

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

The original navy, gold, maroon, typography, page content, and primary animations are retained. Team cards now use native buttons with keyboard support, and closed mobile navigation is removed from keyboard access. Event listeners, observers, timers, and animation frames are cleaned up when their components unmount.

Names, franchise cities, dates, and other unannounced details start as placeholders and can be replaced in the dashboard. Contact links open the configured email address. Social links remain non-interactive when their URL is blank. All existing public content fields are editable; the Vue page layouts and fixed route paths remain source-controlled.

The dashboard publishes the entire validated document with a revision check. Uploads are stored in PostgreSQL. The root README describes credentials, development startup, persistence, and production security requirements. Unused Three.js experiments are not bundled.
