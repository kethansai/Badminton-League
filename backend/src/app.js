import { randomBytes } from 'node:crypto'
import express from 'express'
import session from 'express-session'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import multer from 'multer'
import sharp from 'sharp'
import { z } from 'zod'
import { publishSchema } from './content.js'
import { hashPassword, verifyPassword } from './passwords.js'

const credentialsSchema = z.strictObject({ username: z.string().trim().min(1).max(100), password: z.string().min(1).max(256) })
const passwordSchema = z.strictObject({ currentPassword: z.string().min(1).max(256), newPassword: z.string().min(12).max(256) })
const dummyHash = await hashPassword(randomBytes(32).toString('hex'))

export function createApp({ repository, sessionStore, config, logger = console, loginLimit = 10 }) {
  if (!sessionStore) throw new Error('A persistent session store is required.')
  const app = express()
  app.disable('x-powered-by')
  if (config.trustProxy) app.set('trust proxy', 1)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }))
  app.use(express.json({ limit: '1mb' }))
  app.use((request, response, next) => {
    const origin = request.get('origin')
    if (origin && config.allowedOrigins.includes(origin)) {
      response.set('Access-Control-Allow-Origin', origin)
      response.set('Access-Control-Allow-Credentials', 'true')
      response.set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token')
      response.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.set('Vary', 'Origin')
    }
    if (request.method === 'OPTIONS') return response.sendStatus(204)
    next()
  })
  app.use('/api', (request, response, next) => {
    response.set('Cache-Control', 'no-store')
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const origin = request.get('origin')
      if (origin && !config.allowedOrigins.includes(origin)) {
        return response.status(403).json({ error: 'Request origin is not allowed.' })
      }
    }
    next()
  })
  app.use(session({
    name: 'abpl.sid',
    secret: config.sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { httpOnly: true, sameSite: 'strict', secure: config.secureCookies, maxAge: 8 * 60 * 60 * 1000, path: '/' },
  }))

  function requireAdmin(request, response, next) {
    if (!request.session.adminId) return response.status(401).json({ error: 'Sign in to continue.' })
    next()
  }

  function requireCsrf(request, response, next) {
    if (!request.session.csrfToken || request.get('x-csrf-token') !== request.session.csrfToken) {
      return response.status(403).json({ error: 'Session verification failed. Sign in again.' })
    }
    next()
  }

  function sendSession(request, response) {
    response.json({ username: request.session.username, csrfToken: request.session.csrfToken })
  }

  app.get('/api/health', async (request, response) => {
    await repository.health()
    response.json({ status: 'ok' })
  })
  app.get('/api/content', async (request, response) => response.json(await repository.getContent()))

  app.post('/api/admin/login', rateLimit({
    windowMs: 15 * 60 * 1000, limit: loginLimit, standardHeaders: 'draft-8', legacyHeaders: false,
    skipSuccessfulRequests: true, message: { error: 'Too many sign-in attempts. Try again in 15 minutes.' },
  }), async (request, response) => {
    const credentials = credentialsSchema.parse(request.body)
    const admin = await repository.findAdmin(credentials.username)
    const valid = await verifyPassword(credentials.password, admin?.password_hash || dummyHash)
    if (!admin || !valid) return response.status(401).json({ error: 'Username or password is incorrect.' })
    await new Promise((resolve, reject) => request.session.regenerate((error) => error ? reject(error) : resolve()))
    request.session.adminId = admin.id
    request.session.username = admin.username
    request.session.csrfToken = randomBytes(32).toString('hex')
    await new Promise((resolve, reject) => request.session.save((error) => error ? reject(error) : resolve()))
    sendSession(request, response)
  })

  app.get('/api/admin/session', requireAdmin, sendSession)
  app.get('/api/admin/content', requireAdmin, async (request, response) => response.json(await repository.getContent()))
  app.put('/api/admin/content', requireAdmin, requireCsrf, async (request, response) => {
    const { content, revision } = publishSchema.parse(request.body)
    const saved = await repository.publish(content, revision, request.session.adminId)
    if (!saved) return response.status(409).json({ error: 'Content changed in another session. Your edits are still here. Reload the published version before trying again.' })
    response.json(saved)
  })

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 } })
  app.post('/api/admin/images', requireAdmin, requireCsrf, upload.single('image'), async (request, response) => {
    if (!request.file) return response.status(400).json({ error: 'Choose a PNG, JPEG, or WebP image.' })
    let data
    try {
      const image = sharp(request.file.buffer, { limitInputPixels: 25000000, animated: false })
      const metadata = await image.metadata()
      if (!['png', 'jpeg', 'webp'].includes(metadata.format)) throw new Error('Unsupported image format')
      data = await image.rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer()
    } catch {
      return response.status(400).json({ error: 'Use a valid PNG, JPEG, or WebP image, at most 5 MB and 25 megapixels.' })
    }
    const id = await repository.saveImage(data, request.session.adminId)
    response.status(201).json({ url: `/api/media/${id}` })
  })
  app.get('/api/media/:id', async (request, response) => {
    if (!z.uuid().safeParse(request.params.id).success) return response.status(404).json({ error: 'Image not found.' })
    const image = await repository.getImage(request.params.id)
    if (!image) return response.status(404).json({ error: 'Image not found.' })
    response.set('Cache-Control', 'public, max-age=31536000, immutable').type(image.mime_type).send(image.data)
  })

  app.post('/api/admin/password', requireAdmin, requireCsrf, async (request, response) => {
    const { currentPassword, newPassword } = passwordSchema.parse(request.body)
    const admin = await repository.findAdmin(request.session.username)
    if (!admin || !(await verifyPassword(currentPassword, admin.password_hash))) return response.status(401).json({ error: 'Current password is incorrect.' })
    await repository.changePassword(admin.id, await hashPassword(newPassword))
    await new Promise((resolve, reject) => request.session.destroy((error) => error ? reject(error) : resolve()))
    response.clearCookie('abpl.sid', { path: '/', httpOnly: true, sameSite: 'strict', secure: config.secureCookies }).sendStatus(204)
  })
  app.post('/api/admin/logout', requireAdmin, requireCsrf, async (request, response) => {
    await new Promise((resolve, reject) => request.session.destroy((error) => error ? reject(error) : resolve()))
    response.clearCookie('abpl.sid', { path: '/', httpOnly: true, sameSite: 'strict', secure: config.secureCookies }).sendStatus(204)
  })

  app.use((request, response) => response.status(404).json({ error: 'Not found.' }))
  app.use((error, request, response, next) => {
    if (response.headersSent) return next(error)
    if (error instanceof z.ZodError) {
      return response.status(400).json({ error: 'Check the highlighted fields.', issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })) })
    }
    if (error instanceof multer.MulterError || error.type === 'entity.too.large') return response.status(413).json({ error: 'Upload or request is too large. Images must be at most 5 MB.' })
    if (error.type === 'entity.parse.failed') return response.status(400).json({ error: 'Invalid JSON.' })
    logger.error('Request failed', { method: request.method, path: request.path, code: error.code || 'INTERNAL_ERROR' })
    response.status(500).json({ error: 'Service is temporarily unavailable. Please try again.' })
  })
  return app
}