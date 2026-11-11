import { computed, ref, watch } from 'vue'

// The loader markup lives in index.html so it paints before any JavaScript arrives.
const loader = typeof document === 'undefined' ? null : document.getElementById('boot-loader')
const holds = ref(0)
const FAILSAFE_MS = 12000

export const bootComplete = ref(!loader)

// Components that must be ready before the first reveal (the WebGL shuttle, the hero photograph)
// take a hold and release it once settled. Holds after boot are no-ops.
export function holdBoot() {
  if (bootComplete.value) return () => {}
  holds.value += 1
  let released = false
  return () => {
    if (released) return
    released = true
    holds.value -= 1
  }
}

export function startBootLoader(contentSettled) {
  if (!loader) return () => {}
  const assetsReady = ref(false)
  const timedOut = ref(false)
  let disposed = false
  let shown = 0

  const pageLoaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }))
  Promise.all([pageLoaded, document.fonts?.ready]).then(() => {
    if (!disposed) assetsReady.value = true
  })
  const failsafe = setTimeout(() => { timedOut.value = true }, FAILSAFE_MS)

  // Real milestones only: published content, fonts and page assets, then the 3D scene and hero photograph.
  const progress = computed(() => {
    const scene = contentSettled.value && holds.value === 0
    return 0.08 + (contentSettled.value ? 0.42 : 0) + (assetsReady.value ? 0.2 : 0) + (scene ? 0.3 : 0)
  })
  const ready = computed(() => timedOut.value || (contentSettled.value && assetsReady.value && holds.value === 0))

  const stopProgress = watch(progress, (value) => {
    shown = Math.max(shown, value)
    loader.style.setProperty('--boot-progress', String(shown))
  }, { immediate: true })

  function finish() {
    clearTimeout(failsafe)
    bootComplete.value = true
    loader.style.setProperty('--boot-progress', '1')
    loader.dataset.state = 'done'
    loader.setAttribute('aria-busy', 'false')
    document.documentElement.classList.remove('is-booting')
    document.getElementById('app')?.removeAttribute('inert')
    const remove = () => loader.remove()
    loader.addEventListener('transitionend', (event) => { if (event.target === loader) remove() })
    setTimeout(remove, 1200)
  }

  const stopReady = watch(ready, (value) => { if (value) finish() }, { flush: 'post', immediate: true })

  return () => {
    disposed = true
    clearTimeout(failsafe)
    stopProgress()
    stopReady()
  }
}
