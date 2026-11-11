<script setup>
import { ref, watch } from 'vue'
import { useViewportMotion } from '../composables/useViewportMotion.js'

const props = defineProps({ density: { type: Number, default: 1 } })
const root = ref(null)
const canvas = ref(null)
// False for reduced motion, the site motion setting, hidden tabs, and offscreen fields.
const active = useViewportMotion(root)

const FRAME_MS = 1000 / 30
const pools = [
  { color: '212, 175, 97', alpha: 0.11, x: 0.22, y: 0.35, orbit: 0.14, period: 46 },
  { color: '99, 42, 48', alpha: 0.2, x: 0.78, y: 0.62, orbit: 0.12, period: 58 },
]

function createMote(width, height, anywhere) {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : height + 4,
    radius: 0.6 + Math.random() * 1.5,
    rise: 5 + Math.random() * 11,
    sway: 4 + Math.random() * 10,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.18 + Math.random() * 0.4,
    color: Math.random() < 0.7 ? '230, 204, 147' : '247, 243, 236',
  }
}

watch(active, (running, previous, onCleanup) => {
  const element = canvas.value
  const context = running && element?.getContext('2d')
  if (!context) return

  const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
  let width = 0
  let height = 0
  let motes = []
  let frame = 0
  let previousTime = 0

  function resize() {
    width = element.clientWidth
    height = element.clientHeight
    element.width = Math.round(width * ratio)
    element.height = Math.round(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    const count = Math.round(Math.min(56, (width * height) / 16000) * props.density)
    motes = Array.from({ length: count }, (item, index) => motes[index] || createMote(width, height, true))
  }

  function draw(time) {
    frame = requestAnimationFrame(draw)
    if (time - previousTime < FRAME_MS) return
    const elapsed = previousTime ? Math.min(time - previousTime, 64) / 1000 : 0
    previousTime = time
    const seconds = time / 1000
    context.clearRect(0, 0, width, height)

    for (const pool of pools) {
      const angle = (seconds / pool.period) * Math.PI * 2
      const x = (pool.x + Math.cos(angle) * pool.orbit) * width
      const y = (pool.y + Math.sin(angle) * pool.orbit) * height
      const radius = Math.max(width, height) * 0.55
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(${pool.color}, ${pool.alpha})`)
      gradient.addColorStop(1, `rgba(${pool.color}, 0)`)
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)
    }

    for (const mote of motes) {
      mote.y -= mote.rise * elapsed
      if (mote.y < -4) Object.assign(mote, createMote(width, height, false))
      const x = mote.x + Math.sin(seconds * 0.6 + mote.phase) * mote.sway
      const twinkle = 0.65 + Math.sin(seconds * 1.3 + mote.phase) * 0.35
      context.fillStyle = `rgba(${mote.color}, ${mote.alpha * twinkle * 0.18})`
      context.beginPath()
      context.arc(x, mote.y, mote.radius * 3, 0, Math.PI * 2)
      context.fill()
      context.fillStyle = `rgba(${mote.color}, ${mote.alpha * twinkle})`
      context.beginPath()
      context.arc(x, mote.y, mote.radius, 0, Math.PI * 2)
      context.fill()
    }
  }

  const resizeObserver = window.ResizeObserver ? new ResizeObserver(resize) : null
  resize()
  resizeObserver?.observe(element)
  frame = requestAnimationFrame(draw)
  root.value?.setAttribute('data-running', '')

  onCleanup(() => {
    cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    root.value?.removeAttribute('data-running')
  })
}, { flush: 'post' })
</script>

<template>
  <div ref="root" class="ambient-field" aria-hidden="true">
    <canvas ref="canvas"></canvas>
  </div>
</template>
