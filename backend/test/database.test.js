import assert from 'node:assert/strict'
import test from 'node:test'
import { randomUUID } from 'node:crypto'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import request from 'supertest'
import { createPool, createRepository, initializeDatabase } from '../src/database.js'
import { createApp } from '../src/app.js'

test('PostgreSQL preserves content, images, and sessions across restarts without reseeding over edits', { skip: !process.env.TEST_DATABASE_URL }, async () => {
  const schema = `abpl_test_${randomUUID().replaceAll('-', '')}`
  const owner = createPool(process.env.TEST_DATABASE_URL)
  const connection = new URL(process.env.TEST_DATABASE_URL)
  connection.searchParams.set('options', `-c search_path=${schema},public`)
  let pool
  let store
  try {
    await owner.query(`CREATE SCHEMA ${schema}`)
    pool = createPool(connection.toString())
    await initializeDatabase(pool, 'admin', 'admin@123')
    const PgStore = connectPgSimple(session)
    store = new PgStore({ pool, tableName: 'sessions', schemaName: schema, pruneSessionInterval: false })
    const config = { sessionSecret: 'database-test-secret-at-least-32-characters', allowedOrigins: [] }
    let repository = createRepository(pool)
    let app = createApp({ repository, sessionStore: store, config })
    const login = await request(app).post('/api/admin/login').send({ username: 'admin', password: 'admin@123' }).expect(200)
    const cookie = login.headers['set-cookie'][0].split(';')[0]
    const snapshot = await repository.getContent()
    snapshot.content.pages.home.heroTitle = 'Persistent league headline'
    const admin = await repository.findAdmin('admin')
    assert.notEqual(admin.password_hash, 'admin@123')
    const published = await repository.publish(snapshot.content, snapshot.revision, admin.id)
    assert.equal(published.revision, 2)
    assert.equal(await repository.publish(snapshot.content, snapshot.revision, admin.id), null)
    const imageId = await repository.saveImage(Buffer.from('image-test-bytes'), admin.id)
    store.close()
    await pool.end()
    pool = createPool(connection.toString())
    await initializeDatabase(pool, 'admin', 'not-the-same-password')
    repository = createRepository(pool)
    store = new PgStore({ pool, tableName: 'sessions', schemaName: schema, pruneSessionInterval: false })
    app = createApp({ repository, sessionStore: store, config })
    await request(app).get('/api/admin/session').set('Cookie', cookie).expect(200)
    assert.equal((await repository.getContent()).content.pages.home.heroTitle, 'Persistent league headline')
    assert.equal((await repository.getImage(imageId)).data.toString(), 'image-test-bytes')
    await request(app).post('/api/admin/login').send({ username: 'admin', password: 'admin@123' }).expect(200)
  } finally {
    store?.close()
    await pool?.end()
    await owner.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`)
    await owner.end()
  }
})