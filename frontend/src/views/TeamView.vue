<script setup>
import PageHero from '../components/PageHero.vue'
import TeamMemberCard from '../components/TeamMemberCard.vue'
import { usePageContent } from '../stores/content.js'
import { vReveal } from '../directives/reveal.js'
const page = usePageContent('team')
</script>

<template>
  <PageHero :title="page.heroTitle" :intro="page.heroIntro" />
  <section class="section-alt">
    <div class="wrap">
      <div v-reveal class="section-head"><h2>{{ page.sectionTitle }}</h2></div>
      <div v-if="page.members.length" class="card-grid">
        <TeamMemberCard v-for="(member, index) in page.members" :key="member.id" v-reveal="index" :member="member" />
      </div>
      <p v-else>{{ page.emptyMessage }}</p>
      <div v-if="page.note" class="callout">{{ page.note }}</div>
    </div>
  </section>
</template>