<script setup>
import PageHero from '../components/PageHero.vue'
import FormatList from '../components/FormatList.vue'
import { usePageContent } from '../stores/content.js'
import { vReveal } from '../directives/reveal.js'
const page = usePageContent('stats')
</script>

<template>
  <PageHero :title="page.heroTitle" :intro="page.heroIntro" />
  <section class="section-alt">
    <div class="wrap">
      <div v-reveal class="section-head">
        <span class="eyebrow">{{ page.sectionLabel }}</span>
        <h2>{{ page.sectionTitle }}</h2>
      </div>
      <div v-if="page.franchises.length" class="card-grid">
        <article v-for="(franchise, index) in page.franchises" :key="franchise.id" v-reveal="index" class="card">
          <img v-if="franchise.imageUrl" class="franchise-image" :src="franchise.imageUrl" :alt="franchise.imageAlt || franchise.city" loading="lazy" />
          <span v-if="franchise.tag" class="tag">{{ franchise.tag }}</span>
          <h3>{{ franchise.city }}</h3>
          <p>{{ franchise.team }}</p>
        </article>
      </div>
      <p v-else>{{ page.emptyMessage }}</p>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div v-reveal class="section-head">
        <span class="eyebrow">{{ page.detailsLabel }}</span>
        <h2>{{ page.detailsTitle }}</h2>
      </div>
      <FormatList :items="page.details" />
      <div v-if="page.note" class="callout">{{ page.note }}</div>
    </div>
  </section>
</template>