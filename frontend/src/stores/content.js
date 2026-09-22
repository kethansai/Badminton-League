import { computed, ref, shallowRef } from 'vue'
import defaultCrest from '../assets/logo.png'
import { apiRequest } from '../services/api.js'
import { pagePaths } from '../data/site.js'

export const siteContent = shallowRef(null)
export const contentLoading = ref(false)
export const contentError = ref('')
export const contentRevision = ref(0)
let pendingRequest

export const site = computed(() => siteContent.value?.site)
export const logoUrl = computed(() => site.value?.logoUrl || defaultCrest)
export const navigation = computed(() => (site.value?.navigation || []).filter((item) => item.visible).map((item) => ({ ...item, name: item.id, path: pagePaths[item.id] })))
export const publicTheme = computed(() => {
  const appearance = siteContent.value?.appearance
  if (!appearance) return {}
  const colors = Object.fromEntries(Object.entries(appearance.colors).map(([key, color]) => [`--${key.replace(/(\d+)/, '-$1')}`, color]))
  return {
    ...colors,
    '--font-display': `'${appearance.displayFont}', sans-serif`,
    '--font-body': `'${appearance.bodyFont}', sans-serif`,
    '--font-utility': `'${appearance.utilityFont}', sans-serif`,
  }
})

export function usePageContent(name) {
  return computed(() => siteContent.value?.pages[name])
}

export function setSiteContent(snapshot) {
  siteContent.value = snapshot.content
  contentRevision.value = snapshot.revision
  contentError.value = ''
}

export async function loadSiteContent({ force = false } = {}) {
  if (pendingRequest) return pendingRequest
  if (siteContent.value && !force) return true
  contentLoading.value = true
  pendingRequest = (async () => {
    try {
      const snapshot = await apiRequest('/content')
      if (!snapshot.content?.pages || !snapshot.content?.site) throw new Error('Site content is unavailable. Please try again.')
      setSiteContent(snapshot)
      return true
    } catch (error) {
      contentError.value = error.message
      return false
    } finally {
      contentLoading.value = false
      pendingRequest = undefined
    }
  })()
  return pendingRequest
}