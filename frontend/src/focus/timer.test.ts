// Run: node --test src/focus/timer.test.ts   (Node strips the TypeScript types itself)
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatClock, initial, pause, progress, remaining, reset, restore, setDurations, skip, start, tick } from './timer.ts'

const MIN = 60_000

test('a focus block runs, pauses, resumes and finishes into a break', () => {
  let s = start(initial(25, 5), 0)
  assert.equal(remaining(s, 10 * MIN), 15 * MIN)
  s = pause(s, 10 * MIN)
  assert.equal(remaining(s, 99 * MIN), 15 * MIN, 'paused time does not run')
  s = start(s, 20 * MIN)
  assert.equal(s.startedAt, 0, 'resuming keeps the original start')
  assert.equal(tick(s, 34 * MIN).finished, null, 'not finished one minute early')
  const { state, finished } = tick(s, 35 * MIN)
  assert.deepEqual(finished, { type: 'focus', startedAt: 0, durationSeconds: 25 * 60, completed: true })
  assert.equal(state.phase, 'break')
  assert.equal(state.status, 'idle')
  assert.equal(state.remainingMs, 5 * MIN)
})

test('a timer that ran out while the tab was closed finishes on the next tick', () => {
  const s = start(initial(25, 5), 0)
  const { finished } = tick(s, 3 * 60 * MIN)
  assert.equal(finished?.completed, true)
})

test('skipping logs an incomplete block only after a minute', () => {
  const s = start(initial(25, 5), 0)
  assert.equal(skip(s, 30_000).finished, null)
  const { state, finished } = skip(s, 10 * MIN)
  assert.deepEqual(finished, { type: 'focus', startedAt: 0, durationSeconds: 600, completed: false })
  assert.equal(state.phase, 'break')
  assert.equal(skip(initial(), 0).finished, null, 'an unstarted block logs nothing')
})

test('durations are clamped and only change while idle', () => {
  const s = setDurations(initial(), 500, 0)
  assert.equal(s.focusMin, 90)
  assert.equal(s.breakMin, 1)
  assert.equal(s.remainingMs, 90 * MIN)
  const running = start(initial(25, 5), 0)
  assert.equal(setDurations(running, 50, 10), running)
  assert.equal(reset(running).remainingMs, 25 * MIN)
})

test('progress and clock', () => {
  const s = start(initial(25, 5), 0)
  assert.equal(progress(s, 0), 0)
  assert.equal(progress(s, 12.5 * MIN), 0.5)
  assert.equal(formatClock(25 * MIN), '25:00')
  assert.equal(formatClock(1), '00:01', 'rounds up, never 00:00 early')
  assert.equal(formatClock(0), '00:00')
})

test('restore rejects malformed saved state', () => {
  assert.equal(restore(null), null)
  assert.equal(restore({ phase: 'nap' }), null)
  assert.equal(restore({ ...initial(), status: 'running', endAt: null }), null)
  assert.equal(restore({ ...initial(), remainingMs: -5000 }), null, 'negative time left')
  assert.equal(restore({ ...initial(25, 5), remainingMs: 26 * MIN }), null, 'more than the block length')
  assert.deepEqual(restore(initial(30, 10)), initial(30, 10))
})
