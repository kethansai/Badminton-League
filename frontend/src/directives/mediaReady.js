const cleanups = new WeakMap()

// Marks a photo frame as loading until its image settles so CSS can show a shimmer placeholder.
export const vMediaReady = {
  mounted(frame) {
    const image = frame.querySelector('img')
    if (!image || (image.complete && image.naturalWidth)) return

    function settle() {
      frame.dataset.media = 'ready'
      cleanups.get(frame)?.()
    }

    image.addEventListener('load', settle)
    image.addEventListener('error', settle)
    cleanups.set(frame, () => {
      image.removeEventListener('load', settle)
      image.removeEventListener('error', settle)
      cleanups.delete(frame)
    })
    frame.dataset.media = 'loading'
  },
  beforeUnmount(frame) {
    cleanups.get(frame)?.()
  },
}
