import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import seed from '../../../backend/src/seed.json'
import App from '../App.vue'
import AdminLoginForm from '../components/admin/AdminLoginForm.vue'
import { createAppRouter } from '../router.js'
import { editorSections, getSectionValue, makeCollectionItem } from './editor.js'
import { adminUser, clearSession } from '../services/api.js'
import { setSiteContent } from '../stores/content.js'

let wrapper
let snapshot
let authenticated
let conflict
let validationIssues
let requests

function response(body, status = 200) {
  return { ok: status < 400, status, json: async () => structuredClone(body) }
}

beforeEach(() => {
  snapshot = { content: structuredClone(seed), revision: 1, updatedAt: '2026-09-13T00:00:00Z' }
  setSiteContent(snapshot)
  clearSession()
  authenticated = true
  conflict = false
  validationIssues = []
  requests = []
  document.head.innerHTML = '<meta name="description" content="" />'
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} })))
  vi.stubGlobal('confirm', vi.fn(() => false))
  vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
    const body = options.body && !(options.body instanceof FormData) ? JSON.parse(options.body) : options.body
    requests.push({ url, ...options, body })
    if (url === '/api/admin/login') {
      if (body.username !== 'admin' || body.password !== 'admin@123') return response({ error: 'Username or password is incorrect.' }, 401)
      authenticated = true
      return response({ username: 'admin', csrfToken: 'csrf-test-token' })
    }
    if (url === '/api/admin/session') return authenticated ? response({ username: 'admin', csrfToken: 'csrf-test-token' }) : response({ error: 'Sign in to continue.' }, 401)
    if (url === '/api/admin/logout') { authenticated = false; return response(null, 204) }
    if (url === '/api/admin/images') return response({ url: '/api/media/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }, 201)
    if (url === '/api/admin/content' && options.method === 'PUT') {
      if (conflict) return response({ error: 'Content changed in another session.' }, 409)
      if (validationIssues.length) return response({ error: 'Check the highlighted fields.', issues: validationIssues }, 400)
      snapshot = { ...body, revision: body.revision + 1, updatedAt: '2026-09-13T01:00:00Z' }
      return response(snapshot)
    }
    return response(snapshot)
  }))
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  clearSession()
  vi.unstubAllGlobals()
})

async function dashboard() {
  const router = createAppRouter(createMemoryHistory())
  await router.push('/admin')
  await router.isReady()
  wrapper = mount(App, { attachTo: document.body, global: { plugins: [router] } })
  await flushPromises()
  return router
}

function selectSection(id) {
  return wrapper.get(`.admin-sidebar button:nth-child(${editorSections.findIndex((entry) => entry.id === id) + 1})`).trigger('click')
}

describe('editor coverage', () => {
  it('provides controls for every persisted content field except immutable item IDs', () => {
    const leaves = []
    function collect(value, path) {
      if (Array.isArray(value)) {
        if (value[0]) collect(value[0], `${path}.*`)
      } else if (value && typeof value === 'object') {
        Object.entries(value).forEach(([key, entry]) => { if (key !== 'id') collect(entry, path ? `${path}.${key}` : key) })
      } else leaves.push(path)
    }
    const fields = []
    function collectFields(entries, path) {
      entries.forEach((entry) => {
        const next = entry.key ? `${path}.${entry.key}` : path
        if (entry.type === 'group') collectFields(entry.fields, next)
        else if (entry.type === 'collection') collectFields(entry.fields, `${next}.*`)
        else fields.push(next)
      })
    }
    collect(seed, '')
    editorSections.forEach((section) => {
      expect(getSectionValue(seed, section)).toBeDefined()
      collectFields(section.fields, section.path)
    })
    expect(fields.sort()).toEqual(leaves.sort())
    const teamFields = editorSections.find((section) => section.id === 'team').fields.find((entry) => entry.key === 'members').fields
    const member = makeCollectionItem(teamFields)
    expect(member.id).toMatch(/^[a-f0-9-]{36}$/)
    expect(member).toHaveProperty('imageUrl', '')
  })
})

describe('admin authentication', () => {
  it('redirects unauthenticated dashboard visits to the separate login route', async () => {
    authenticated = false
    const router = createAppRouter(createMemoryHistory())
    await router.push('/admin')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/admin-login')
  })

  it('shows no admin link on public pages and omits public navigation from login', async () => {
    const router = createAppRouter(createMemoryHistory())
    await router.push('/')
    await router.isReady()
    wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.findAll('a[href^="/admin"]')).toHaveLength(0)
    await router.push('/admin-login')
    await flushPromises()
    expect(wrapper.find('.site-nav').exists()).toBe(false)
    expect(wrapper.find('footer').exists()).toBe(false)
    expect(wrapper.find('#admin-username').exists()).toBe(true)
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex, nofollow')
  })

  it('reports invalid credentials and signs in without persisting the password', async () => {
    wrapper = mount(AdminLoginForm)
    expect(wrapper.get('#admin-username').element.value).toBe('')
    expect(wrapper.get('#admin-password').element.value).toBe('')
    await wrapper.get('#admin-username').setValue('admin')
    await wrapper.get('#admin-password').setValue('wrong')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Username or password is incorrect.')
    await wrapper.get('#admin-password').setValue('admin@123')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.emitted('signed-in')).toHaveLength(1)
    expect(wrapper.get('#admin-password').element.value).toBe('')
    expect(adminUser.value.username).toBe('admin')
  })
})

