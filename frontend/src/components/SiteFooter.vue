<script setup>
import { RouterLink } from 'vue-router'
import { photography } from '../data/photography.js'
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
    <p class="wrap photo-context site-photo-context">Reference badminton photography, not ABPL events or participants. Images are cropped and color-treated for this site.</p>
    <details class="wrap image-credits">
      <summary>Asset credits</summary>
      <ul>
        <li v-for="image in photography" :key="image.source"><a :href="image.source" target="_blank" rel="noopener noreferrer">{{ image.title }}</a> by {{ image.author }}. <a :href="image.licenseUrl" target="_blank" rel="noopener noreferrer">{{ image.license }}</a>.</li>
      </ul>
      <p>Self-hosted fonts: <a href="/font-license-anton.txt" target="_blank" rel="noopener noreferrer">Anton</a>, <a href="/font-license-barlow.txt" target="_blank" rel="noopener noreferrer">Barlow</a>, and <a href="/font-license-barlow-condensed.txt" target="_blank" rel="noopener noreferrer">Barlow Condensed</a>.</p>
    </details>
  </footer>
</template>