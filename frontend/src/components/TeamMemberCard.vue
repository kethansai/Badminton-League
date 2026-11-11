<script setup>
import { computed, ref } from 'vue'
import { ArrowUpRight, RotateCcw } from '@lucide/vue'

const props = defineProps({ member: { type: Object, required: true } })
const flipped = ref(false)
const bioId = computed(() => `bio-${props.member.id}`)
const actionLabel = computed(() => `${flipped.value ? 'Hide' : 'Read'} biography for ${props.member.name || props.member.title}`)
const initials = computed(() => (props.member.name || props.member.title).split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).slice(0, 2).map((word) => word[0]).join(''))

function toggleCard() {
  flipped.value = !flipped.value
}

function showFront() {
  flipped.value = false
}
</script>

<template>
  <article class="flip-card" :class="{ flipped, 'member-placeholder': !member.imageUrl }">
    <div class="flip-inner">
      <div class="flip-face flip-front" :aria-hidden="flipped" :inert="flipped ? '' : undefined">
        <img v-if="member.imageUrl" class="avatar-photo" :src="member.imageUrl" :alt="member.imageAlt || member.name || member.title" loading="lazy" />
        <div v-else class="avatar-outline"><span class="member-initials" aria-hidden="true">{{ initials }}</span></div>
        <div class="front-body">
          <h3>{{ member.name || member.title }}</h3>
          <span class="tag">{{ member.tag }}</span>
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
      <ArrowUpRight v-else :size="20" aria-hidden="true" />
    </button>
  </article>
</template>