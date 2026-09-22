import { readFile } from 'node:fs/promises'
import pg from 'pg'
import { loadSeed } from './content.js'
import { hashPassword } from './passwords.js'

export function createPool(connectionString) {
  return new pg.Pool({ connectionString, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 })
}

export async function initializeDatabase(pool, username, password) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtext('abpl-schema-v1'))")
    await client.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'))
    const existingAdmin = await client.query('SELECT id FROM admins WHERE username = $1', [username])
    if (!existingAdmin.rowCount) {
      await client.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', [username, await hashPassword(password)])
    }
    await client.query('INSERT INTO site_content (id, document) VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [await loadSeed()])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function contentResult(row) {
  return { content: row.document, revision: row.revision, updatedAt: row.updated_at }
}

export function createRepository(pool) {
  return {
    async health() {
      await pool.query('SELECT 1')
    },
    async findAdmin(username) {
      const result = await pool.query('SELECT id, username, password_hash FROM admins WHERE username = $1', [username])
      return result.rows[0]
    },
    async getContent() {
      const result = await pool.query('SELECT document, revision, updated_at FROM site_content WHERE id = 1')
      if (!result.rows[0]) throw new Error('Site content is not initialized.')
      return contentResult(result.rows[0])
    },
    async publish(content, revision, adminId) {
      const result = await pool.query(
        'UPDATE site_content SET document = $1, revision = revision + 1, updated_at = now(), updated_by = $2 WHERE id = 1 AND revision = $3 RETURNING document, revision, updated_at',
        [content, adminId, revision],
      )
      return result.rows[0] ? contentResult(result.rows[0]) : null
    },
    async saveImage(data, adminId) {
      const result = await pool.query("INSERT INTO media (data, mime_type, created_by) VALUES ($1, 'image/webp', $2) RETURNING id", [data, adminId])
      return result.rows[0].id
    },
    async getImage(id) {
      const result = await pool.query('SELECT data, mime_type FROM media WHERE id = $1', [id])
      return result.rows[0]
    },
    async changePassword(adminId, passwordHash) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [passwordHash, adminId])
        await client.query("DELETE FROM sessions WHERE sess->>'adminId' = $1", [adminId])
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
  }
}