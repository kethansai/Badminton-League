<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { ChartNoAxesCombined, Check, ExternalLink, FileQuestion, House, Info, LogOut, Palette, RefreshCw, Save, Settings2, ShieldCheck, Trophy, Undo2, UsersRound } from '@lucide/vue'
import ContentFields from '../components/admin/ContentFields.vue'
import AdminLoginForm from '../components/admin/AdminLoginForm.vue'
import { editorSections, fieldId, getSectionValue } from '../admin/editor.js'
import { adminUser, apiRequest, clearSession, signOut } from '../services/api.js'
import { logoUrl, setSiteContent } from '../stores/content.js'
import '../assets/admin.css'

const router = useRouter()
const icons = { site: Settings2, appearance: Palette, home: House, about: Info, team: UsersRound, league: Trophy, stats: ChartNoAxesCombined, notFound: FileQuestion, account: ShieldCheck }
const sections = [...editorSections, { id: 'account', label: 'Account' }]
const selected = ref('site')
const section = computed(() => editorSections.find((entry) => entry.id === selected.value))
const draft = ref(null)
const baseline = ref('')
const revision = ref(0)
const updatedAt = ref('')
const loading = ref(false)
const saving = ref(false)
const uploadCount = ref(0)
const error = ref('')
const notice = ref('')
const issues = ref([])
const sessionExpired = ref(false)
const loginDialog = ref(null)
const dirty = computed(() => Boolean(draft.value) && JSON.stringify(draft.value) !== baseline.value)
const busy = computed(() => loading.value || saving.value || uploadCount.value > 0)
const activeModel = computed(() => draft.value && section.value ? getSectionValue(draft.value, section.value) : null)
const fieldErrors = computed(() => Object.fromEntries(issues.value.map((issue) => [issue.path.replace(/^content\./, ''), issue.message])))
const lastPublished = computed(() => updatedAt.value ? new Date(updatedAt.value).toLocaleString() : '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
let allowLeave = false

function installSnapshot(snapshot) {
  draft.value = structuredClone(snapshot.content)
  baseline.value = JSON.stringify(snapshot.content)
  revision.value = snapshot.revision
  updatedAt.value = snapshot.updatedAt
  setSiteContent(snapshot)
}

async function handleFailure(failure) {
  error.value = failure.message
  issues.value = failure.issues || []
  if (failure.status === 401 || failure.status === 403) {
    sessionExpired.value = true
    await nextTick()
    loginDialog.value?.showModal()
  }
}

async function loadContent() {
  loading.value = true
  error.value = ''
  issues.value = []
  try {
    installSnapshot(await apiRequest('/admin/content'))
  } catch (failure) {
    await handleFailure(failure)
  } finally {
    loading.value = false
  }
}

async function publish() {
  if (busy.value || !dirty.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  issues.value = []
  try {
    const snapshot = await apiRequest('/admin/content', { method: 'PUT', body: { content: draft.value, revision: revision.value } })
    installSnapshot(snapshot)
    notice.value = 'Changes published.'
  } catch (failure) {
    await handleFailure(failure)
  } finally {
    saving.value = false
  }
}

async function discardChanges() {
  if (dirty.value && !window.confirm('Discard unpublished edits and load the current published content?')) return
  notice.value = ''
  await loadContent()
}

async function leaveSession() {
  if (dirty.value && !window.confirm('Sign out and discard unpublished edits?')) return
  saving.value = true
  try {
    await signOut()
    allowLeave = true
    await router.replace('/admin-login')
  } catch (failure) {
    await handleFailure(failure)
  } finally {
    saving.value = false
  }
}

async function restoreSession() {
  loginDialog.value?.close()
  sessionExpired.value = false
  error.value = ''
  if (!draft.value) await loadContent()
  else notice.value = 'Signed in. Your unpublished edits are intact.'
}

async function changePassword() {
  if (busy.value) return
  error.value = ''
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'New passwords do not match.'
    return
  }
  if (dirty.value && !window.confirm('Changing your password signs you out and discards unpublished content edits. Continue?')) return
  saving.value = true
  try {
    await apiRequest('/admin/password', { method: 'POST', body: { currentPassword: currentPassword.value, newPassword: newPassword.value } })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    clearSession()
    allowLeave = true
    await router.replace('/admin-login?changed=1')
  } catch (failure) {
    error.value = failure.message
  } finally {
    saving.value = false
  }
}

async function showIssue(issue) {
  const path = issue.path.replace(/^content\./, '')
  const parts = path.split('.')
  selected.value = parts[0] === 'pages' ? parts[1] : parts[0]
  await nextTick()
  const input = document.getElementById(fieldId(path))
  let parent = input?.parentElement
  while (parent) {
    if (parent.tagName === 'DETAILS') parent.open = true
    parent = parent.parentElement
  }
  input?.focus()
}

function beforeUnload(event) {
  if (dirty.value && !allowLeave) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onBeforeRouteLeave(() => allowLeave || !dirty.value || window.confirm('Leave this page and discard unpublished edits?'))
onMounted(() => {
  loadContent()
  window.addEventListener('beforeunload', beforeUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>

<template>
  <div class="admin-app admin-dashboard">
    <header class="admin-header">
      <a href="/admin" class="admin-brand" @click.prevent="selected = 'site'">
        <img :src="logoUrl" alt="League crest" width="40" height="40" />
        <span>League Office<strong>{{ draft?.site.name || 'American Badminton' }}</strong></span>
      </a>
      <div class="admin-header-actions">
        <a class="admin-button secondary" href="/" target="_blank" rel="noopener noreferrer"><ExternalLink :size="17" aria-hidden="true" />View Site</a>
        <button class="icon-button" type="button" title="Sign out" aria-label="Sign out" :disabled="busy" @click="leaveSession"><LogOut :size="19" aria-hidden="true" /></button>
      </div>
    </header>
    <div class="admin-workspace">
      <aside class="admin-sidebar">
        <nav aria-label="Admin sections">
          <button v-for="entry in sections" :key="entry.id" type="button" :class="{ selected: selected === entry.id }" :aria-current="selected === entry.id ? 'page' : undefined" :disabled="busy" @click="selected = entry.id"><component :is="icons[entry.id]" :size="19" aria-hidden="true" />{{ entry.label }}</button>
        </nav>
        <div class="admin-identity"><ShieldCheck :size="17" aria-hidden="true" />{{ adminUser?.username }}</div>
      </aside>
      <main class="admin-main">
        <div class="admin-toolbar">
          <div>
            <h1>{{ sections.find((entry) => entry.id === selected)?.label }}</h1>
            <p class="publish-state" role="status"><span :class="['state-dot', { unsaved: dirty }]"></span>{{ dirty ? 'Unpublished changes' : 'Published' }}<span v-if="revision">Revision {{ revision }}</span></p>
          </div>
          <div v-if="draft" class="toolbar-actions">
            <button class="icon-button" type="button" title="Reload published content" aria-label="Reload published content" :disabled="busy" @click="discardChanges"><Undo2 :size="19" aria-hidden="true" /></button>
            <button class="admin-button primary" type="submit" form="content-form" :disabled="!dirty || busy"><Save :size="18" aria-hidden="true" />{{ saving ? 'Publishing...' : 'Publish Changes' }}</button>
          </div>
        </div>
        <label class="mobile-section-select">Section<select v-model="selected" :disabled="busy"><option v-for="entry in sections" :key="entry.id" :value="entry.id">{{ entry.label }}</option></select></label>
        <div class="admin-content">
          <p v-if="notice" class="admin-notice success" role="status"><Check :size="18" aria-hidden="true" />{{ notice }}</p>
          <div v-if="error" class="admin-notice error" role="alert">
            <p>{{ error }}</p>
            <ul v-if="issues.length"><li v-for="issue in issues" :key="issue.path"><button type="button" @click="showIssue(issue)">{{ issue.path.replace(/^content\./, '') }}: {{ issue.message }}</button></li></ul>
          </div>
          <p v-if="loading" class="admin-loading" role="status">Loading content...</p>
          <button v-if="!draft && !loading" class="admin-button secondary" type="button" @click="loadContent"><RefreshCw :size="18" aria-hidden="true" />Retry</button>
          <form v-if="draft" id="content-form" novalidate @submit.prevent="publish">
            <fieldset :disabled="busy || sessionExpired" class="editor-root" :hidden="selected === 'account'">
              <ContentFields v-if="section" :key="section.id" :fields="section.fields" :model="activeModel" :path="section.path" :errors="fieldErrors" @uploading="uploadCount += $event ? 1 : -1" @failure="handleFailure" />
            </fieldset>
          </form>
          <form v-if="selected === 'account'" class="account-form" @submit.prevent="changePassword">
            <h2>Change Password</h2>
            <div class="editor-field"><label for="current-password">Current password</label><input id="current-password" v-model="currentPassword" type="password" autocomplete="current-password" required maxlength="256" :disabled="busy" /></div>
            <div class="editor-field"><label for="new-password">New password</label><input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" required minlength="12" maxlength="256" :disabled="busy" /></div>
            <div class="editor-field"><label for="confirm-password">Confirm new password</label><input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" required minlength="12" maxlength="256" :disabled="busy" /></div>
            <button class="admin-button primary" type="submit" :disabled="busy"><ShieldCheck :size="18" aria-hidden="true" />{{ saving ? 'Updating...' : 'Update Password' }}</button>
          </form>
          <p v-if="updatedAt" class="last-published">Last published <time :datetime="updatedAt">{{ lastPublished }}</time></p>
        </div>
      </main>
    </div>
    <dialog ref="loginDialog" class="session-dialog" @cancel.prevent>
      <h2>Sign In Again</h2>
      <p>Your unpublished edits are intact.</p>
      <AdminLoginForm v-if="sessionExpired" @signed-in="restoreSession" />
    </dialog>
  </div>
</template>