// Pomodoro state machine. Pure functions over absolute timestamps (ms), so the timer stays exact
// in background tabs and across reloads. No React here; see timer.test.ts.

export type Phase = 'focus' | 'break'
export type Status = 'idle' | 'running' | 'paused'

export type TimerState = {
  phase: Phase
  status: Status
  /** Time left while idle or paused. */
  remainingMs: number
  /** When the running block ends. */
  endAt: number | null
  /** When the current block was first started (pauses don't reset it). */
  startedAt: number | null
  focusMin: number
  breakMin: number
}

export type FinishedBlock = {
  type: Phase
  startedAt: number
  durationSeconds: number
  completed: boolean
}

export const LIMITS = { focus: [1, 90], break: [1, 30] } as const
const MIN_LOGGED_MS = 60_000 // a skipped block shorter than a minute isn't worth recording

const clamp = (n: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, Math.round(n)))

export const phaseMs = (s: TimerState, phase: Phase = s.phase) => (phase === 'focus' ? s.focusMin : s.breakMin) * 60_000

export function initial(focusMin = 25, breakMin = 5): TimerState {
  const s: TimerState = {
    phase: 'focus',
    status: 'idle',
    remainingMs: 0,
    endAt: null,
    startedAt: null,
    focusMin: clamp(focusMin, LIMITS.focus),
    breakMin: clamp(breakMin, LIMITS.break),
  }
  return { ...s, remainingMs: phaseMs(s) }
}

export function remaining(s: TimerState, now: number): number {
  return s.status === 'running' && s.endAt !== null ? Math.max(0, s.endAt - now) : s.remainingMs
}

/** 0 → 1 over the current block. */
export function progress(s: TimerState, now: number): number {
  const total = phaseMs(s)
  return total ? 1 - remaining(s, now) / total : 0
}

export function start(s: TimerState, now: number): TimerState {
  if (s.status === 'running') return s
  return { ...s, status: 'running', endAt: now + s.remainingMs, startedAt: s.startedAt ?? now }
}

export function pause(s: TimerState, now: number): TimerState {
  if (s.status !== 'running') return s
  return { ...s, status: 'paused', remainingMs: remaining(s, now), endAt: null }
}

export function reset(s: TimerState): TimerState {
  return { ...s, status: 'idle', remainingMs: phaseMs(s), endAt: null, startedAt: null }
}

/** Changing lengths only applies to a block that hasn't started. */
export function setDurations(s: TimerState, focusMin: number, breakMin: number): TimerState {
  if (s.status !== 'idle') return s
  return reset({ ...s, focusMin: clamp(focusMin, LIMITS.focus), breakMin: clamp(breakMin, LIMITS.break) })
}

function nextPhase(s: TimerState): TimerState {
  const phase: Phase = s.phase === 'focus' ? 'break' : 'focus'
  return reset({ ...s, phase })
}

/** Finishes a running block whose time is up. */
export function tick(s: TimerState, now: number): { state: TimerState; finished: FinishedBlock | null } {
  if (s.status !== 'running' || s.endAt === null || now < s.endAt) return { state: s, finished: null }
  const finished: FinishedBlock = {
    type: s.phase,
    startedAt: s.startedAt ?? s.endAt - phaseMs(s),
    durationSeconds: Math.round(phaseMs(s) / 1000),
    completed: true,
  }
  return { state: nextPhase(s), finished }
}

/** Ends the current block early and moves to the other phase; logs it as incomplete if it ran a while. */
export function skip(s: TimerState, now: number): { state: TimerState; finished: FinishedBlock | null } {
  const elapsed = phaseMs(s) - remaining(s, now)
  const finished =
    s.startedAt !== null && elapsed >= MIN_LOGGED_MS
      ? { type: s.phase, startedAt: s.startedAt, durationSeconds: Math.round(elapsed / 1000), completed: false }
      : null
  return { state: nextPhase(s), finished }
}

/** "mm:ss", rounding up so the display never shows 00:00 while time is left. */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const sec = total % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** Accepts only a well-formed saved state (localStorage is untrusted input). */
export function restore(raw: unknown): TimerState | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
  if (
    (r.phase !== 'focus' && r.phase !== 'break') ||
    (r.status !== 'idle' && r.status !== 'running' && r.status !== 'paused') ||
    !num(r.remainingMs) ||
    !num(r.focusMin) ||
    !num(r.breakMin) ||
    !(r.endAt === null || num(r.endAt)) ||
    !(r.startedAt === null || num(r.startedAt)) ||
    (r.status === 'running' && r.endAt === null)
  ) {
    return null
  }
  const s = r as TimerState
  const out = { ...s, focusMin: clamp(s.focusMin, LIMITS.focus), breakMin: clamp(s.breakMin, LIMITS.break) }
  if (out.remainingMs < 0 || out.remainingMs > phaseMs(out)) return null
  return out
}
