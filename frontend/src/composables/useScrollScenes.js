import { onBeforeUnmount, watch } from 'vue'
import { useMediaQuery } from './useMediaQuery.js'

const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value))

// Scroll-linked scenes for whatever page is mounted under `root`, created top to bottom in page order.
// Every tween is scrubbed and only touches transform/opacity on elements no CSS transform owns.
function buildScenes(gsap, ScrollTrigger, root) {
  const progress = root.querySelector('.scroll-progress')
  if (progress) {
    gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'max', scrub: 0.3 } })
  }

  const hero = root.querySelector('.hero')
  const heroInner = hero?.querySelector('.hero-inner')
  if (heroInner) {
    gsap.fromTo(heroInner, { opacity: 1 }, { opacity: 0.12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top+=20% top', end: 'bottom top', scrub: 0.6 } })
  }

  const marquee = root.querySelector('.marquee:not(.marquee-static)')
  const groups = marquee ? [...marquee.querySelectorAll('.marquee-group')] : []
  if (groups.length) {
    const settle = () => gsap.to(groups, { skewX: 0, duration: 0.6, ease: 'power3.out', overwrite: true })
    ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => gsap.to(groups, { skewX: clamp(self.getVelocity() / -260, 9), duration: 0.25, ease: 'power3.out', overwrite: true, onComplete: settle }),
      onToggle: settle,
    })
  }

  if (window.matchMedia('(min-width: 961px)').matches) {
    root.querySelectorAll('.story-piece').forEach((piece) => {
      const copy = piece.querySelector('.story-copy')
      if (copy) gsap.fromTo(copy, { y: 56 }, { y: -28, ease: 'none', scrollTrigger: { trigger: piece, start: 'top bottom', end: 'bottom top', scrub: 0.8 } })
    })
  }

  root.querySelectorAll('.crest-frame').forEach((frame) => {
    const crest = frame.querySelector('.crest-spin-wrap')
    if (crest) gsap.fromTo(crest, { rotationY: 0, transition: 'none' }, { rotationY: 360, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1 } })
  })

  root.querySelectorAll('.format-item').forEach((item) => {
    const number = item.querySelector('.num')
    if (number) gsap.fromTo(number, { xPercent: -80, opacity: 0.2 }, { xPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: item, start: 'top 92%', end: 'top 60%', scrub: 0.6 } })
  })

  const cta = root.querySelector('.cta-banner')
  const ctaHeading = cta?.querySelector('h2')
  if (ctaHeading) {
    gsap.fromTo(ctaHeading, { yPercent: 40, opacity: 0.25 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: cta, start: 'top bottom', end: 'top 45%', scrub: 0.6 } })
  }
}

// `revision` changes after each route enters (null while one is leaving) so scenes are rebuilt on fresh DOM.
// The gsap.context revert kills every ScrollTrigger and restores inline styles.
export function useScrollScenes(root, revision) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const stop = watch([root, revision, reducedMotion], ([element, current, reduced], previous, onCleanup) => {
    if (!element || current === null || reduced) return
    let cancelled = false
    let context
    onCleanup(() => {
      cancelled = true
      context?.revert()
    })

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      context = gsap.context(() => buildScenes(gsap, ScrollTrigger, element), element)
    }).catch(() => {})
  }, { flush: 'post' })

  onBeforeUnmount(stop)
}
