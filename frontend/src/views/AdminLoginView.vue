<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLoginForm from '../components/admin/AdminLoginForm.vue'
import { loadSiteContent, logoUrl, site } from '../stores/content.js'
import '../assets/admin.css'

const router = useRouter()
const route = useRoute()
onMounted(() => loadSiteContent())
</script>

<template>
  <main class="admin-app admin-login">
    <a href="/" class="admin-brand">
      <img :src="logoUrl" alt="League crest" width="48" height="48" />
      <span>{{ site?.name || 'American Badminton' }}<strong>{{ site?.accentName || 'Premier League' }}</strong></span>
    </a>
    <div class="login-panel">
      <h1>Admin Sign In</h1>
      <p v-if="route.query.changed" class="admin-notice success" role="status">Password changed. Sign in with your new password.</p>
      <p v-if="route.query.reason === 'unavailable'" class="admin-notice error" role="alert">The server is unavailable. Please try signing in again.</p>
      <AdminLoginForm @signed-in="router.replace('/admin')" />
    </div>
  </main>
</template>