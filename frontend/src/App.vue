<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { ArrowUpRight, RefreshCw } from '@lucide/vue'
import AmbientField from './components/AmbientField.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteSkeleton from './components/SiteSkeleton.vue'
import { useMediaQuery } from './composables/useMediaQuery.js'
import { usePointerEffects } from './composables/usePointerEffects.js'
import { useScrollScenes } from './composables/useScrollScenes.js'
import { contentError, contentLoading, contentRevision, loadSiteContent, logoUrl, publicTheme, siteContent } from './stores/content.js'
import { holdRouteScroll, releaseRouteScroll } from './routeScroll.js'
import { startBootLoader } from './bootLoader.js'

const route = useRoute()
const mainContent = ref(null)
const routeStage = ref(null)
const publicRoot = ref(null)
const cursor = ref(null)
const { resetPointerEffects } = usePointerEffects(publicRoot, cursor)
const curtainState = ref('idle')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const adminLayout = computed(() => Boolean(route.meta.admin))
const page = computed(() => siteContent.value?.pages[route.meta.page || 'notFound'])
// null while a route is leaving; bumped once the next route has entered so scroll scenes bind to fresh DOM.
const sceneRevision = ref(0)
let scenesBuilt = 0
useScrollScenes(publicRoot, computed(() => sceneRevision.value === null ? null : `${sceneRevision.value}:${contentRevision.value}`))
const stopBootLoader = startBootLoader(computed(() => adminLayout.value || Boolean(siteContent.value) || Boolean(contentError.value)))

function refreshPublicContent() {
  if (!adminLayout.value) return loadSiteContent({ force: true })
}

function holdRouteHeight(element) {
  if (routeStage.value) routeStage.value.style.minHeight = `${element.offsetHeight}px`
  element.setAttribute('inert', '')
  element.setAttribute('aria-hidden', 'true')
  sceneRevision.value = null
  if (reducedMotion.value) return
  // The curtain covers the outgoing page; the router resets scroll only once it is hidden.
  curtainState.value = 'cover'
  holdRouteScroll()
}

function revealRoute() {
  releaseRouteScroll()
  if (curtainState.value === 'cover') curtainState.value = 'reveal'
}

function settleCurtain() {
  if (curtainState.value === 'reveal') curtainState.value = 'idle'
}

function finishRouteTransition(element) {
  releaseRouteScroll()
  routeStage.value?.style.removeProperty('min-height')
  element?.removeAttribute('inert')
  element?.removeAttribute('aria-hidden')
  mainContent.value?.focus({ preventScroll: true })
  sceneRevision.value = ++scenesBuilt
}

function cancelRouteLeave(element) {
  revealRoute()
  finishRouteTransition(element)
}

watch(reducedMotion, (reduced) => {
  if (!reduced) return
  releaseRouteScroll()
  curtainState.value = 'idle'
})

watch(() => route.fullPath, async () => {
  resetPointerEffects()
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
onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshPublicContent)
  stopBootLoader()
})
</script>

<template>
  <RouterView v-if="adminLayout" />
  <div v-else-if="siteContent" ref="publicRoot" class="public-site" :class="{ 'motion-disabled': !siteContent.appearance.motionEnabled }" :style="publicTheme">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div ref="cursor" class="cursor-follower" aria-hidden="true"><span></span></div>
    <div class="scroll-progress" aria-hidden="true"></div>
    <div class="route-curtain" :data-state="curtainState" aria-hidden="true" @transitionend.self="settleCurtain"></div>
    <SiteHeader />
    <main id="main-content" ref="mainContent" tabindex="-1">
      <div ref="routeStage" class="route-stage">
        <RouterView v-slot="{ Component }">
          <Transition name="route" mode="out-in" :css="!reducedMotion" @before-leave="holdRouteHeight" @after-leave="revealRoute" @after-enter="finishRouteTransition" @enter-cancelled="finishRouteTransition" @leave-cancelled="cancelRouteLeave">
            <div :key="route.path" class="route-view"><component :is="Component" /></div>
          </Transition>
        </RouterView>
      </div>
      <section v-if="page?.ctaEnabled" class="cta-banner">
        <AmbientField :density="0.8" />
        <div class="wrap">
          <h2>{{ page.ctaTitle }}</h2>
          <span class="cta-ring"><a class="btn btn-gold" :href="`mailto:${siteContent.site.contactEmail}`">{{ page.ctaLabel }}<ArrowUpRight :size="18" aria-hidden="true" /></a></span>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
  <SiteSkeleton v-else-if="contentLoading || !contentError" :page="route.meta.page || 'home'" />
  <main v-else class="site-status" :aria-busy="contentLoading">
    <img :src="logoUrl" alt="ABPL crest" width="80" height="80" />
    <h1>{{ contentError ? 'Temporarily Unavailable' : 'American Badminton Premier League' }}</h1>
    <p role="status">{{ contentError || 'Loading...' }}</p>
    <button v-if="contentError" class="btn btn-gold" type="button" :disabled="contentLoading" @click="loadSiteContent({ force: true })"><RefreshCw :size="18" aria-hidden="true" /> Try Again</button>
  </main>
</template>
