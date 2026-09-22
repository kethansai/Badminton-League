const observers = new WeakMap()

export const vReveal = {
  mounted(element, binding) {
    const index = Number(binding.value) || 0
    element.style.setProperty('--reveal-delay', `${(index % 4) * 0.08}s`)
    element.dataset.revealSide = index % 2 ? 'right' : 'left'

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      element.dataset.reveal = 'visible'
      return
    }

    element.dataset.reveal = 'pending'
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        element.dataset.reveal = 'visible'
        observer.disconnect()
        observers.delete(element)
      }
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' })

    observers.set(element, observer)
    observer.observe(element)
  },
  beforeUnmount(element) {
    observers.get(element)?.disconnect()
    observers.delete(element)
  },
}