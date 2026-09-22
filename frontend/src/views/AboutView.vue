<script setup>
import PageHero from '../components/PageHero.vue'
import ScrollQuote from '../components/ScrollQuote.vue'
import { vReveal } from '../directives/reveal.js'
import { usePageContent } from '../stores/content.js'
const page = usePageContent('about')
</script>

<template>
  <PageHero :title="page.heroTitle" :intro="page.heroIntro" :divider="false" />
  <section v-if="page.quote">
    <div class="wrap">
      <ScrollQuote :text="page.quote" />
    </div>
  </section>
  <div class="shield-edge" aria-hidden="true"></div>
  <section v-if="page.sectionVisible" class="section-alt">
    <div class="wrap split">
      <div v-reveal class="mv-block">
        <span class="eyebrow">{{ page.mission.label }}</span>
        <h2>{{ page.mission.title }}</h2>
        <p>{{ page.mission.body }}</p>
      </div>
      <div v-reveal="1" class="mv-block">
        <span class="eyebrow">{{ page.vision.label }}</span>
        <h2>{{ page.vision.title }}</h2>
        <p>{{ page.vision.body }}</p>
      </div>
    </div>
  </section>
</template>