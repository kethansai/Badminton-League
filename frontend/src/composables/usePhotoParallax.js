import { onBeforeUnmount, watch } from 'vue'
import { useMediaQuery, usePageVisibility } from './useMediaQuery.js'

export function usePhotoParallax(target) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const pageVisible = usePageVisibility()

  const stop = watch([target, reducedMotion, pageVisible], ([element, reduced, visible], previous, onCleanup) => {
    if (!element || reduced || !visible || !window.ResizeObserver) return
    let cancelled = false
    let context
    onCleanup(() => {
      cancelled = true
      context?.revert()
    })

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      context = gsap.context(() => {
        element.querySelectorAll('[data-photo-depth]').forEach((image) => {
          const portrait = image.dataset.photoDepth === 'portrait'
          const distance = portrait ? 0.8 : 3.5
          gsap.fromTo(image, { yPercent: -distance, scale: portrait ? 1.035 : 1.12, transition: 'none' }, {
            yPercent: distance,
            ease: 'none',
            scrollTrigger: {
              trigger: image.closest('.story-piece') || image.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
        })
      }, element)
    }).catch(() => {})
  }, { flush: 'post' })

  onBeforeUnmount(stop)
}