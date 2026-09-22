import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { siteContent } from '../stores/content.js'

export function useMediaQuery(query) {
  const matches = ref(false)
  let mediaQuery

  function update() {
    matches.value = mediaQuery.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    update()
    mediaQuery.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', update)
  })

  return computed(() => matches.value || (query === '(prefers-reduced-motion: reduce)' && siteContent.value?.appearance.motionEnabled === false))
}