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
        <h2>{{ page.sectionTitle }}</h2>
        <p class="section-caption">{{ page.sectionLabel }}</p>
      </div>
      <div v-if="page.franchises.length" class="card-grid franchise-grid">
        <article v-for="(franchise, index) in page.franchises" :key="franchise.id" v-reveal="index" class="card">
          <img v-if="franchise.imageUrl" class="franchise-image" :src="franchise.imageUrl" :alt="franchise.imageAlt || franchise.city" loading="lazy" />
          <h3>{{ franchise.city }}</h3>
          <span v-if="franchise.tag" class="tag">{{ franchise.tag }}</span>
          <p>{{ franchise.team }}</p>
        </article>
      </div>
      <p v-else>{{ page.emptyMessage }}</p>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div v-reveal class="section-head">
        <h2>{{ page.detailsTitle }}</h2>
        <p class="section-caption">{{ page.detailsLabel }}</p>
      </div>
      <FormatList :items="page.details" :numbered="false" />
      <div v-if="page.note" class="callout">{{ page.note }}</div>
    </div>
  </section>
</template>