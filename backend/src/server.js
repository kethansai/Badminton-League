import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import { createApp } from './app.js'
import { createPool, createRepository, initializeDatabase } from './database.js'

const port = Number(process.env.PORT || 3000)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.')
if (!process.env.DATABASE_URL && !process.env.PGHOST) throw new Error('DATABASE_URL or PostgreSQL connection variables are required.')
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.')
const config = {
  sessionSecret: process.env.SESSION_SECRET,
  secureCookies: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAME_SITE || (process.env.COOKIE_SECURE === 'true' ? 'none' : 'strict'),
  trustProxy: process.env.TRUST_PROXY === 'true',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map((origin) => new URL(origin.trim()).origin),
}
const pool = createPool(process.env.DATABASE_URL)
pool.on('error', (error) => console.error('Database pool error:', error.code || 'UNKNOWN'))
await initializeDatabase(pool, process.env.ADMIN_USERNAME || 'admin', process.env.ADMIN_PASSWORD || 'admin@123')
const PgStore = connectPgSimple(session)
const sessionStore = new PgStore({ pool, tableName: 'sessions', createTableIfMissing: false })
const app = createApp({ repository: createRepository(pool), sessionStore, config })
const server = app.listen(port, '0.0.0.0', () => console.log(`ABPL API listening on port ${port}`))

function shutdown() {
  server.close(async () => {
    sessionStore.close()
    await pool.end()
  })
}
process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)