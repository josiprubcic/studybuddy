import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Ctx, type Pomodoro } from './usePomodoro'
import { getTodaySummary, saveFocusSession } from './api'
import * as T from './timer'

const STORAGE_KEY = 'studybuddy.pomodoro'
const LOGGED_KEY = 'studybuddy.pomodoro.lastLogged' // shared by all open tabs, so a block is saved once

function load(): T.TimerState {
  try {
    const saved = T.restore(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'))
    if (saved) return saved
  } catch {
    // private mode or corrupted value: start fresh
  }
  return T.initial()
}

/** A short two-note chime; silent if the browser blocks audio. */
function chime(phaseEnded: T.Phase) {
  try {
    const ctx = new AudioContext()
    const notes = phaseEnded === 'focus' ? [660, 880] : [880, 660]
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = f
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.22
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.4)
    })
    setTimeout(() => ctx.close(), 1200)
  } catch {
    // no audio available
  }
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<T.TimerState>(load)
  const [now, setNow] = useState(() => Date.now())
  const [todayBlocks, setTodayBlocks] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const logged = useRef(new Set<string>()) // StrictMode runs effects twice; never send a block twice

  const refreshToday = useCallback(() => {
    getTodaySummary()
      .then((s) => setTodayBlocks(s.completedFocusBlocks))
      .catch(() => {}) // the count is a nicety; the timer works without the server
  }, [])

  const record = useCallback(
    (b: T.FinishedBlock | null) => {
      if (!b) return
      const key = `${b.type}:${b.startedAt}`
      if (logged.current.has(key)) return
      logged.current.add(key)
      try {
        if (localStorage.getItem(LOGGED_KEY) === key) return // another tab already saved it
        localStorage.setItem(LOGGED_KEY, key)
      } catch {
        // storage unavailable: fall back to this tab's own guard
      }
      saveFocusSession(b)
        .then(() => b.type === 'focus' && b.completed && refreshToday())
        .catch(() => setAnnouncement('Blok nije spremljen. Provjeri vezu.'))
    },
    [refreshToday],
  )

  useEffect(refreshToday, [refreshToday])

  // Clock: tick a few times a second only while running.
  useEffect(() => {
    if (state.status !== 'running') return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [state.status])

  // Finish a block whose time is up (also right after a reload, if it ran out meanwhile).
  useEffect(() => {
    const { state: next, finished } = T.tick(state, now)
    if (!finished) return
    // oxlint-disable-next-line react/set-state-in-effect -- finishing reacts to the clock and to a reload; it can't come from an event
    setState(next)
    record(finished)
    chime(finished.type)
    setAnnouncement(finished.type === 'focus' ? 'Blok fokusa je gotov. Vrijeme je za odmor.' : 'Odmor je gotov. Spreman za novi blok?')
  }, [state, now, record])

  // Follow changes made in another open tab (start, pause, settings).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue === null) return
      try {
        const next = T.restore(JSON.parse(e.newValue))
        if (next) {
          setState(next)
          setNow(Date.now())
        }
      } catch {
        // ignore a malformed value from elsewhere
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Persist, so a reload or a new tab continues the same block.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable: the timer still works for this page
    }
  }, [state])

  // The tab title shows the countdown while running.
  useEffect(() => {
    const base = 'Study buddy'
    document.title =
      state.status === 'running'
        ? `${T.formatClock(T.remaining(state, now))} · ${state.phase === 'focus' ? 'Fokus' : 'Odmor'} — ${base}`
        : base
  }, [state, now])

  const value: Pomodoro = {
    state,
    now,
    todayBlocks,
    announcement,
    start: () => {
      const t = Date.now()
      setNow(t)
      setAnnouncement('')
      setState((s) => T.start(s, t))
    },
    pause: () => setState((s) => T.pause(s, Date.now())),
    reset: () => setState(T.reset),
    skip: () => {
      const t = Date.now()
      const { state: next, finished } = T.skip(state, t)
      setState(next)
      setNow(t)
      record(finished)
    },
    setDurations: (f, b) => setState((s) => T.setDurations(s, f, b)),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
