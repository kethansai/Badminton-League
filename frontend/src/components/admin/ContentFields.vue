<script setup>
import { nextTick, reactive, ref } from 'vue'
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from '@lucide/vue'
import { fieldId, makeCollectionItem } from '../../admin/editor.js'
import { uploadImage } from '../../services/api.js'

const props = defineProps({
  fields: { type: Array, required: true },
  model: { type: Object, required: true },
  path: { type: String, required: true },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['uploading', 'failure'])
const fieldsRoot = ref(null)
const uploading = ref('')
const uploadErrors = reactive({})

function fullPath(entry) {
  return entry.key ? `${props.path}.${entry.key}` : props.path
}

function errorFor(entry) {
  return uploadErrors[entry.key] || props.errors[fullPath(entry)]
}

function moveItem(entry, index, direction) {
  const items = props.model[entry.key]
  const destination = index + direction
  if (destination < 0 || destination >= items.length) return
  const [item] = items.splice(index, 1)
  items.splice(destination, 0, item)
}

async function addItem(entry) {
  const item = makeCollectionItem(entry.fields)
  props.model[entry.key].push(item)
  await nextTick()
  const details = fieldsRoot.value?.querySelector(`[data-item-id="${item.id}"]`)
  if (details) {
    details.open = true
    details.querySelector('input:not([type="file"]), textarea, select')?.focus()
  }
}

async function chooseImage(entry, event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploadErrors[entry.key] = ''
  if (file.size > 5 * 1024 * 1024) {
    uploadErrors[entry.key] = 'Choose an image smaller than 5 MB.'
    event.target.value = ''
    return
  }
  uploading.value = entry.key
  emit('uploading', true)
  try {
    props.model[entry.key] = await uploadImage(file)
  } catch (error) {
    uploadErrors[entry.key] = error.message
    emit('failure', error)
  } finally {
    uploading.value = ''
    event.target.value = ''
    emit('uploading', false)
  }
}
</script>

<template>
  <div ref="fieldsRoot" class="editor-fields">
    <template v-for="entry in fields" :key="entry.key || entry.label">
      <fieldset v-if="entry.type === 'group'" class="editor-group">
        <legend>{{ entry.label }}</legend>
        <ContentFields :fields="entry.fields" :model="entry.key ? model[entry.key] : model" :path="fullPath(entry)" :errors="errors" @uploading="emit('uploading', $event)" @failure="emit('failure', $event)" />
      </fieldset>
      <div v-else-if="entry.type === 'collection'" class="editor-collection">
        <div class="collection-heading">
          <h2>{{ entry.label }} <span class="item-count">{{ model[entry.key].length }}</span></h2>
          <button v-if="!entry.fixed" class="admin-button secondary" type="button" :disabled="model[entry.key].length >= entry.max" :aria-label="`Add to ${entry.label}`" @click="addItem(entry)"><Plus :size="18" aria-hidden="true" /> Add</button>
        </div>
        <p v-if="errors[fullPath(entry)]" class="field-error" role="alert">{{ errors[fullPath(entry)] }}</p>
        <p v-if="!model[entry.key].length" class="empty-list">No items.</p>
        <details v-for="(item, index) in model[entry.key]" :key="item.id" class="collection-item" :open="index === 0" :data-item-id="item.id">
          <summary><span>{{ item.name || item.title || item.city || item.label || item.text || `Item ${index + 1}` }}</span></summary>
          <div class="item-tools">
            <button class="icon-button" type="button" :disabled="index === 0" title="Move up" aria-label="Move up" @click="moveItem(entry, index, -1)"><ArrowUp :size="18" aria-hidden="true" /></button>
            <button class="icon-button" type="button" :disabled="index === model[entry.key].length - 1" title="Move down" aria-label="Move down" @click="moveItem(entry, index, 1)"><ArrowDown :size="18" aria-hidden="true" /></button>
            <button v-if="!entry.fixed" class="icon-button danger-text" type="button" title="Remove item" aria-label="Remove item" @click="model[entry.key].splice(index, 1)"><Trash2 :size="18" aria-hidden="true" /></button>
          </div>
          <ContentFields :fields="entry.fields" :model="item" :path="`${fullPath(entry)}.${index}`" :errors="errors" @uploading="emit('uploading', $event)" @failure="emit('failure', $event)" />
        </details>
      </div>
      <div v-else class="editor-field" :class="{ 'field-wide': ['textarea', 'image'].includes(entry.type), 'checkbox-field': entry.type === 'checkbox' }">
        <template v-if="entry.type === 'checkbox'">
          <input :id="fieldId(fullPath(entry))" v-model="model[entry.key]" type="checkbox" :data-content-path="fullPath(entry)" />
          <label :for="fieldId(fullPath(entry))">{{ entry.label }}</label>
        </template>
        <template v-else>
          <label :for="fieldId(fullPath(entry))">{{ entry.label }}<span v-if="entry.required" aria-hidden="true"> *</span></label>
          <textarea v-if="entry.type === 'textarea'" :id="fieldId(fullPath(entry))" v-model="model[entry.key]" :rows="entry.rows || 4" :required="entry.required" :maxlength="entry.maxLength" :aria-invalid="Boolean(errorFor(entry))" :aria-describedby="errorFor(entry) ? `${fieldId(fullPath(entry))}-error` : undefined" :data-content-path="fullPath(entry)"></textarea>
          <select v-else-if="entry.type === 'select'" :id="fieldId(fullPath(entry))" v-model="model[entry.key]" :data-content-path="fullPath(entry)"><option v-for="option in entry.options" :key="option">{{ option }}</option></select>
          <div v-else-if="entry.type === 'color'" class="color-field">
            <input v-model="model[entry.key]" type="color" :aria-label="`${entry.label} swatch`" />
            <input :id="fieldId(fullPath(entry))" v-model="model[entry.key]" type="text" required pattern="#[0-9a-fA-F]{6}" maxlength="7" :data-content-path="fullPath(entry)" :aria-invalid="Boolean(errorFor(entry))" />
          </div>
          <template v-else-if="entry.type === 'image'">
            <input :id="fieldId(fullPath(entry))" v-model="model[entry.key]" type="text" inputmode="url" :maxlength="entry.maxLength" :data-content-path="fullPath(entry)" :aria-invalid="Boolean(errorFor(entry))" />
            <div class="image-field">
              <img v-if="model[entry.key]" :src="model[entry.key]" :alt="`${entry.label} preview`" />
              <label class="admin-button secondary upload-button" :class="{ busy: uploading === entry.key }">
                <Upload :size="18" aria-hidden="true" />{{ uploading === entry.key ? 'Uploading...' : 'Upload Image' }}
                <input type="file" accept="image/png,image/jpeg,image/webp" :aria-label="`Upload ${entry.label}`" :disabled="Boolean(uploading)" @change="chooseImage(entry, $event)" />
              </label>
              <button v-if="model[entry.key]" class="icon-button danger-text" type="button" :aria-label="`Remove ${entry.label}`" title="Remove image" @click="model[entry.key] = ''"><Trash2 :size="18" aria-hidden="true" /></button>
            </div>
          </template>
          <input v-else :id="fieldId(fullPath(entry))" v-model="model[entry.key]" :type="entry.type" :required="entry.required" :maxlength="entry.maxLength || 12000" :aria-invalid="Boolean(errorFor(entry))" :aria-describedby="errorFor(entry) ? `${fieldId(fullPath(entry))}-error` : undefined" :data-content-path="fullPath(entry)" />
        </template>
        <p v-if="errorFor(entry)" :id="`${fieldId(fullPath(entry))}-error`" class="field-error" role="alert">{{ errorFor(entry) }}</p>
      </div>
    </template>
  </div>
</template>