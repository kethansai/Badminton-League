<script setup>
import { RouterLink } from 'vue-router'
import { logoUrl, navigation, site } from '../stores/content.js'
</script>

<template>
  <footer>
    <div class="wrap footer-grid">
      <div>
        <div class="footer-brand">
          <img :src="logoUrl" :alt="site.logoAlt" width="46" height="46" loading="lazy" />
          <span>{{ site.name }}<br />{{ site.accentName }}</span>
        </div>
        <p class="footer-tagline">{{ site.footer.tagline }}</p>
      </div>
      <div class="footer-col">
        <h4>{{ site.footer.exploreTitle }}</h4>
        <ul>
          <li v-for="item in navigation" :key="item.name"><RouterLink :to="item.path">{{ item.label }}</RouterLink></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>{{ site.footer.connectTitle }}</h4>
        <ul>
          <li v-for="link in site.footer.socialLinks" :key="link.id">
            <a v-if="link.url" :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
            <span v-else class="social-placeholder" aria-disabled="true">{{ link.label }}</span>
          </li>
          <li><a :href="`mailto:${site.contactEmail}`">{{ site.contactEmail }}</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <span>&copy; {{ site.footer.copyright }}</span>
      <span>{{ site.footer.established }}</span>
    </div>
  </footer>
</template>