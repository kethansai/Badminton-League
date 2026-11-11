<script setup>
import { ref } from 'vue'
import PageHero from '../components/PageHero.vue'
import { photography } from '../data/photography.js'
import { usePhotoParallax } from '../composables/usePhotoParallax.js'
import { vMediaReady } from '../directives/mediaReady.js'
import { vReveal } from '../directives/reveal.js'
import { usePageContent } from '../stores/content.js'
const page = usePageContent('home')
const images = [photography.doubles, photography.smash, photography.court]
const preview = ref(null)
usePhotoParallax(preview)
</script>

<template>
  <PageHero :title="page.heroTitle" :intro="page.heroIntro" :tagline="page.tagline" :preview-visible="page.sectionVisible" home />
  <section v-if="page.sectionVisible" id="league-preview" ref="preview" class="section-alt home-preview">
    <div class="wrap">
      <div v-reveal class="section-head">
        <h2>{{ page.sectionTitle }}</h2>
        <p class="section-caption">{{ page.sectionLabel }}</p>
      </div>
      <div class="story-grid">
        <article v-for="(preview, index) in page.cards" :key="preview.id" v-reveal="index" class="story-piece">
          <figure v-media-ready class="story-photograph">
            <img :src="images[index % images.length].src" :alt="images[index % images.length].alt" :width="images[index % images.length].width" :height="images[index % images.length].height" :data-photo-depth="index % images.length === 1 ? 'portrait' : 'wide'" loading="lazy" />
          </figure>
          <div class="story-copy">
            <p class="photo-context"><a :href="images[index % images.length].source" target="_blank" rel="noopener noreferrer">{{ images[index % images.length].title }}</a>. Reference photography, not ABPL.</p>
            <h3>{{ preview.title }}</h3>
            <span v-if="preview.tag" class="story-status">{{ preview.tag }}</span>
            <p>{{ preview.description }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>