import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory } from 'vue-router'
import { Box3, Vector3 } from 'three'
import App from './App.vue'
import { createAppRouter } from './router.js'
import { createShuttleModel, disposeShuttleModel } from './graphics/shuttle.js'
import seed from '../../backend/src/seed.json'
import { contentError, contentLoading, setSiteContent, siteContent } from './stores/content.js'

let wrapper
let mediaQueries
let observers
let animationFrames
let nextFrameId

const photoMotion = vi.hoisted(() => ({ scopes: [], fromTo: vi.fn(), registerPlugin: vi.fn() }))
vi.mock('gsap', () => ({ gsap: {
  registerPlugin: photoMotion.registerPlugin,
  fromTo: photoMotion.fromTo,
  context(callback) {
    const scope = { revert: vi.fn() }
    photoMotion.scopes.push(scope)
    callback()
    return scope
  },
} }))
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }))

function getMediaQuery(query) {
  if (!mediaQueries.has(query)) {
    const listeners = new Set()
    mediaQueries.set(query, {
      matches: query === '(pointer: fine)' || query === '(hover: hover) and (pointer: fine)',
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

function stepAnimationFrame(time = 16) {
  const callbacks = [...animationFrames.values()]
  animationFrames.clear()
  callbacks.forEach((callback) => callback(time))
}

function intersect(selector, ratio = 1) {
  observers.forEach((observer) => {
    const target = observer.observe.mock.calls[0]?.[0]
    if (target?.matches(selector)) observer.callback([{ target, isIntersecting: ratio > 0, intersectionRatio: ratio }])
  })
}

beforeEach(() => {
  const snapshot = { content: structuredClone(seed), revision: 1, updatedAt: new Date().toISOString() }
  setSiteContent(snapshot)
  contentLoading.value = false
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => structuredClone(snapshot) })))
  mediaQueries = new Map()
  observers = []
  animationFrames = new Map()
  nextFrameId = 0
  photoMotion.scopes.length = 0
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
    constructor(callback, options) {
      this.callback = callback
      this.options = options
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
    expect(wrapper.findAll('.format-item .num')).toHaveLength(0)
    expect(wrapper.get('.card').element.querySelector('h3').nextElementSibling.className).toBe('tag')
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
    stepAnimationFrame()
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

  it('batches magnetic movement, settles the cursor, and preserves the native pointer', async () => {
    await renderRoute()
    const link = wrapper.get('.nav-links a')
    const cursor = wrapper.get('.cursor-follower')
    vi.spyOn(link.element, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 44 })
    link.element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 90, clientY: 30 }))
    expect(link.element.style.getPropertyValue('--magnet-x')).toBe('')
    stepAnimationFrame()
    expect(link.element.style.getPropertyValue('--magnet-x')).toBe('5px')
    expect(cursor.attributes('aria-hidden')).toBe('true')
    expect(cursor.attributes('data-active')).toBeDefined()
    expect(cursor.element.style.transform).toContain('translate3d(76px, 16px, 0)')
    expect(animationFrames.size).toBe(0)
    link.element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 100, clientY: 30 }))
    stepAnimationFrame(32)
    expect(animationFrames.size).toBe(1)
    for (let frame = 3; frame < 30; frame += 1) stepAnimationFrame(frame * 16)
    expect(animationFrames.size).toBe(0)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(cursor.attributes('data-visible')).toBeUndefined()
    expect(link.element.style.getPropertyValue('--magnet-x')).toBe('')
  })

  it('clears pointer effects on navigation and live motion preference changes', async () => {
    const router = await renderRoute()
    const link = wrapper.get('.nav-links a')
    link.element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 40, clientY: 20 }))
    expect(wrapper.get('.cursor-follower').attributes('data-visible')).toBeDefined()
    await router.push('/team')
    await flushPromises()
    expect(wrapper.get('.cursor-follower').attributes('data-visible')).toBeUndefined()
    await setMediaQuery('(prefers-reduced-motion: reduce)', true)
    expect(wrapper.get('.public-site').attributes('data-pointer-effects')).toBeUndefined()
    expect(animationFrames.size).toBe(0)
    await setMediaQuery('(prefers-reduced-motion: reduce)', false)
    expect(wrapper.get('.public-site').attributes('data-pointer-effects')).toBeDefined()
  })

  it('does not enable pointer effects for touch or forced-color users', async () => {
    await setMediaQuery('(hover: hover) and (pointer: fine)', false)
    await renderRoute('/team')
    expect(wrapper.get('.public-site').attributes('data-pointer-effects')).toBeUndefined()
    await setMediaQuery('(hover: hover) and (pointer: fine)', true)
    await setMediaQuery('(forced-colors: active)', true)
    expect(wrapper.get('.public-site').attributes('data-pointer-effects')).toBeUndefined()
    const card = wrapper.get('.flip-card')
    card.element.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 80, clientY: 40 }))
    expect(card.attributes('data-tilting')).toBeUndefined()
    await card.get('button').trigger('click')
    expect(card.classes()).toContain('flipped')
  })

  it('reveals elements once when they are at least 20% visible', async () => {
    await renderRoute('/stats')
    const pendingCount = wrapper.findAll('[data-reveal="pending"]').length
    expect(pendingCount).toBeGreaterThan(0)
    const revealObservers = observers.filter((observer) => observer.observe.mock.calls[0]?.[0].matches('[data-reveal]'))
    expect(revealObservers.every((observer) => observer.options.threshold === 0.2)).toBe(true)
    intersect('[data-reveal]', 0.1)
    expect(wrapper.findAll('[data-reveal="pending"]')).toHaveLength(pendingCount)
    intersect('[data-reveal]', 0.2)
    expect(wrapper.findAll('[data-reveal="pending"]')).toHaveLength(0)
    expect(revealObservers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true)
  })

  it('reveals pending content immediately on preference changes and keyboard focus', async () => {
    await renderRoute('/team')
    const card = wrapper.get('.flip-card')
    expect(card.attributes('data-reveal')).toBe('pending')
    await card.get('button').trigger('focusin')
    expect(card.attributes('data-reveal')).toBe('visible')
    await setMediaQuery('(prefers-reduced-motion: reduce)', true)
    expect(wrapper.findAll('[data-reveal="pending"]')).toHaveLength(0)
    expect(wrapper.get('.hero').attributes('data-motion-paused')).toBe('true')
  })

  it('runs parallax only in view and resets it when motion is disabled', async () => {
    await renderRoute()
    const hero = wrapper.get('.hero')
    vi.spyOn(hero.element, 'getBoundingClientRect').mockReturnValue({ top: -200 })
    window.dispatchEvent(new Event('scroll'))
    expect(animationFrames.size).toBe(0)
    intersect('.hero')
    await nextTick()
    stepAnimationFrame()
    expect(hero.element.style.getPropertyValue('--parallax-offset')).toBe('20px')
    intersect('.hero', 0)
    await nextTick()
    expect(hero.element.style.getPropertyValue('--parallax-offset')).toBe('0px')
    window.dispatchEvent(new Event('scroll'))
    expect(animationFrames.size).toBe(0)
    intersect('.hero')
    await nextTick()
    await setMediaQuery('(prefers-reduced-motion: reduce)', true)
    expect(animationFrames.size).toBe(0)
    expect(hero.element.style.getPropertyValue('--parallax-offset')).toBe('0px')
  })

  it('pauses the cinematic hero and keeps navigation available without WebGL', async () => {
    await renderRoute()
    intersect('.hero')
    await nextTick()
    expect(wrapper.get('.shuttle-scene').attributes('data-renderer')).toBe('fallback')
    expect(wrapper.get('.shuttle-poster').attributes('src')).toContain('shuttle-poster.png')
    expect(wrapper.get('.shuttle-poster').attributes('alt')).toBe('')
    expect(wrapper.get('.shuttle-scene source').attributes('srcset')).toContain('shuttle-poster-mobile.png')
    const toggle = wrapper.get('.scene-toggle')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.hero').attributes('data-motion-paused')).toBe('true')
    expect(wrapper.get('.hero-actions a').attributes('href')).toBe('/league')
    const content = structuredClone(seed)
    content.pages.home.sectionVisible = false
    setSiteContent({ content, revision: 2 })
    await nextTick()
    expect(wrapper.find('.hero-scroll').exists()).toBe(false)
  })

  it('keeps reference-photo context visible outside expandable credits', async () => {
    await renderRoute()
    expect(wrapper.findAll('.story-copy .photo-context')).toHaveLength(seed.pages.home.cards.length)
    expect(wrapper.get('.site-photo-context').text()).toContain('not ABPL events or participants')
    expect(wrapper.get('.hero-photo-context-home').text()).toContain('Reference photography, not ABPL')
    expect(wrapper.get('.image-credits').attributes('open')).toBeUndefined()
  })

  it('scopes photo parallax to the route and removes it when motion preferences change', async () => {
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    })
    await renderRoute()
    await vi.dynamicImportSettled()
    expect(photoMotion.fromTo).toHaveBeenCalledTimes(3)
    const portrait = photoMotion.fromTo.mock.calls.find(([image]) => image.dataset.photoDepth === 'portrait')
    expect(portrait[1].scale).toBe(1.035)
    expect(portrait[2].scrollTrigger.scrub).toBe(0.6)
    const firstScope = photoMotion.scopes[0]
    await setMediaQuery('(prefers-reduced-motion: reduce)', true)
    expect(firstScope.revert).toHaveBeenCalledOnce()
    await setMediaQuery('(prefers-reduced-motion: reduce)', false)
    await vi.dynamicImportSettled()
    const activeScope = photoMotion.scopes.at(-1)
    wrapper.unmount()
    wrapper = undefined
    expect(activeScope.revert).toHaveBeenCalledOnce()
  })

  it('allows visitors to pause announcements and suspends motion in hidden tabs', async () => {
    await renderRoute()
    intersect('.hero, .marquee')
    await nextTick()
    expect(wrapper.get('.marquee').attributes('data-motion-paused')).toBe('false')
    await wrapper.get('.marquee-toggle').trigger('click')
    expect(wrapper.get('.marquee').attributes('data-motion-paused')).toBe('true')
    expect(wrapper.get('.marquee-toggle').attributes('aria-label')).toBe('Resume announcements')
    await wrapper.get('.marquee-toggle').trigger('click')
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    await nextTick()
    expect(wrapper.get('.marquee').attributes('data-motion-paused')).toBe('true')
    expect(wrapper.get('.public-site').attributes('data-pointer-effects')).toBeUndefined()
    expect(animationFrames.size).toBe(0)
  })

  it('disconnects observers and removes media listeners and pending frames on unmount', async () => {
    await renderRoute('/about')
    intersect('.scroll-quote')
    await nextTick()
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

describe('content loading states', () => {
  it('shows route-shaped skeletons only while content is loading', async () => {
    siteContent.value = null
    let finishRequest
    fetch.mockImplementation(() => new Promise((resolve) => { finishRequest = resolve }))
    await renderRoute('/team')
    expect(wrapper.get('main').attributes('aria-busy')).toBe('true')
    expect(wrapper.get('[role="status"]').text()).toBe('Loading league content...')
    expect(wrapper.findAll('.skeleton-portrait')).toHaveLength(6)
    finishRequest({ ok: true, status: 200, json: async () => ({ content: structuredClone(seed), revision: 1 }) })
    await flushPromises()
    expect(wrapper.find('.site-skeleton').exists()).toBe(false)
    expect(wrapper.findAll('.flip-card')).toHaveLength(6)
  })

  it('preserves retry behavior after a failed content request', async () => {
    siteContent.value = null
    fetch.mockRejectedValueOnce(new Error('Offline'))
    await renderRoute()
    expect(wrapper.find('.site-skeleton').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toContain('Cannot reach the server')
    await wrapper.get('.site-status button').trigger('click')
    await flushPromises()
    expect(contentError.value).toBe('')
    expect(wrapper.find('.public-site').exists()).toBe(true)
  })
})

describe('original shuttle geometry', () => {
  it('builds a finite, dimensional sixteen-feather shuttle and releases shared resources once', () => {
    const shuttle = createShuttleModel()
    expect(shuttle.children.filter((child) => child.name.startsWith('feather-'))).toHaveLength(16)
    const size = new Box3().setFromObject(shuttle).getSize(new Vector3())
    expect(size.y).toBeGreaterThan(3)
    expect(size.x).toBeGreaterThan(1.5)
    expect(size.z).toBeGreaterThan(1.5)
    const geometry = shuttle.children[0].children[0].children[0].geometry
    const normals = geometry.getAttribute('normal')
    const horizontalNormals = Array.from({ length: normals.count }, (_, index) => normals.getX(index))
    expect(Math.max(...horizontalNormals) - Math.min(...horizontalNormals)).toBeGreaterThan(0.4)
    const textureDisposal = vi.spyOn(shuttle.children[0].children[0].children[0].material.bumpMap, 'dispose')
    const colorDisposal = vi.spyOn(shuttle.children[0].children[0].children[0].material.map, 'dispose')
    const disposal = vi.spyOn(geometry, 'dispose')
    disposeShuttleModel(shuttle)
    expect(disposal).toHaveBeenCalledOnce()
    expect(textureDisposal).toHaveBeenCalledOnce()
    expect(colorDisposal).toHaveBeenCalledOnce()
  })
})