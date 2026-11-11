<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowDown, ArrowUpRight, Pause, Play, Star } from '@lucide/vue'
import AmbientField from './AmbientField.vue'
import ShuttleScene from './ShuttleScene.vue'
import { photography } from '../data/photography.js'
import { navigation, site } from '../stores/content.js'
import { useMediaQuery } from '../composables/useMediaQuery.js'
import { useViewportMotion } from '../composables/useViewportMotion.js'
import { holdBoot } from '../bootLoader.js'

const props = defineProps({
  title: { type: String, required: true },
  home: { type: Boolean, default: false },
  divider: { type: Boolean, default: true },
  intro: { type: String, default: '' },
  tagline: { type: String, default: '' },
  image: { type: String, default: 'court' },
  previewVisible: { type: Boolean, default: true },
})

const lines = computed(() => props.title.split('\n').filter(Boolean))
const heading = computed(() => props.title.replace(/\s+/g, ' ').trim())
const announcements = computed(() => site.value.announcements.map((item) => item.text))
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const hero = ref(null)
const shuttle = ref(null)
const marquee = ref(null)
const heroPhoto = ref(null)
const releaseHeroPhoto = holdBoot()
const heroMotion = useViewportMotion(hero)
const marqueeMotion = useViewportMotion(marquee)
const tickerPaused = ref(false)
const scenePaused = ref(false)
const sceneActive = computed(() => heroMotion.value && !scenePaused.value)
const heroImage = computed(() => photography[props.image] || photography.court)
const leagueLink = computed(() => navigation.value.find((item) => item.name === 'league'))

onMounted(() => {
  if (heroPhoto.value?.complete) releaseHeroPhoto()
})
onBeforeUnmount(releaseHeroPhoto)

watch(sceneActive, (active, previous, onCleanup) => {
  if (!active) return
  let animationFrame = 0

  function updateParallax() {
    animationFrame = 0
    if (!hero.value) return
    const bounds = hero.value.getBoundingClientRect()
    const offset = Math.max(-30, Math.min(30, -bounds.top * 0.1))
    hero.value.style.setProperty('--parallax-offset', `${offset}px`)
    shuttle.value?.setProgress(Math.max(0, -bounds.top) / (bounds.height || window.innerHeight))
  }

  function onScroll() {
    if (!animationFrame) animationFrame = requestAnimationFrame(updateParallax)
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  onCleanup(() => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    hero.value?.style.setProperty('--parallax-offset', '0px')
  })
})
</script>

<template>
  <header ref="hero" class="hero" :class="{ 'hero-smash': home, 'hero-interior': !home }" :data-motion-paused="!sceneActive">
    <img ref="heroPhoto" class="hero-photograph" :src="heroImage.src" alt="" aria-hidden="true" :width="heroImage.width" :height="heroImage.height" fetchpriority="high" @load="releaseHeroPhoto" @error="releaseHeroPhoto" />
    <div class="hero-shade" aria-hidden="true"></div>
    <AmbientField v-if="!home" />
    <ShuttleScene v-if="home" ref="shuttle" :active="sceneActive" />
    <div class="wrap hero-inner">
      <h1 :aria-label="heading">
        <span v-for="(line, lineIndex) in lines" :key="line" class="kinetic-line" aria-hidden="true">
          <template v-for="(word, wordIndex) in line.split(' ')" :key="`${wordIndex}-${word}`">
            <span
              class="kw"
              :class="lineIndex % 2 ? 'from-l' : 'from-r'"
              :style="{ animationDelay: `${Math.min(lineIndex * 0.14 + wordIndex * 0.045, 0.32)}s` }"
            >{{ word }}</span>{{ wordIndex < line.split(' ').length - 1 ? ' ' : '' }}
          </template>
          {{ lineIndex < lines.length - 1 ? ' ' : '' }}
        </span>
      </h1>
      <p v-if="home && tagline" class="tagline">{{ tagline }}</p>
      <p v-if="intro" class="lede">{{ intro }}</p>
      <div v-if="home" class="hero-actions">
        <RouterLink v-if="leagueLink" class="btn btn-gold" :to="leagueLink.path">Explore {{ leagueLink.label }}<ArrowUpRight :size="18" aria-hidden="true" /></RouterLink>
        <a v-if="previewVisible" class="hero-scroll" href="#league-preview" aria-label="Explore season one" title="Explore season one"><ArrowDown :size="20" aria-hidden="true" /></a>
      </div>
      <slot></slot>
    </div>
    <div v-if="home" class="hero-baseline wrap">
      <span>{{ site.footer.established }}</span>
      <button v-if="!reducedMotion" class="scene-toggle" type="button" :aria-pressed="scenePaused" :aria-label="scenePaused ? 'Resume scene motion' : 'Pause scene motion'" :title="scenePaused ? 'Resume scene motion' : 'Pause scene motion'" @click="scenePaused = !scenePaused">
        <Play v-if="scenePaused" :size="16" aria-hidden="true" /><Pause v-else :size="16" aria-hidden="true" />
      </button>
    </div>
    <p class="hero-photo-context wrap" :class="{ 'hero-photo-context-home': home }"><a :href="heroImage.source" target="_blank" rel="noopener noreferrer">{{ heroImage.title }}</a>. Reference photography, not ABPL.</p>
  </header>
  <div v-if="announcements.length" ref="marquee" class="marquee" :class="{ 'marquee-static': reducedMotion }" :data-motion-paused="!marqueeMotion || tickerPaused" role="region" :aria-label="announcements.join('. ')">
    <div class="marquee-window">
      <div class="marquee-text" aria-hidden="true">
        <div v-for="copy in 2" :key="copy" class="marquee-group">
          <span v-for="(announcement, index) in announcements" :key="index">
            {{ announcement }}<Star :size="12" fill="currentColor" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
    <button v-if="!reducedMotion" class="marquee-toggle" type="button" :aria-label="tickerPaused ? 'Resume announcements' : 'Pause announcements'" :title="tickerPaused ? 'Resume announcements' : 'Pause announcements'" @click="tickerPaused = !tickerPaused">
      <Play v-if="tickerPaused" :size="16" aria-hidden="true" />
      <Pause v-else :size="16" aria-hidden="true" />
    </button>
  </div>
  <div v-if="divider && !home" class="hero-divider" aria-hidden="true"></div>
</template>