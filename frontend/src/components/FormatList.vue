<script setup>
import { vReveal } from '../directives/reveal.js'

defineProps({ items: { type: Array, required: true } })
</script>

<template>
  <div class="format-list">
    <div v-for="(item, index) in items" :key="item.title" v-reveal="index" class="format-item">
      <span class="num" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
      <div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>