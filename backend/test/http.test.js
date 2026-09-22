import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import session from 'express-session'
import request from 'supertest'
import sharp from 'sharp'
import { createApp } from '../src/app.js'
import { loadSeed } from '../src/content.js'
import { hashPassword, verifyPassword } from '../src/passwords.js'

const passwordHash = await hashPassword('admin@123')
let repository
let app
let document
let sessionStore

beforeEach(async () => {
  document = { content: await loadSeed(), revision: 1, updatedAt: new Date().toISOString() }
  const images = new Map()
  const admin = { id: randomUUID(), username: 'admin', password_hash: passwordHash }
  sessionStore = new session.MemoryStore()
  repository = {
    health: async () => {},
    findAdmin: async (username) => username === 'admin' ? admin : undefined,
    getContent: async () => structuredClone(document),
    publish: async (content, revision) => {
      if (revision !== document.revision) return null
      document = { content, revision: revision + 1, updatedAt: new Date().toISOString() }
      return structuredClone(document)
    },
    saveImage: async (data) => {
      const id = randomUUID()
      images.set(id, { data, mime_type: 'image/webp' })
      return id
    },
    getImage: async (id) => images.get(id),
    changePassword: async (id, hash) => {
      admin.password_hash = hash
      sessionStore.clear()
    },
  }
  app = createApp({ repository, sessionStore, config: { sessionSecret: 'test-secret-at-least-thirty-two-characters', secureCookies: false, allowedOrigins: ['http://localhost:8080'] }, logger: { error() {} } })
})

async function signIn(agent = request.agent(app)) {
  const result = await agent.post('/api/admin/login').send({ username: 'admin', password: 'admin@123' }).expect(200)
  return { agent, csrf: result.body.csrfToken, result }
}

test('public content contains the editable site but never credentials or session data', async () => {
  const response = await request(app).get('/api/content').expect(200)
  assert.equal(response.body.content.pages.team.members.length, 6)
  assert.equal(JSON.stringify(response.body).includes('admin@123'), false)
  assert.equal(response.headers['cache-control'], 'no-store')
  await request(app).get('/api/admin/content').expect(401)
  await request(app).put('/api/admin/content').send(document).expect(401)
  await request(app).post('/api/admin/images').expect(401)
})

test('login checks credentials and creates an HTTP-only SameSite session without exposing hashes', async () => {
  await request(app).post('/api/admin/login').send({ username: 'admin', password: 'wrong' }).expect(401)
  await request(app).post('/api/admin/login').send({ username: 'missing', password: 'admin@123' }).expect(401)
  const { agent, result, csrf } = await signIn()
  assert.match(result.headers['set-cookie'][0], /HttpOnly/)
  assert.match(result.headers['set-cookie'][0], /SameSite=Strict/)
  assert.equal(csrf.length, 64)
  assert.deepEqual(Object.keys(result.body).sort(), ['csrfToken', 'username'])
  await agent.get('/api/admin/session').expect(200)
  await agent.post('/api/admin/logout').set('x-csrf-token', csrf).expect(204)
  await agent.get('/api/admin/session').expect(401)
})

test('publishing requires CSRF, validates content, updates public data, and detects stale revisions', async () => {
  const { agent, csrf } = await signIn()
  const changed = structuredClone(document)
  changed.content.pages.home.heroTitle = 'Updated League'
  await agent.put('/api/admin/content').send(changed).expect(403)
  await agent.put('/api/admin/content').set('x-csrf-token', csrf).set('Origin', 'https://evil.example').send(changed).expect(403)
  const saved = await agent.put('/api/admin/content').set('x-csrf-token', csrf).send({ content: changed.content, revision: changed.revision }).expect(200)
  assert.equal(saved.body.revision, 2)
  const published = await request(app).get('/api/content').expect(200)
  assert.equal(published.body.content.pages.home.heroTitle, 'Updated League')
  await agent.put('/api/admin/content').set('x-csrf-token', csrf).send({ content: changed.content, revision: 1 }).expect(409)
  changed.content.site.logoUrl = 'javascript:alert(1)'
  const invalid = await agent.put('/api/admin/content').set('x-csrf-token', csrf).send({ content: changed.content, revision: 2 }).expect(400)
  assert.equal(invalid.body.issues[0].path, 'content.site.logoUrl')
})

test('uploads decode and re-encode raster images and reject executable files', async () => {
  const { agent, csrf } = await signIn()
  await agent.post('/api/admin/images').set('x-csrf-token', csrf).attach('image', Buffer.from('<svg onload="alert(1)"></svg>'), 'image.svg').expect(400)
  const png = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#d4af61' } }).png().toBuffer()
  const upload = await agent.post('/api/admin/images').set('x-csrf-token', csrf).attach('image', png, 'image.png').expect(201)
  const image = await request(app).get(upload.body.url).expect(200)
  assert.match(image.headers['content-type'], /^image\/webp/)
  await request(app).get('/api/media/not-an-id').expect(404)
  await request(app).get(`/api/media/${randomUUID()}`).expect(404)
})

test('passwords are salted hashes and password changes invalidate existing sessions', async () => {
  assert.notEqual(passwordHash, await hashPassword('admin@123'))
  assert.equal(await verifyPassword('admin@123', passwordHash), true)
  assert.equal(await verifyPassword('wrong', passwordHash), false)
  const first = await signIn()
  const second = await signIn()
  await first.agent.post('/api/admin/password').set('x-csrf-token', first.csrf).send({ currentPassword: 'admin@123', newPassword: 'new-password-1234' }).expect(204)
  await second.agent.get('/api/admin/session').expect(401)
  await request(app).post('/api/admin/login').send({ username: 'admin', password: 'admin@123' }).expect(401)
  await request(app).post('/api/admin/login').send({ username: 'admin', password: 'new-password-1234' }).expect(200)
})

test('unexpected GET failures are sanitized and private files are never served', async () => {
  repository.getContent = async () => { throw new Error('postgres://private:password@database') }
  const response = await request(app).get('/api/content').expect(500)
  assert.equal(response.body.error, 'Service is temporarily unavailable. Please try again.')
  for (const path of ['/src/seed.json', '/package.json', '/.env', '/api/missing']) await request(app).get(path).expect(404)
})

test('repeated failed login attempts are rate limited', async () => {
  const limited = createApp({ repository, sessionStore, loginLimit: 2, config: { sessionSecret: 'test-secret-at-least-thirty-two-characters', allowedOrigins: [] }, logger: { error() {} } })
  await request(limited).post('/api/admin/login').send({ username: 'admin', password: 'wrong' }).expect(401)
  await request(limited).post('/api/admin/login').send({ username: 'admin', password: 'wrong' }).expect(401)
  await request(limited).post('/api/admin/login').send({ username: 'admin', password: 'wrong' }).expect(429)
})