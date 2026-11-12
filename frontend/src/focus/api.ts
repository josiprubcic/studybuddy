import { request } from '../api/http'
import type { FinishedBlock } from './timer'

export type FocusSummary = { completedFocusBlocks: number; focusSeconds: number }

export function saveFocusSession(b: FinishedBlock): Promise<unknown> {
  return request('/api/focus-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: b.type,
      startedAt: new Date(b.startedAt).toISOString(),
      durationSeconds: b.durationSeconds,
      completed: b.completed,
    }),
  })
}

/** Today in the student's own timezone: local midnight to the next local midnight. */
export function getTodaySummary(signal?: AbortSignal): Promise<FocusSummary> {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + 1)
  const q = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() })
  return request(`/api/focus-sessions/summary?${q}`, { signal })
}
