const field = (key, label, options = {}) => ({ key, label, type: 'text', ...options })
const title = (key, label) => field(key, label, { required: true, maxLength: 200 })
const text = (key, label, options = {}) => field(key, label, { type: 'textarea', maxLength: 12000, ...options })
const toggle = (key, label) => field(key, label, { type: 'checkbox' })
const group = (key, label, fields) => ({ key, label, type: 'group', fields })
const collection = (key, label, fields, options = {}) => ({ key, label, type: 'collection', fields, max: 60, ...options })
const image = (key, label) => field(key, label, { type: 'image', maxLength: 2048 })

const commonPage = [
  text('heroTitle', 'Headline', { required: true, maxLength: 200, rows: 2 }),
  text('heroIntro', 'Introduction'),
  group(null, 'Search and Sharing', [
    title('metaTitle', 'Page title'),
    text('metaDescription', 'Page description', { required: true, maxLength: 500, rows: 3 }),
  ]),
  group(null, 'Contact Banner', [toggle('ctaEnabled', 'Show contact banner'), title('ctaTitle', 'Banner heading'), title('ctaLabel', 'Contact button label')]),
]
const formatFields = [title('title', 'Title'), text('description', 'Description')]
const storyFields = [field('label', 'Label'), title('title', 'Heading'), text('body', 'Body')]

export const editorSections = [
  {
    id: 'site', label: 'Site Settings', path: 'site',
    fields: [
      title('name', 'Brand name'), title('accentName', 'Brand subtitle'),
      image('logoUrl', 'Crest image'), title('logoAlt', 'Crest alternative text'),
      field('contactEmail', 'Contact email', { type: 'email', required: true, maxLength: 254 }),
      collection('navigation', 'Navigation', [title('label', 'Link label'), toggle('visible', 'Show in navigation')], { fixed: true, max: 5 }),
      collection('announcements', 'Announcement Ticker', [title('text', 'Announcement')], { max: 12 }),
      group('footer', 'Footer', [
        text('tagline', 'Footer tagline', { rows: 2 }), title('exploreTitle', 'Explore heading'), title('connectTitle', 'Connect heading'),
        title('copyright', 'Copyright text'), title('established', 'Established label'),
        collection('socialLinks', 'Social Links', [title('label', 'Social label'), field('url', 'Social URL', { type: 'url', maxLength: 2048 })], { max: 20 }),
      ]),
    ],
  },
  {
    id: 'appearance', label: 'Appearance', path: 'appearance',
    fields: [
      toggle('motionEnabled', 'Enable animations'),
      field('displayFont', 'Heading font', { type: 'select', options: ['Anton', 'Barlow', 'Barlow Condensed'] }),
      field('bodyFont', 'Body font', { type: 'select', options: ['Barlow', 'Barlow Condensed'] }),
      field('utilityFont', 'Navigation and label font', { type: 'select', options: ['Barlow Condensed', 'Barlow'] }),
      group('colors', 'Colors', [
        ['navy950', 'Dark background'], ['navy900', 'Page background'], ['navy800', 'Card background'], ['navy700', 'Secondary surface'],
        ['gold500', 'Accent rules'], ['gold400', 'Primary accent'], ['gold300', 'Light accent'],
        ['maroon600', 'Banner background'], ['maroon500', 'Status label'], ['cream100', 'Body text'], ['cream050', 'Heading text'],
      ].map(([key, label]) => field(key, label, { type: 'color', required: true, maxLength: 7 }))),
    ],
  },
  {
    id: 'home', label: 'Home', path: 'pages.home',
    fields: [...commonPage, text('tagline', 'Tagline', { rows: 2 }), group(null, 'Season Preview', [
      toggle('sectionVisible', 'Show season preview'), field('sectionLabel', 'Section label'), title('sectionTitle', 'Section heading'),
      collection('cards', 'Preview Cards', [field('tag', 'Status label'), ...formatFields]),
    ])],
  },
  {
    id: 'about', label: 'About', path: 'pages.about',
    fields: [...commonPage, text('quote', 'Pull quote'), toggle('sectionVisible', 'Show mission and vision'), group('mission', 'Mission', storyFields), group('vision', 'Vision', storyFields)],
  },
  {
    id: 'team', label: 'Team', path: 'pages.team',
    fields: [...commonPage, title('sectionTitle', 'Team heading'), collection('members', 'Leadership Team', [
      field('name', 'Name'), title('title', 'Role'), field('tag', 'Status label'), text('bio', 'Biography'), image('imageUrl', 'Portrait'), field('imageAlt', 'Portrait alternative text'),
    ]), text('note', 'Team note'), title('emptyMessage', 'Empty team message')],
  },
  {
    id: 'league', label: 'League', path: 'pages.league',
    fields: [...commonPage, group(null, 'Founding Story', [
      toggle('storyVisible', 'Show founding story'), field('storyLabel', 'Story label'), title('storyTitle', 'Story heading'),
      text('storyQuote', 'Story quote'), text('storyBody', 'Story body'), title('crestAlt', 'Story crest alternative text'),
    ]), group(null, 'League Format', [field('formatLabel', 'Format label'), title('formatTitle', 'Format heading'), collection('items', 'Format Items', formatFields), text('note', 'League note')])],
  },
  {
    id: 'stats', label: 'Stats', path: 'pages.stats',
    fields: [...commonPage, field('sectionLabel', 'Franchise label'), title('sectionTitle', 'Franchise heading'), collection('franchises', 'Franchises', [
      title('city', 'City'), field('team', 'Team name'), field('tag', 'Status label'), image('imageUrl', 'Team image'), field('imageAlt', 'Team image alternative text'),
    ]), title('emptyMessage', 'Empty franchise message'), group(null, 'Season Details', [
      field('detailsLabel', 'Details label'), title('detailsTitle', 'Details heading'), collection('details', 'Season Details', formatFields), text('note', 'Season note'),
    ])],
  },
  {
    id: 'notFound', label: 'Not Found', path: 'pages.notFound',
    fields: [title('heroTitle', 'Headline'), text('heroIntro', 'Message'), title('linkLabel', 'Home link label'), title('metaTitle', 'Page title'), text('metaDescription', 'Page description')],
  },
]

export function getSectionValue(content, section) {
  return section.path.split('.').reduce((value, key) => value[key], content)
}

export function makeCollectionItem(fields) {
  const item = { id: crypto.randomUUID() }
  for (const entry of fields) {
    if (entry.type === 'group') {
      const nested = makeCollectionItem(entry.fields)
      delete nested.id
      if (entry.key) item[entry.key] = nested
      else Object.assign(item, nested)
    } else {
      item[entry.key] = entry.type === 'checkbox' ? true : entry.type === 'collection' ? [] : entry.options?.[0] || ''
    }
  }
  return item
}

export function fieldId(path) {
  return `content-${path.replaceAll('.', '-')}`
}