<script setup>
import PageHero from '../components/PageHero.vue'
import { vReveal } from '../directives/reveal.js'
import { usePageContent } from '../stores/content.js'
const page = usePageContent('home')
</script>

<template>
  <PageHero :title="page.heroTitle" :intro="page.heroIntro" :tagline="page.tagline" home />
  <section v-if="page.sectionVisible" class="section-alt">
    <div class="wrap">
      <div v-reveal class="section-head">
        <span class="eyebrow">{{ page.sectionLabel }}</span>
        <h2>{{ page.sectionTitle }}</h2>
      </div>
      <div class="card-grid">
        <article v-for="(preview, index) in page.cards" :key="preview.id" v-reveal="index" class="card">
          <span v-if="preview.tag" class="tag">{{ preview.tag }}</span>
          <h3>{{ preview.title }}</h3>
          <p>{{ preview.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>