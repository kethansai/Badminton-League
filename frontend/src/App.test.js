import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { createAppRouter } from './router.js'
import seed from '../../backend/src/seed.json'
import { setSiteContent } from './stores/content.js'

let wrapper
let mediaQueries
let observers
let animationFrames
let nextFrameId

function getMediaQuery(query) {
  if (!mediaQueries.has(query)) {
    const listeners = new Set()
    mediaQueries.set(query, {
      matches: query === '(pointer: fine)',
      media: query,
      listeners,
      addEventListener: vi.fn((event, listener) => listeners.add(listener)),
      removeEventListener: vi.fn((event, listener) => listeners.delete(listener)),
    })
  }
  return mediaQueries.get(query)
}

async function setMediaQuery(query, matches) {
  const mediaQuery = getMediaQuery(query)
  mediaQuery.matches = matches
  mediaQuery.listeners.forEach((listener) => listener(mediaQuery))
  await nextTick()
}

async function renderRoute(path = '/') {
  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  await router.isReady()
  wrapper = mount(App, { attachTo: document.body, global: { plugins: [router] } })
  await flushPromises()
  return router
}

beforeEach(() => {
  const snapshot = { content: structuredClone(seed), revision: 1, updatedAt: new Date().toISOString() }
  setSiteContent(snapshot)
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => structuredClone(snapshot) })))
  mediaQueries = new Map()
  observers = []
  animationFrames = new Map()
  nextFrameId = 0
  document.head.innerHTML = '<meta name="description" content="Initial description" />'
  vi.stubGlobal('matchMedia', vi.fn(getMediaQuery))
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback) => {
    const frameId = ++nextFrameId
    animationFrames.set(frameId, callback)
    return frameId
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn((frameId) => animationFrames.delete(frameId)))
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback) {
      this.callback = callback
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      observers.push(this)
    }
  })
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('ABPL routes', () => {
  it.each([
    ['/', 'home', 'American Badminton Premier League'],
    ['/index.html', 'home', 'American Badminton Premier League'],
    ['/about', 'about', 'About ABPL'],
    ['/about.html', 'about', 'About ABPL'],
    ['/team', 'team', 'Leadership'],
    ['/team.html', 'team', 'Leadership'],
    ['/league', 'league', 'The Legacy'],
    ['/info', 'league', 'The Legacy'],
    ['/info.html', 'league', 'The Legacy'],
    ['/stats', 'stats', 'League Stats'],
    ['/stats.html', 'stats', 'League Stats'],
  ])('renders %s with its active link and metadata', async (path, name, heading) => {
    const router = await renderRoute(path)
    expect(router.currentRoute.value.name).toBe(name)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').attributes('aria-label')).toBe(heading)
    expect(wrapper.get('h1').text().replace(/\s+/g, ' ')).toBe(heading)
    expect(wrapper.findAll('.nav-links [aria-current="page"]')).toHaveLength(1)
    expect(document.title).toBe(seed.pages[name].metaTitle)
    expect(document.querySelector('meta[name="description"]').content).toBe(seed.pages[name].metaDescription)
    expect(wrapper.get('.cta-banner a').attributes('href')).toBe('mailto:info@abplofficial.com')
  })

  it('navigates without replacing the shared shell and focuses the new content', async () => {
    const router = await renderRoute()
    const header = wrapper.get('.site-nav').element
    await wrapper.get('.nav-links a[href="/team"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('team')
    expect(wrapper.get('.site-nav').element).toBe(header)
    expect(wrapper.findAll('.flip-card')).toHaveLength(6)
    expect(document.activeElement).toBe(wrapper.get('main').element)
    expect(document.title).toContain('Team')
  })

  it('preserves the eight franchise placeholders and four season details', async () => {
    await renderRoute('/stats')
    expect(wrapper.findAll('.card')).toHaveLength(8)
    expect(wrapper.findAll('.card h3').every((heading) => heading.text() === 'City TBD')).toBe(true)
    expect(wrapper.findAll('.format-item')).toHaveLength(4)
    expect(wrapper.get('.callout').text()).toContain('placeholders')
  })

  it('provides a working recovery link for unknown routes', async () => {
    const router = await renderRoute('/missing-page')
    expect(wrapper.get('h1').attributes('aria-label')).toBe('Page Not Found')
    await wrapper.get('main a[href="/"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('home')
  })
})

describe('mobile navigation', () => {
  it('keeps the closed menu inert and closes it after navigation', async () => {
    await setMediaQuery('(max-width: 960px)', true)
    await renderRoute()
    const toggle = wrapper.get('.nav-toggle')
    expect(wrapper.get('.nav-links').attributes('inert')).toBeDefined()
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('.nav-links').attributes('inert')).toBeUndefined()
    await wrapper.get('.nav-links a[href="/stats"]').trigger('click')
    await flushPromises()
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.nav-links').attributes('inert')).toBeDefined()
  })

  it('closes on Escape and returns focus to the menu button', async () => {
    await setMediaQuery('(max-width: 960px)', true)
    await renderRoute()
    const toggle = wrapper.get('.nav-toggle')
    await toggle.trigger('click')
    await wrapper.get('.nav-links a').trigger('keydown', { key: 'Escape' })
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle.element)
  })

  it('resets mobile state when switching to desktop', async () => {
    await setMediaQuery('(max-width: 960px)', true)
    await renderRoute()
    await wrapper.get('.nav-toggle').trigger('click')
    await setMediaQuery('(max-width: 960px)', false)
    expect(wrapper.get('.nav-toggle').attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.nav-links').attributes('inert')).toBeUndefined()
  })
})

describe('team cards and motion', () => {
  it('reveals each biography independently and supports closing with Escape', async () => {
    await renderRoute('/team')
    const cards = wrapper.findAll('.flip-card')
    const toggle = cards[0].get('button')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(cards[0].get('.flip-front').attributes('inert')).toBeUndefined()
    await toggle.trigger('click')
    expect(cards[0].classes()).toContain('flipped')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(cards[0].get('.flip-back').attributes('aria-hidden')).toBe('false')
    expect(cards[0].get('.flip-back').attributes('inert')).toBeUndefined()
    expect(cards[0].get('.flip-back p').text()).toBe(seed.pages.team.members[0].bio)
    expect(cards[1].classes()).not.toContain('flipped')
    await toggle.trigger('keydown', { key: 'Escape' })
    expect(cards[0].classes()).not.toContain('flipped')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('reinitializes page state after leaving and returning', async () => {
    const router = await renderRoute('/team')
    await wrapper.get('.flip-toggle').trigger('click')
    await router.push('/about')
    await flushPromises()
    await router.push('/team')
    await flushPromises()
    expect(wrapper.get('.flip-toggle').attributes('aria-expanded')).toBe('false')
  })

  it('reveals content immediately when reduced motion is requested', async () => {
    await setMediaQuery('(prefers-reduced-motion: reduce)', true)
    await renderRoute('/about')
    expect(observers).toHaveLength(0)
    expect(wrapper.findAll('[data-reveal]').every((element) => element.attributes('data-reveal') === 'visible')).toBe(true)
    expect(wrapper.findAll('.qw').every((word) => word.classes().includes('hi'))).toBe(true)
  })

  it('resets and disables pointer tilt when site-wide motion is turned off', async () => {
    await renderRoute('/team')
    const card = wrapper.get('.flip-card')
    vi.spyOn(card.element, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 300, height: 400 })
    card.element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 250, clientY: 40 }))
    await nextTick()
    expect(card.element.style.getPropertyValue('--tilt-y')).not.toBe('0deg')
    const content = structuredClone(seed)
    content.appearance.motionEnabled = false
    setSiteContent({ content, revision: 2 })
    await nextTick()
    expect(card.element.style.getPropertyValue('--tilt-y')).toBe('0deg')
    card.element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 250, clientY: 40 }))
    await nextTick()
    expect(card.element.style.getPropertyValue('--tilt-x')).toBe('0deg')
    expect(card.element.style.getPropertyValue('--tilt-y')).toBe('0deg')
  })

  it('reveals elements once when they enter the viewport', async () => {
    await renderRoute('/stats')
    expect(wrapper.findAll('[data-reveal="pending"]').length).toBeGreaterThan(0)
    observers.forEach((observer) => observer.callback([{ isIntersecting: true }]))
    expect(wrapper.findAll('[data-reveal="pending"]')).toHaveLength(0)
    expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true)
  })

  it('disconnects observers and removes media listeners and pending frames on unmount', async () => {
    await renderRoute('/about')
    window.dispatchEvent(new Event('scroll'))
    expect(animationFrames.size).toBeGreaterThan(0)
    expect(observers.length).toBeGreaterThan(0)
    wrapper.unmount()
    wrapper = undefined
    expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true)
    expect([...mediaQueries.values()].every((query) => query.listeners.size === 0)).toBe(true)
    expect(animationFrames.size).toBe(0)
    window.dispatchEvent(new Event('scroll'))
    expect(animationFrames.size).toBe(0)
  })
})