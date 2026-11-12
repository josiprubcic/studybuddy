import { useSyncExternalStore } from 'react'

// shortcut: a two-route history router; switch to a router library when routes get parameters or nesting.

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

/** The current path, re-rendering on navigation and on the browser's back/forward. */
export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname)
}

export function navigate(to: string) {
  if (to === window.location.pathname + window.location.search) return
  window.history.pushState(null, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}
