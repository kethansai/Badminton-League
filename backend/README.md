# ABPL Backend

Express 5 API using PostgreSQL through `pg`. Runtime entry point: `src/server.js`. The root Docker Compose configuration starts this service with health checks and an externally configured database.

## Configuration

Use Node.js 22.12+ or 24. Install dependencies with `npm ci` inside this directory. `npm run dev` and `npm start` load an optional local `.env` that you manage yourself. No environment file is included in the repository.

For local source development against the Compose database, configure:

```dotenv
PORT=3300
DATABASE_URL=postgres://abpl:abpl-local-change-me@127.0.0.1:35432/abpl
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@123
SESSION_SECRET=local-development-only-change-this-session-secret-before-deploying
COOKIE_SECURE=false
COOKIE_SAME_SITE=strict
TRUST_PROXY=false
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173
```

The server requires `DATABASE_URL` or PostgreSQL connection variables (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`), plus a `SESSION_SECRET` of at least 32 characters.

`ADMIN_USERNAME` and `ADMIN_PASSWORD` are used only to seed a missing account. Defaults are `admin` and `admin@123`, for local development. Existing passwords are never reset on startup. `COOKIE_SECURE=true` requires HTTPS. Use `COOKIE_SAME_SITE=none` when the frontend and API are separate services; it requires `COOKIE_SECURE=true`. Enable `TRUST_PROXY=true` only behind the trusted deployment proxy. When the frontend is deployed separately, set `ALLOWED_ORIGINS` to its exact HTTPS origin; the API provides credentialed CORS responses.

## API

| Method | Route | Access |
| --- | --- | --- |
| GET | `/api/health` | Public database health |
| GET | `/api/content` | Public published site document |
| GET | `/api/media/:id` | Public validated raster image |
| POST | `/api/admin/login` | Username and password; rate limited |
| GET | `/api/admin/session` | Authenticated session and CSRF token |
| GET | `/api/admin/content` | Authenticated editor document |
| PUT | `/api/admin/content` | Session, CSRF token, validated content and revision |
| POST | `/api/admin/images` | Session, CSRF token, multipart `image` field |
| POST | `/api/admin/password` | Session, CSRF token, current and new passwords |
| POST | `/api/admin/logout` | Session and CSRF token |

Responses use JSON except images and successful logout/password changes. Mutations require the `X-CSRF-Token` returned by login/session retrieval. Published content uses `{ content, revision, updatedAt }`; updates accept only `{ content, revision }`. Stale revisions return HTTP 409. Validation failures return HTTP 400 with field paths. Unauthenticated requests return HTTP 401. There is no static-file serving from this service.

## Data and Security

`src/schema.sql` defines administrator, site document, session, and media tables. Initialization runs in a transaction with an advisory lock. Content is versioned JSONB with a strict Zod schema and atomic optimistic-concurrency updates. Queries use parameters for user data. Passwords use salted `scrypt`; session cookies are HTTP-only and SameSite Strict. Password changes invalidate all sessions for that account. The production session store is PostgreSQL-backed. Login throttling is per API process; distributed deployments should add an edge or shared-store rate limit.

Uploaded raster files are decoded and re-encoded by the patched `sharp` package before storage. Original filenames and executable uploads are not served. Errors do not expose database details or stack traces. Input content is plain text, with no raw HTML rendering. HTTPS image and social URLs are validated; arbitrary CSS is not accepted.

Run `npm test` for schema and HTTP tests. Set `TEST_DATABASE_URL` to run the isolated PostgreSQL integration test as well. See the root README for deployment precautions, persistence, and backup guidance.