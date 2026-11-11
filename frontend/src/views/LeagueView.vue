<script setup>
import PageHero from '../components/PageHero.vue'
import ScrollQuote from '../components/ScrollQuote.vue'
import FormatList from '../components/FormatList.vue'
import { logoUrl, usePageContent } from '../stores/content.js'
import { vReveal } from '../directives/reveal.js'
const page = usePageContent('league')
</script>

<template>
  <PageHero :title="page.heroTitle" :intro="page.heroIntro" image="doubles" />
  <section v-if="page.storyVisible" class="section-alt">
    <div class="wrap story">
      <div class="crest-frame">
        <div class="crest-spin-wrap">
          <img :src="logoUrl" :alt="page.crestAlt" />
          <img class="crest-spin-back" :src="logoUrl" alt="" aria-hidden="true" />
        </div>
      </div>
      <div>
        <h2>{{ page.storyTitle }}</h2>
        <p class="section-caption">{{ page.storyLabel }}</p>
        <ScrollQuote :text="page.storyQuote" />
        <p class="story-detail">{{ page.storyBody }}</p>
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div v-reveal class="section-head">
        <h2>{{ page.formatTitle }}</h2>
        <p class="section-caption">{{ page.formatLabel }}</p>
      </div>
      <FormatList :items="page.items" />
      <div v-if="page.note" class="callout">{{ page.note }}</div>
    </div>
  </section>
</template>