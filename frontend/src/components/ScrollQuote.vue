<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMediaQuery } from '../composables/useMediaQuery.js'

const props = defineProps({ text: { type: String, required: true } })
const words = computed(() => props.text.trim().split(/\s+/))
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const quote = ref(null)
const highlightedCount = ref(0)
let animationFrame = 0

function update() {
  animationFrame = 0
  if (!quote.value) return
  if (reducedMotion.value) {
    highlightedCount.value = words.value.length
    return
  }

  const midpoint = window.innerHeight * 0.55
  highlightedCount.value = Array.from(quote.value.querySelectorAll('.qw')).filter((word) => {
    const bounds = word.getBoundingClientRect()
    return (bounds.top + bounds.bottom) / 2 < midpoint
  }).length
}

function scheduleUpdate() {
  if (!animationFrame) animationFrame = requestAnimationFrame(update)
}

watch(reducedMotion, update)
watch(() => props.text, scheduleUpdate)

onMounted(() => {
  update()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
})
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