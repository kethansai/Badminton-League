<script setup>
import { ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import ScrollQuote from '../components/ScrollQuote.vue'
import { photography } from '../data/photography.js'
import { usePhotoParallax } from '../composables/usePhotoParallax.js'
import { vMediaReady } from '../directives/mediaReady.js'
import { vReveal } from '../directives/reveal.js'
import { usePageContent } from '../stores/content.js'
const page = usePageContent('about')
const editorial = ref(null)
usePhotoParallax(editorial)
</script>

<template>
  <PageHero :title="page.heroTitle" :intro="page.heroIntro" :divider="false" image="doubles" />
  <section v-if="page.quote">
    <div class="wrap">
      <ScrollQuote :text="page.quote" />
    </div>
  </section>
  <figure ref="editorial" v-reveal v-media-ready class="editorial-photograph">
    <img :src="photography.court.src" :alt="photography.court.alt" :width="photography.court.width" :height="photography.court.height" data-photo-depth="wide" loading="lazy" />
  </figure>
  <p class="wrap photo-context editorial-photo-context"><a :href="photography.court.source" target="_blank" rel="noopener noreferrer">{{ photography.court.title }}</a>. Reference photography, not ABPL.</p>
  <section v-if="page.sectionVisible" class="section-alt">
    <div class="wrap split">
      <div v-reveal class="mv-block">
        <h2>{{ page.mission.title }}</h2>
        <p class="section-caption">{{ page.mission.label }}</p>
        <p>{{ page.mission.body }}</p>
      </div>
      <div v-reveal="1" class="mv-block">
        <h2>{{ page.vision.title }}</h2>
        <p class="section-caption">{{ page.vision.label }}</p>
        <p>{{ page.vision.body }}</p>
      </div>
    </div>
  </section>
</template>