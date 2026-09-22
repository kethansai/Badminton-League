<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Menu, X } from '@lucide/vue'
import { logoUrl, navigation, site } from '../stores/content.js'
import { useMediaQuery } from '../composables/useMediaQuery.js'

const route = useRoute()
const menuOpen = ref(false)
const toggle = ref(null)
const mobile = useMediaQuery('(max-width: 960px)')

function closeMenu(restoreFocus = false) {
  menuOpen.value = false
  if (restoreFocus) toggle.value?.focus()
}

watch(() => route.fullPath, () => closeMenu())
watch(mobile, () => closeMenu())
</script>

<template>
  <nav class="site-nav" aria-label="Primary navigation" @keydown.esc="closeMenu(true)">
    <div class="wrap">
      <RouterLink to="/" class="brand" @click="closeMenu()">
        <img :src="logoUrl" :alt="site.logoAlt" width="42" height="42" />
        <span>{{ site.name }} <em>{{ site.accentName }}</em></span>
      </RouterLink>
      <button
        ref="toggle"
        class="nav-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="primary-links"
        :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        :title="menuOpen ? 'Close menu' : 'Open menu'"
        @click="menuOpen = !menuOpen"
      >
        <X v-if="menuOpen" :size="22" aria-hidden="true" />
        <Menu v-else :size="22" aria-hidden="true" />
      </button>
      <div id="primary-links" class="nav-links" :class="{ open: menuOpen }" :inert="mobile && !menuOpen ? '' : undefined">
        <RouterLink v-for="item in navigation" :key="item.name" :to="item.path" @click="closeMenu()">
          {{ item.label }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>