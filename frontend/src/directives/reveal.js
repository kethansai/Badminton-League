import { watch } from 'vue'
import { siteContent } from '../stores/content.js'

const cleanups = new WeakMap()

export const vReveal = {
  mounted(element, binding) {
    const index = Number(binding.value) || 0
    element.style.setProperty('--reveal-delay', `${Math.min(Math.max(index, 0), 4) * 0.06}s`)
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const disabled = () => preference.matches || siteContent.value?.appearance.motionEnabled === false

    if (disabled() || !('IntersectionObserver' in window)) {
      element.dataset.reveal = 'visible'
      return
    }

    function reveal() {
      element.dataset.reveal = 'visible'
      cleanups.get(element)?.()
    }

    function onPreferenceChange() {
      if (disabled()) reveal()
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2)) reveal()
    }, { threshold: 0.2 })

    const stop = watch(() => siteContent.value?.appearance.motionEnabled, onPreferenceChange)
    cleanups.set(element, () => {
      observer.disconnect()
      preference.removeEventListener('change', onPreferenceChange)
      element.removeEventListener('focusin', reveal)
      stop()
      cleanups.delete(element)
    })
    preference.addEventListener('change', onPreferenceChange)
    element.addEventListener('focusin', reveal)
    element.dataset.reveal = 'pending'
    observer.observe(element)
  },
  beforeUnmount(element) {
    cleanups.get(element)?.()
  },
}