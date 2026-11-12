import { createContext, useContext } from 'react'
import type * as T from './timer'

export type Pomodoro = {
  state: T.TimerState
  now: number
  /** Completed focus blocks today (server truth), null until loaded. */
  todayBlocks: number | null
  announcement: string
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  setDurations: (focusMin: number, breakMin: number) => void
}

export const Ctx = createContext<Pomodoro | null>(null)

export function usePomodoro(): Pomodoro {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePomodoro must be used inside <PomodoroProvider>')
  return v
}

