<script setup>
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '../composables/useMediaQuery.js'
import { useViewportMotion } from '../composables/useViewportMotion.js'

const props = defineProps({ text: { type: String, required: true } })
const words = computed(() => props.text.trim().split(/\s+/))
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const quote = ref(null)
const motionActive = useViewportMotion(quote)
const highlightedCount = ref(0)

watch([motionActive, words], ([active], previous, onCleanup) => {
  if (!active) return
  let animationFrame = 0

  function update() {
    animationFrame = 0
    if (!quote.value) return
    const midpoint = window.innerHeight * 0.55
    highlightedCount.value = Array.from(quote.value.querySelectorAll('.qw')).filter((word) => {
      const bounds = word.getBoundingClientRect()
      return (bounds.top + bounds.bottom) / 2 < midpoint
    }).length
  }

  function scheduleUpdate() {
    if (!animationFrame) animationFrame = requestAnimationFrame(update)
  }

  scheduleUpdate()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate, { passive: true })
  onCleanup(() => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
  })
}, { flush: 'post' })
</script>

<template>
  <p ref="quote" class="scroll-quote">
    <span
      v-for="(word, index) in words"
      :key="`${index}-${word}`"
      class="qw"
      :class="{ gold: /America|badminton|Badminton|home|fanbase|legacy|Legacy/.test(word), hi: reducedMotion || index < highlightedCount }"
    >{{ word }}{{ index < words.length - 1 ? ' ' : '' }}</span>
  </p>
</template>