import { onBeforeUnmount, ref, watch } from 'vue'
import { useMediaQuery, usePageVisibility } from './useMediaQuery.js'

export function useViewportMotion(target) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const pageVisible = usePageVisibility()
  const active = ref(false)

  const stop = watch([target, reducedMotion, pageVisible], ([element, reduced, visible], previous, onCleanup) => {
    active.value = false
    if (!element || reduced || !visible) return
    if (!('IntersectionObserver' in window)) {
      active.value = true
      return
    }
    const observer = new IntersectionObserver((entries) => {
      active.value = entries.some((entry) => entry.isIntersecting)
    }, { threshold: 0 })
    observer.observe(element)
    onCleanup(() => observer.disconnect())
  }, { flush: 'post' })

  onBeforeUnmount(stop)
  return active
}