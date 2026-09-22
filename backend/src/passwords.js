import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const deriveKey = promisify(scrypt)

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const digest = await deriveKey(password, salt, 64)
  return `scrypt:${salt}:${digest.toString('hex')}`
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, salt, encoded] = storedHash.split(':')
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(encoded)) return false
  const digest = await deriveKey(password, salt, 64)
  return timingSafeEqual(digest, Buffer.from(encoded, 'hex'))
}