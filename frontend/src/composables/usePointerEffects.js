import { onBeforeUnmount, watch } from 'vue'
import { useMediaQuery, usePageVisibility } from './useMediaQuery.js'

const magneticSelector = '.btn, .nav-links a, .footer-col a, .hero-scroll, .scene-toggle'
const interactiveSelector = 'a[href], button, [role="button"]'
const cardSelector = '.card, .flip-card, .story-piece'
const cursorLag = 80
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value))

export function usePointerEffects(root, cursor) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const forcedColors = useMediaQuery('(forced-colors: active)')
  const pageVisible = usePageVisibility()
  let reset = () => {}

  const stop = watch([root, cursor, reducedMotion, finePointer, forcedColors, pageVisible], ([surface, follower, reduced, fine, forced, visible], previous, onCleanup) => {
    if (!surface || !follower || reduced || !fine || forced || !visible) return

    let frame = 0
    let previousTime = 0
    let pointerX = 0
    let pointerY = 0
    let cursorX = 0
    let cursorY = 0
    let positioned = false
    let magnetic = null
    let magneticBounds = null
    let card = null
    let cardBounds = null

    function releaseMagnetic() {
      magnetic?.style.removeProperty('--magnet-x')
      magnetic?.style.removeProperty('--magnet-y')
      magnetic?.removeAttribute('data-magnetic-active')
      magnetic = null
      magneticBounds = null
    }

    function releaseCard() {
      card?.style.setProperty('--tilt-x', '0deg')
      card?.style.setProperty('--tilt-y', '0deg')
      card?.style.removeProperty('--glare-x')
      card?.style.removeProperty('--glare-y')
      card?.style.removeProperty('--pointer-x')
      card?.style.removeProperty('--pointer-y')
      card?.removeAttribute('data-tilting')
      card = null
      cardBounds = null
    }

    function resetPointer() {
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      positioned = false
      releaseMagnetic()
      releaseCard()
      follower.removeAttribute('data-visible')
      follower.removeAttribute('data-active')
      follower.removeAttribute('data-card')
    }

    function update(time) {
      frame = 0
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16
      const follow = 1 - Math.exp(-elapsed / cursorLag)
      previousTime = time
      cursorX += (pointerX - cursorX) * follow
      cursorY += (pointerY - cursorY) * follow
      follower.style.transform = `translate3d(${cursorX - 14}px, ${cursorY - 14}px, 0)`

      if (magneticBounds?.width && magneticBounds.height) {
        magnetic.style.setProperty('--magnet-x', `${clamp((pointerX - magneticBounds.left - magneticBounds.width / 2) * 0.16, 5)}px`)
        magnetic.style.setProperty('--magnet-y', `${clamp((pointerY - magneticBounds.top - magneticBounds.height / 2) * 0.16, 5)}px`)
      }
      if (cardBounds?.width && cardBounds.height) {
        const horizontal = clamp((pointerX - cardBounds.left) / cardBounds.width * 2 - 1, 1)
        const vertical = clamp((pointerY - cardBounds.top) / cardBounds.height * 2 - 1, 1)
        card.style.setProperty('--tilt-x', `${-vertical * 4}deg`)
        card.style.setProperty('--tilt-y', `${horizontal * 5}deg`)
        card.style.setProperty('--glare-x', `${horizontal * 12}%`)
        card.style.setProperty('--glare-y', `${vertical * 8}%`)
        card.style.setProperty('--pointer-x', `${(horizontal + 1) * 50}%`)
        card.style.setProperty('--pointer-y', `${(vertical + 1) * 50}%`)
      }
      if (Math.hypot(pointerX - cursorX, pointerY - cursorY) > 0.1) {
        frame = requestAnimationFrame(update)
      } else {
        previousTime = 0
      }
    }

    function move(event) {
      if (event.pointerType === 'touch' || !(event.target instanceof Element) || event.target.closest('input, textarea, select, [contenteditable="true"]')) {
        resetPointer()
        return
      }
      pointerX = event.clientX
      pointerY = event.clientY
      if (!positioned) {
        cursorX = pointerX
        cursorY = pointerY
        positioned = true
      }
      follower.setAttribute('data-visible', '')
      const interactive = event.target.closest(interactiveSelector)
      const enabled = interactive && !interactive.matches(':disabled, [aria-disabled="true"]')
      follower.toggleAttribute('data-active', Boolean(enabled))
      follower.toggleAttribute('data-card', !enabled && Boolean(event.target.closest(cardSelector)))

      const nextMagnetic = enabled ? event.target.closest('.cta-ring') || event.target.closest(magneticSelector) : null
      if (magnetic !== nextMagnetic) {
        releaseMagnetic()
        magnetic = nextMagnetic
        magneticBounds = magnetic?.getBoundingClientRect()
        magnetic?.setAttribute('data-magnetic-active', '')
      }
      const nextCard = event.target.closest('.card, .flip-card:not(.flipped)')
      if (card !== nextCard) {
        releaseCard()
        card = nextCard
        cardBounds = card?.getBoundingClientRect()
        card?.setAttribute('data-tilting', '')
      }
      if (!frame) frame = requestAnimationFrame(update)
    }

    function onKeydown(event) {
      if (event.key === 'Tab' || event.key === 'Escape') resetPointer()
    }

    reset = resetPointer
    surface.setAttribute('data-pointer-effects', '')
    surface.addEventListener('pointermove', move, { passive: true })
    surface.addEventListener('pointerleave', resetPointer)
    surface.addEventListener('pointercancel', resetPointer)
    surface.addEventListener('click', resetPointer)
    window.addEventListener('scroll', resetPointer, { passive: true, capture: true })
    window.addEventListener('resize', resetPointer, { passive: true })
    window.addEventListener('blur', resetPointer)
    window.addEventListener('keydown', onKeydown)

    onCleanup(() => {
      resetPointer()
      surface.removeAttribute('data-pointer-effects')
      surface.removeEventListener('pointermove', move)
      surface.removeEventListener('pointerleave', resetPointer)
      surface.removeEventListener('pointercancel', resetPointer)
      surface.removeEventListener('click', resetPointer)
      window.removeEventListener('scroll', resetPointer, true)
      window.removeEventListener('resize', resetPointer)
      window.removeEventListener('blur', resetPointer)
      window.removeEventListener('keydown', onKeydown)
      reset = () => {}
    })
  }, { flush: 'post' })

  onBeforeUnmount(stop)
  return { resetPointerEffects: () => reset() }
}