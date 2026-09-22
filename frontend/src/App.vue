<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { RefreshCw } from '@lucide/vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import { contentError, contentLoading, loadSiteContent, logoUrl, publicTheme, siteContent } from './stores/content.js'

const route = useRoute()
const mainContent = ref(null)
const adminLayout = computed(() => Boolean(route.meta.admin))
const page = computed(() => siteContent.value?.pages[route.meta.page || 'notFound'])

function refreshPublicContent() {
  if (!adminLayout.value) return loadSiteContent({ force: true })
}

watch(() => route.fullPath, async () => {
  await refreshPublicContent()
  await nextTick()
  mainContent.value?.focus({ preventScroll: true })
})

watchEffect(() => {
  document.title = adminLayout.value ? route.meta.title : page.value?.metaTitle || 'American Badminton Premier League'
  document.querySelector('meta[name="description"]')?.setAttribute('content', adminLayout.value ? '' : page.value?.metaDescription || '')
  document.querySelector('link[rel="icon"]')?.setAttribute('href', logoUrl.value)
  let robots = document.querySelector('meta[name="robots"]')
  if (!robots) {
    robots = document.createElement('meta')
    robots.name = 'robots'
    document.head.appendChild(robots)
  }
  robots.content = adminLayout.value ? 'noindex, nofollow' : 'index, follow'
})

onMounted(() => {
  if (!adminLayout.value) loadSiteContent()
  window.addEventListener('focus', refreshPublicContent)
})
onBeforeUnmount(() => window.removeEventListener('focus', refreshPublicContent))
</script>

<template>
  <RouterView v-if="adminLayout" />
  <div v-else-if="siteContent" class="public-site" :class="{ 'motion-disabled': !siteContent.appearance.motionEnabled }" :style="publicTheme">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div :key="route.path" id="page-loader" aria-hidden="true"></div>
    <SiteHeader />
    <main id="main-content" ref="mainContent" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="route.path" />
      </RouterView>
      <section v-if="page?.ctaEnabled" class="cta-banner">
        <div class="wrap">
          <h2>{{ page.ctaTitle }}</h2>
          <span class="cta-ring"><a class="btn btn-gold" :href="`mailto:${siteContent.site.contactEmail}`">{{ page.ctaLabel }}</a></span>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
  <main v-else class="site-status" :aria-busy="contentLoading">
    <img :src="logoUrl" alt="ABPL crest" width="80" height="80" />
    <h1>{{ contentError ? 'Temporarily Unavailable' : 'American Badminton Premier League' }}</h1>
    <p role="status">{{ contentError || 'Loading...' }}</p>
    <button v-if="contentError" class="btn btn-gold" type="button" :disabled="contentLoading" @click="loadSiteContent({ force: true })"><RefreshCw :size="18" aria-hidden="true" /> Try Again</button>
  </main>
</template>
