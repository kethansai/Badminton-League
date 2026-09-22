import assert from 'node:assert/strict'
import test from 'node:test'
import { contentSchema, loadSeed, publishSchema } from '../src/content.js'

test('seed represents all five pages and their original placeholders', async () => {
  const content = await loadSeed()
  assert.equal(content.site.navigation.length, 5)
  assert.equal(content.pages.team.members.length, 6)
  assert.equal(content.pages.stats.franchises.length, 8)
  assert.equal(content.pages.home.heroTitle.replace('\n', ' '), 'American Badminton Premier League')
  assert.equal(publishSchema.safeParse({ content, revision: 1 }).success, true)
})

test('unsafe links, duplicate items, invalid colors, and unknown fields are rejected', async () => {
  for (const mutate of [
    (content) => { content.site.logoUrl = 'javascript:alert(1)' },
    (content) => { content.site.footer.socialLinks[0].url = 'data:text/html,unsafe' },
    (content) => { content.appearance.colors.gold400 = 'red;display:none' },
    (content) => { content.pages.team.members[1].id = content.pages.team.members[0].id },
    (content) => { content.site.navigation[1].id = 'admin' },
    (content) => { content.privatePassword = 'not-public' },
  ]) {
    const content = await loadSeed()
    mutate(content)
    assert.equal(contentSchema.safeParse(content).success, false)
  }
})

test('HTTPS and uploaded images are accepted while empty collections remain valid', async () => {
  const content = await loadSeed()
  content.site.logoUrl = '/api/media/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
  content.site.footer.socialLinks[0].url = 'https://www.instagram.com/abpl/'
  content.pages.team.members = []
  content.pages.stats.franchises = []
  assert.equal(contentSchema.safeParse(content).success, true)
})