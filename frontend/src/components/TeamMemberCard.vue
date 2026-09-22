<script setup>
import { computed, ref, watch } from 'vue'
import { Info, RotateCcw, UserRound } from '@lucide/vue'
import { useMediaQuery } from '../composables/useMediaQuery.js'

const props = defineProps({ member: { type: Object, required: true } })
const flipped = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const finePointer = useMediaQuery('(pointer: fine)')
const bioId = computed(() => `bio-${props.member.id}`)
const actionLabel = computed(() => `${flipped.value ? 'Hide' : 'Read'} biography for ${props.member.name || props.member.title}`)

function resetTilt() {
  tiltX.value = 0
  tiltY.value = 0
}

function tiltCard(event) {
  if (flipped.value || reducedMotion.value || !finePointer.value) return
  const bounds = event.currentTarget.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return
  tiltY.value = ((event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2)) * 10
  tiltX.value = -((event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2)) * 10
}

function toggleCard() {
  resetTilt()
  flipped.value = !flipped.value
}

function showFront() {
  resetTilt()
  flipped.value = false
}

watch([reducedMotion, finePointer], resetTilt)
</script>

<template>
  <article
    class="flip-card"
    :class="{ flipped }"
    :style="{ '--tilt-x': `${tiltX}deg`, '--tilt-y': `${tiltY}deg` }"
    @pointermove="tiltCard"
    @pointerleave="resetTilt"
  >
    <div class="flip-inner">
      <div class="flip-face flip-front" :aria-hidden="flipped" :inert="flipped ? '' : undefined">
        <img v-if="member.imageUrl" class="avatar-photo" :src="member.imageUrl" :alt="member.imageAlt || member.name || member.title" loading="lazy" />
        <div v-else class="avatar-outline"><UserRound :size="88" :stroke-width="1" aria-hidden="true" /></div>
        <div class="front-body">
          <span class="tag">{{ member.tag }}</span>
          <h3>{{ member.name || member.title }}</h3>
          <p v-if="member.name" class="member-role">{{ member.title }}</p>
        </div>
      </div>
      <div :id="bioId" class="flip-face flip-back" :aria-hidden="!flipped" :inert="!flipped ? '' : undefined">
        <h3>{{ member.name || member.title }}</h3>
        <p>{{ member.bio }}</p>
      </div>
    </div>
    <button
      class="flip-toggle"
      type="button"
      :aria-label="actionLabel"
      :title="actionLabel"
      :aria-expanded="flipped"
      :aria-controls="bioId"
      :aria-describedby="flipped ? bioId : undefined"
      @click="toggleCard"
      @keydown.esc.prevent="showFront"
    >
      <RotateCcw v-if="flipped" :size="20" aria-hidden="true" />
      <Info v-else :size="20" aria-hidden="true" />
    </button>
  </article>
</template>