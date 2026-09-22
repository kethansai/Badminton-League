<script setup>
import { ref } from 'vue'
import { Eye, EyeOff, LogIn } from '@lucide/vue'
import { signIn } from '../../services/api.js'

const emit = defineEmits(['signed-in'])
const username = ref('')
const password = ref('')
const visible = ref(false)
const busy = ref(false)
const error = ref('')

async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await signIn(username.value, password.value)
    password.value = ''
    emit('signed-in')
  } catch (failure) {
    error.value = failure.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="submit">
    <div class="editor-field">
      <label for="admin-username">Username</label>
      <input id="admin-username" v-model="username" name="username" autocomplete="username" required maxlength="100" :disabled="busy" autofocus />
    </div>
    <div class="editor-field">
      <label for="admin-password">Password</label>
      <div class="password-field">
        <input id="admin-password" v-model="password" name="password" :type="visible ? 'text' : 'password'" autocomplete="current-password" required maxlength="256" :disabled="busy" />
        <button class="icon-button" type="button" :title="visible ? 'Hide password' : 'Show password'" :aria-label="visible ? 'Hide password' : 'Show password'" :aria-pressed="visible" @click="visible = !visible"><EyeOff v-if="visible" :size="18" aria-hidden="true" /><Eye v-else :size="18" aria-hidden="true" /></button>
      </div>
    </div>
    <p v-if="error" class="admin-notice error" role="alert">{{ error }}</p>
    <button class="admin-button primary" type="submit" :disabled="busy"><LogIn :size="18" aria-hidden="true" />{{ busy ? 'Signing In...' : 'Sign In' }}</button>
  </form>
</template>