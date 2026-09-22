<script setup>
import { RouterLink } from 'vue-router'
import PageHero from '../components/PageHero.vue'
import { usePageContent } from '../stores/content.js'
const page = usePageContent('notFound')
</script>

<template>
  <PageHero :title="page.heroTitle" :intro="page.heroIntro" />
  <section class="section-alt">
    <div class="wrap"><RouterLink class="btn btn-gold" to="/">{{ page.linkLabel }}</RouterLink></div>
  </section>
</template>