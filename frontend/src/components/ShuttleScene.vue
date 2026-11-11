<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMediaQuery } from '../composables/useMediaQuery.js'
import shuttlePoster from '../assets/shuttle-poster.png'
import shuttlePosterMobile from '../assets/shuttle-poster-mobile.png'

const props = defineProps({ active: { type: Boolean, default: false } })
const canvas = ref(null)
const ready = ref(false)
const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
let scene
let resizeObserver
let surface
let disposed = false

function measure() {
  if (!surface) return
  const bounds = surface.getBoundingClientRect()
  const text = [...surface.querySelectorAll('h1, .tagline, .lede')]
  const top = Math.max(...text.map((element) => element.getBoundingClientRect().bottom)) - bounds.top + 16
  const bottom = (surface.querySelector('.hero-actions')?.getBoundingClientRect().top ?? bounds.bottom - 80) - bounds.top - 16
  canvas.value?.parentElement.style.setProperty('--poster-top', `${top}px`)
  canvas.value?.parentElement.style.setProperty('--poster-height', `${Math.max(0, bottom - top)}px`)
  scene?.resize(surface.clientWidth, surface.clientHeight, { top, bottom })
}

function move(event) {
  if (!props.active || !finePointer.value || event.pointerType === 'touch') return
  const bounds = surface.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return
  scene?.setPointer((event.clientX - bounds.left) / bounds.width * 2 - 1, (event.clientY - bounds.top) / bounds.height * 2 - 1)
}

function resetPointer() {
  scene?.setPointer(0, 0)
}

function contextLost(event) {
  event.preventDefault()
  ready.value = false
  scene?.setActive(false)
}

watch(() => props.active, (active) => scene?.setActive(active))
watch(finePointer, resetPointer)

onMounted(async () => {
  surface = canvas.value.closest('.hero')
  measure()
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(surface)
    resizeObserver.observe(surface.querySelector('.hero-inner'))
  }
  if (!window.WebGL2RenderingContext) return
  try {
    const [{ createShuttleScene }, { gsap }] = await Promise.all([import('../graphics/shuttle.js'), import('gsap')])
    if (disposed || !canvas.value) return
    scene = createShuttleScene(canvas.value, gsap)
    measure()
    canvas.value.addEventListener('webglcontextlost', contextLost)
    surface.addEventListener('pointermove', move, { passive: true })
    surface.addEventListener('pointerleave', resetPointer)
    ready.value = true
    scene.setActive(props.active)
  } catch {
    scene?.dispose()
    scene = undefined
    ready.value = false
  }
})

onBeforeUnmount(() => {
  disposed = true
  resizeObserver?.disconnect()
  canvas.value?.removeEventListener('webglcontextlost', contextLost)
  surface?.removeEventListener('pointermove', move)
  surface?.removeEventListener('pointerleave', resetPointer)
  scene?.dispose()
})

defineExpose({
  setProgress: (progress) => scene?.setProgress(progress),
  captureFrame: () => scene?.capture(),
})
</script>

<template>
  <div class="shuttle-scene" :data-renderer="ready ? 'webgl' : 'fallback'" aria-hidden="true">
    <picture v-show="!ready">
      <source media="(max-width: 960px)" :srcset="shuttlePosterMobile" width="655" height="493" />
      <img class="shuttle-poster" :src="shuttlePoster" alt="" width="704" height="677" />
    </picture>
    <canvas ref="canvas" :class="{ ready }"></canvas>
  </div>
</template>