describe('publishing workflow', () => {
  it('publishes the complete edited document with a CSRF token and revision', async () => {
    await dashboard()
    await selectSection('home')
    await wrapper.get('#content-pages-home-heroTitle').setValue('A new league headline')
    expect(wrapper.text()).toContain('Unpublished changes')
    await wrapper.get('#content-form').trigger('submit')
    await flushPromises()
    const publish = requests.find((entry) => entry.method === 'PUT')
    expect(publish.headers['X-CSRF-Token']).toBe('csrf-test-token')
    expect(publish.body.revision).toBe(1)
    expect(publish.body.content.pages.home.heroTitle).toBe('A new league headline')
    expect(publish.body.content.site.footer).toEqual(seed.site.footer)
    expect(wrapper.text()).toContain('Changes published.')
    expect(wrapper.text()).toContain('Revision 2')
    expect(wrapper.get('button[form="content-form"]').attributes('disabled')).toBeDefined()
  })

  it('keeps unsaved edits after a publish conflict and protects discard', async () => {
    await dashboard()
    await wrapper.get('#content-site-name').setValue('Unsaved league name')
    conflict = true
    await wrapper.get('#content-form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Content changed in another session.')
    expect(wrapper.get('#content-site-name').element.value).toBe('Unsaved league name')
    await wrapper.get('[aria-label="Reload published content"]').trigger('click')
    expect(window.confirm).toHaveBeenCalled()
    expect(wrapper.get('#content-site-name').element.value).toBe('Unsaved league name')
    window.confirm.mockReturnValue(true)
    await wrapper.get('[aria-label="Reload published content"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('#content-site-name').element.value).toBe(seed.site.name)
  })

  it('supports adding, reordering, and removing collection items', async () => {
    await dashboard()
    await selectSection('team')
    expect(wrapper.findAll('.collection-item')).toHaveLength(6)
    await wrapper.get('[aria-label="Add to Leadership Team"]').trigger('click')
    expect(wrapper.findAll('.collection-item')).toHaveLength(7)
    expect(wrapper.findAll('.collection-item')[6].element.open).toBe(true)
    expect(document.activeElement.id).toBe('content-pages-team-members-6-name')
    await wrapper.get('#content-pages-team-members-6-name').setValue('New Commissioner')
    await wrapper.findAll('[aria-label="Move up"]')[6].trigger('click')
    expect(wrapper.get('#content-pages-team-members-5-name').element.value).toBe('New Commissioner')
    await wrapper.findAll('[aria-label="Remove item"]')[5].trigger('click')
    expect(wrapper.findAll('.collection-item')).toHaveLength(6)
  })

  it('warns before navigating away from unpublished edits', async () => {
    const router = await dashboard()
    await wrapper.get('#content-site-name').setValue('Do not lose this')
    await router.push('/')
    await nextTick()
    expect(router.currentRoute.value.path).toBe('/admin')
  })

  it('routes validation errors to fields in collapsed items on another section', async () => {
    await dashboard()
    await wrapper.get('#content-site-name').setValue('Draft league')
    validationIssues = [{ path: 'content.pages.team.members.1.title', message: 'Role is required.' }]
    await wrapper.get('#content-form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('#content-form').attributes('novalidate')).toBeDefined()
    await wrapper.get('.admin-notice.error li button').trigger('click')
    await nextTick()
    expect(wrapper.get('h1').text()).toBe('Team')
    expect(document.activeElement.id).toBe('content-pages-team-members-1-title')
    expect(wrapper.findAll('.collection-item')[1].element.open).toBe(true)
    expect(wrapper.get('#content-pages-team-members-1-title').attributes('aria-invalid')).toBe('true')
  })

  it('disables editing until an in-flight reload finishes', async () => {
    await dashboard()
    let finishReload
    const originalFetch = fetch.getMockImplementation()
    fetch.mockImplementation((url, options) => url === '/api/admin/content'
      ? new Promise((resolve) => { finishReload = resolve })
      : originalFetch(url, options))
    await wrapper.get('[aria-label="Reload published content"]').trigger('click')
    expect(wrapper.get('.editor-root').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[form="content-form"]').attributes('disabled')).toBeDefined()
    finishReload(response(snapshot))
    await flushPromises()
    expect(wrapper.get('.editor-root').attributes('disabled')).toBeUndefined()
  })
})