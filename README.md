# ABPL Content Management

The application has a Vue 3 frontend, an Express backend, and a PostgreSQL database. Public content is loaded from the database. Administrators can edit all existing page content, navigation labels and visibility, ticker messages, footer links, contact details, metadata, images, colors, fonts, and animation settings.

## Run With Docker

From this directory on a machine with Docker Compose:

```sh
docker compose up -d --build --wait
```

On this Windows machine, Docker runs in WSL:

```powershell
wsl.exe --exec docker compose -f /mnt/c/Users/vemurikethan/Desktop/badminton/docker-compose.yml up -d --build --wait
```

- Public website: http://localhost:8080/
- Administrator sign-in: http://localhost:8080/admin-login
- Protected dashboard: http://localhost:8080/admin
- Initial username: `admin`
- Initial password: `admin@123`

There is no administrator link in public navigation or the footer. The login fields are not prefilled. A direct visit to `/admin` requires an authenticated session; the API independently checks authorization on every administrative request.

The supplied defaults are for local development only. Services bind to loopback, not all network interfaces. Before exposing the site, change the administrator password in the Account screen, use a strong random `SESSION_SECRET`, change the database password, configure HTTPS, set `COOKIE_SECURE=true`, and set `ALLOWED_ORIGINS` to your exact public origin. The default secret and passwords are not suitable for deployment. A hidden route is not an access-control mechanism.

## Configuration

Compose accepts the following environment overrides, including from a root `.env` that you manage locally. The repository does not contain an environment file; the defaults below work locally.

| Variable | Local default or purpose |
| --- | --- |
| `WEB_PORT` | `8080` |
| `API_PORT` | `3300` |
| `POSTGRES_PORT` | `35432` |
| `POSTGRES_DB` / `POSTGRES_USER` | `abpl` |
| `POSTGRES_PASSWORD` | `abpl-local-change-me` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `admin@123`, initial seed only |
| `SESSION_SECRET` | Development-only value in Compose; replace before deployment |
| `COOKIE_SECURE` | `false` locally; `true` with HTTPS |
| `ALLOWED_ORIGINS` | localhost and 127.0.0.1 on ports 8080 and 5173 |

If changing `WEB_PORT` or Vite's port, update `ALLOWED_ORIGINS` to include the actual origin as well.

## Editing and Publishing

The dashboard has Site Settings, Appearance, Home, About, Team, League, Stats, Not Found, and Account sections. Repeating items support adding, reordering, and removing. Navigation has fixed routes, with editable labels, order, and visibility. Images can be uploaded or referenced by an HTTPS URL. Clearing the crest URL restores the bundled original crest.

Edits are kept in the current browser tab until **Publish Changes** succeeds. Publishing validates and atomically saves the whole site document. A revision check rejects stale saves from another tab rather than silently overwriting them. Errors preserve the current edits; reloading the published content explicitly discards them after confirmation. Unsaved edits are not durable after a tab is closed. Public pages load the latest content on a new visit, route navigation, or when a tab regains focus. There is no server-pushed live update or unpublished preview.

Uploaded PNG, JPEG, and WebP images are decoded, resized, stripped of metadata, and stored as WebP in PostgreSQL. Upload limits are 5 MB and 25 megapixels. SVG and other executable formats are rejected. Removing an image reference does not delete the stored image, so an existing page or open editing session is not left with a broken reference.

The editor manages the existing site's content and presentation settings. It does not execute custom HTML, JavaScript, SQL, or arbitrary templates, and it is not a drag-and-drop layout builder. The existing page layouts and URL structure remain in Vue source.

## Persistence

PostgreSQL stores site content, uploaded images, hashed administrator passwords, and sessions in the named `postgres_data` volume. Initial setup creates the schema and seeds the current site and administrator only when they do not already exist. Restarting or rebuilding containers does not replace edits or reset passwords. Changing `ADMIN_PASSWORD` after initial setup does not reset an existing account; use the Account screen.

`docker compose down` stops and removes the containers while retaining the database volume. **Do not use `docker compose down -v` unless you intend to permanently delete the database and all uploaded images.** Back up PostgreSQL before maintenance or deployment. This project does not configure automated backups.

## Local Development

Use Node.js 22.12+ or Node.js 24 and npm. Start the containerized database and API:

```sh
docker compose up -d --build --wait db backend
npm --prefix frontend ci
npm --prefix frontend run dev
```

Use the WSL-prefixed Compose command on this Windows machine. Vite proxies `/api` to `http://127.0.0.1:3300`; `API_PROXY_TARGET` can override it. To work on backend source without rebuilding Docker, run only the database service, provide the variables documented in `backend/README.md`, install backend dependencies, and run `npm --prefix backend run dev`.

## Verification

```sh
npm --prefix backend ci
npm --prefix backend test
npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend run build
```

The PostgreSQL integration test runs when `TEST_DATABASE_URL` is set to a test-capable database connection. It creates a uniquely named temporary schema, verifies persistent content, images, sessions, and non-destructive initialization, then removes only that schema. The database user must be able to create schemas. Without the variable, that test is explicitly skipped; other backend tests use an in-memory repository and session store only inside tests.

```powershell
$env:TEST_DATABASE_URL = 'postgres://abpl:abpl-local-change-me@127.0.0.1:35432/abpl'
npm --prefix backend test
Remove-Item Env:TEST_DATABASE_URL
```

The production application always uses PostgreSQL, not the test stores. Frontend tests cover public routes, accessibility state, admin route protection, complete field coverage, publishing, conflicts, and unsaved edits.