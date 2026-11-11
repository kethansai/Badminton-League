<script setup>
import { computed } from 'vue'
import { logoUrl } from '../stores/content.js'
import { useMediaQuery, usePageVisibility } from '../composables/useMediaQuery.js'

const props = defineProps({ page: { type: String, default: 'home' } })
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const pageVisible = usePageVisibility()
const home = computed(() => props.page === 'home')
const cardCount = computed(() => props.page === 'stats' ? 8 : props.page === 'team' ? 6 : 3)
const grid = computed(() => ['home', 'team', 'stats'].includes(props.page))
</script>

<template>
  <div class="public-site site-skeleton" :data-motion-paused="reducedMotion || !pageVisible">
    <p class="sr-only" role="status">Loading league content...</p>
    <div class="site-nav" aria-hidden="true">
      <div class="wrap">
        <div class="skeleton-brand"><img :src="logoUrl" alt="" width="42" height="42" /><span class="skeleton-block"></span></div>
        <div class="skeleton-nav"><span v-for="item in 5" :key="item" class="skeleton-block"></span></div>
      </div>
    </div>
    <main aria-label="League content" aria-busy="true">
      <div class="hero skeleton-hero" :class="{ 'hero-smash': home }" aria-hidden="true">
        <div class="wrap hero-inner">
          <div class="skeleton-heading"><span class="skeleton-block skeleton-title"></span><span v-if="home" class="skeleton-block skeleton-title skeleton-short"></span></div>
          <span class="skeleton-block skeleton-intro"></span>
        </div>
      </div>
      <div class="skeleton-ticker" aria-hidden="true"></div>
      <section class="section-alt" aria-hidden="true">
        <div class="wrap">
          <div class="section-head"><span class="skeleton-block skeleton-section-title"></span></div>
          <div :class="home ? 'story-grid skeleton-stories' : grid ? 'card-grid' : 'split'">
            <div v-for="item in grid ? cardCount : 2" :key="item" class="skeleton-card">
              <span v-if="home" class="skeleton-block skeleton-photograph"></span>
              <span v-if="page === 'team'" class="skeleton-block skeleton-portrait"></span>
              <span class="skeleton-block skeleton-label"></span>
              <span class="skeleton-block skeleton-line"></span>
              <span class="skeleton-block skeleton-line"></span>
              <span class="skeleton-block skeleton-line skeleton-short"></span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>