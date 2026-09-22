<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Star } from '@lucide/vue'
import { logoUrl, site } from '../stores/content.js'
import { useMediaQuery } from '../composables/useMediaQuery.js'

const props = defineProps({
  title: { type: String, required: true },
  home: { type: Boolean, default: false },
  divider: { type: Boolean, default: true },
  intro: { type: String, default: '' },
  tagline: { type: String, default: '' },
})

const lines = computed(() => props.title.split('\n').filter(Boolean))
const heading = computed(() => props.title.replace(/\s+/g, ' ').trim())
const announcements = computed(() => site.value.announcements.map((item) => item.text))
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const hero = ref(null)
const smashed = ref(false)
const watermarkOffset = ref(0)
let smashTimer
let animationFrame = 0

function updateParallax() {
  animationFrame = 0
  if (!hero.value || reducedMotion.value) return
  watermarkOffset.value = -hero.value.getBoundingClientRect().top * 0.08
}

function onScroll() {
  if (!animationFrame && !reducedMotion.value) animationFrame = requestAnimationFrame(updateParallax)
}

onMounted(() => {
  if (!props.home) return
  smashTimer = window.setTimeout(() => { smashed.value = !reducedMotion.value }, 880)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.clearTimeout(smashTimer)
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header ref="hero" class="hero" :class="{ 'hero-smash': home, 'hero-shake': smashed }">
    <template v-if="home">
      <img class="shuttle-mark" :src="logoUrl" alt="" aria-hidden="true" :style="{ transform: `translateY(${watermarkOffset}px) rotate(12deg)` }" />
      <div class="hero-flash" :class="{ go: smashed }" aria-hidden="true"></div>
      <div class="hero-streak go" aria-hidden="true"></div>
    </template>
    <div class="wrap hero-inner" :class="{ 'hero-center': home }">
      <h1 :aria-label="heading">
        <span v-for="(line, lineIndex) in lines" :key="line" class="kinetic-line" aria-hidden="true">
          <template v-for="(word, wordIndex) in line.split(' ')" :key="`${wordIndex}-${word}`">
            <span
              class="kw"
              :class="lineIndex % 2 ? 'from-l' : 'from-r'"
              :style="{ animationDelay: `${lineIndex * 0.4 + wordIndex * 0.11 + 0.05}s` }"
            >{{ word }}</span>{{ wordIndex < line.split(' ').length - 1 ? ' ' : '' }}
          </template>
          {{ lineIndex < lines.length - 1 ? ' ' : '' }}
        </span>
      </h1>
      <div v-if="home" class="hero-drawline" aria-hidden="true"></div>
      <p v-if="home && tagline" class="tagline">{{ tagline }}</p>
      <p v-if="intro" class="lede">{{ intro }}</p>
      <slot></slot>
    </div>
  </header>
  <div v-if="announcements.length" class="marquee" role="region" :aria-label="announcements.join('. ')">
    <div class="marquee-text" aria-hidden="true">
      <div v-for="copy in 2" :key="copy" class="marquee-group">
        <span v-for="(announcement, index) in announcements" :key="index">
          {{ announcement }}<Star :size="12" fill="currentColor" aria-hidden="true" />
        </span>
      </div>
    </div>
  </div>
  <div v-if="divider" class="shield-edge" aria-hidden="true"></div>
</template>