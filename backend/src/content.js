import { readFile } from 'node:fs/promises'
import { z } from 'zod'

const text = z.string().trim().max(12000)
const title = z.string().trim().min(1).max(200)
const identifier = z.string().regex(/^[a-zA-Z0-9-]{1,80}$/)
const imageUrl = z.string().max(2048).refine((value) => {
  if (!value || /^\/api\/media\/[a-f0-9-]{36}$/.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}, 'Use an HTTPS image URL or an uploaded image.')
const socialUrl = z.string().max(2048).refine((value) => {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}, 'Use an HTTPS URL.')

function items(schema, maximum = 60) {
  return z.array(schema).max(maximum).refine((values) => new Set(values.map((value) => value.id)).size === values.length, 'Item IDs must be unique.')
}

const commonPage = {
  metaTitle: title,
  metaDescription: z.string().trim().min(1).max(500),
  heroTitle: title,
  heroIntro: text,
  ctaTitle: title,
  ctaLabel: title,
  ctaEnabled: z.boolean(),
}
const storyBlock = z.strictObject({ label: text, title, body: text })
const formatItem = z.strictObject({ id: identifier, title, description: text })

export const contentSchema = z.strictObject({
  site: z.strictObject({
    name: title,
    accentName: title,
    logoUrl: imageUrl,
    logoAlt: title,
    contactEmail: z.email().max(254),
    navigation: items(z.strictObject({
      id: z.enum(['home', 'about', 'team', 'league', 'stats']),
      label: title,
      visible: z.boolean(),
    }), 5).length(5),
    announcements: items(z.strictObject({ id: identifier, text: title }), 12),
    footer: z.strictObject({
      tagline: text,
      exploreTitle: title,
      connectTitle: title,
      copyright: title,
      established: title,
      socialLinks: items(z.strictObject({ id: identifier, label: title, url: socialUrl }), 20),
    }),
  }),
  appearance: z.strictObject({
    colors: z.strictObject(Object.fromEntries([
      'navy950', 'navy900', 'navy800', 'navy700', 'gold500', 'gold400', 'gold300',
      'maroon600', 'maroon500', 'cream100', 'cream050',
    ].map((name) => [name, z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex color.')]))),
    displayFont: z.enum(['Anton', 'Barlow', 'Barlow Condensed']),
    bodyFont: z.enum(['Barlow', 'Barlow Condensed']),
    utilityFont: z.enum(['Barlow Condensed', 'Barlow']),
    motionEnabled: z.boolean(),
  }),
  pages: z.strictObject({
    home: z.strictObject({
      ...commonPage, tagline: text, sectionLabel: text, sectionTitle: title, sectionVisible: z.boolean(),
      cards: items(z.strictObject({ id: identifier, tag: text, title, description: text })),
    }),
    about: z.strictObject({ ...commonPage, quote: text, mission: storyBlock, vision: storyBlock, sectionVisible: z.boolean() }),
    team: z.strictObject({
      ...commonPage, sectionTitle: title, note: text, emptyMessage: title,
      members: items(z.strictObject({ id: identifier, tag: text, name: text, title, bio: text, imageUrl, imageAlt: text })),
    }),
    league: z.strictObject({
      ...commonPage, storyLabel: text, storyTitle: title, storyQuote: text, storyBody: text, crestAlt: title,
      storyVisible: z.boolean(), formatLabel: text, formatTitle: title, items: items(formatItem), note: text,
    }),
    stats: z.strictObject({
      ...commonPage, sectionLabel: text, sectionTitle: title, emptyMessage: title,
      franchises: items(z.strictObject({ id: identifier, tag: text, city: title, team: text, imageUrl, imageAlt: text })),
      detailsLabel: text, detailsTitle: title, details: items(formatItem), note: text,
    }),
    notFound: z.strictObject({ metaTitle: title, metaDescription: text, heroTitle: title, heroIntro: text, linkLabel: title }),
  }),
})

export const publishSchema = z.strictObject({ content: contentSchema, revision: z.number().int().positive() })

export async function loadSeed() {
  return contentSchema.parse(JSON.parse(await readFile(new URL('./seed.json', import.meta.url), 'utf8')))
}