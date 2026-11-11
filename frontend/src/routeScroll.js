// Lets the router wait for the route curtain to cover the outgoing page before resetting scroll,
// so the old page never visibly jumps to the top mid-transition.
let pending = null
let release = () => {}

export function holdRouteScroll() {
  if (pending) return
  pending = new Promise((resolve) => { release = resolve })
}

export function releaseRouteScroll() {
  release()
  pending = null
  release = () => {}
}

export function routeScrollReady() {
  return pending || Promise.resolve()
}
