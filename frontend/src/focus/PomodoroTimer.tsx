import { useRef, useState, type FormEvent } from 'react'
import { usePomodoro } from './usePomodoro'
import Tomato, { TomatoTally } from './Tomato'
import { formatClock, LIMITS, progress, remaining } from './timer'
import './pomodoro.css'

const pr = new Intl.PluralRules('hr-HR')
const blocksWord = (n: number) => {
  const c = pr.select(n)
  return `${n} ${c === 'one' ? 'blok' : c === 'few' ? 'bloka' : 'blokova'}`
}

/** The full timer for the page header. */
export default function PomodoroTimer() {
  const p = usePomodoro()
  const { state, now } = p
  const mainBtn = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState(false)
  const [focusMin, setFocusMin] = useState(String(state.focusMin))
  const [breakMin, setBreakMin] = useState(String(state.breakMin))

  const left = remaining(state, now)
  const phaseLabel = state.phase === 'focus' ? 'Fokus' : 'Odmor'
  const running = state.status === 'running'

  const openSettings = () => {
    setFocusMin(String(state.focusMin))
    setBreakMin(String(state.breakMin))
    setEditing(true)
  }

  const closeSettings = () => {
    setEditing(false)
    requestAnimationFrame(() => mainBtn.current?.focus())
  }

  const saveSettings = (e: FormEvent) => {
    e.preventDefault()
    p.setDurations(Number(focusMin), Number(breakMin))
    closeSettings()
  }

  return (
    <section className={`pomodoro is-${state.phase} ${running ? 'is-running' : ''}`} aria-label="Pomodoro timer">
      <Tomato progress={progress(state, now)} phase={state.phase} />

      <div className="pomodoro-readout">
        <span className="pomodoro-phase">{phaseLabel}</span>
        <span className="pomodoro-time" role="timer" aria-live="off">
          {formatClock(left)}
        </span>
        {p.todayBlocks !== null && (
          <span className="pomodoro-today">
            {p.todayBlocks > 0 ? (
              <>
                Danas <TomatoTally count={p.todayBlocks} />
                <span className="visually-hidden">{blocksWord(p.todayBlocks)} fokusa</span>
              </>
            ) : (
              'Danas još nijedan blok'
            )}
          </span>
        )}
      </div>

      <div className="pomodoro-controls">
        {running ? (
          <button ref={mainBtn} type="button" className="pomodoro-main" onClick={p.pause}>
            Zaustavi
          </button>
        ) : (
          <button
            ref={mainBtn}
            type="button"
            className="pomodoro-main"
            onClick={() => {
              setEditing(false)
              p.start()
            }}
          >
            {state.status === 'paused' ? 'Nastavi' : state.phase === 'focus' ? 'Kreni' : 'Odmori se'}
          </button>
        )}
        <div className="pomodoro-secondary">
          {state.status !== 'idle' && (
            <button type="button" className="pomodoro-link" onClick={p.reset}>
              Ispočetka
            </button>
          )}
          <button type="button" className="pomodoro-link" onClick={p.skip}>
            {state.phase === 'focus' ? 'Preskoči na odmor' : 'Preskoči odmor'}
          </button>
          {state.status === 'idle' && !editing && (
            <button type="button" className="pomodoro-link" onClick={openSettings}>
              <span className="visually-hidden">Promijeni trajanje: </span>
              {state.focusMin} + {state.breakMin} min
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form className="pomodoro-settings" onSubmit={saveSettings} onKeyDown={(e) => e.key === 'Escape' && closeSettings()}>
          <label>
            Fokus (min)
            <input
              type="number"
              inputMode="numeric"
              min={LIMITS.focus[0]}
              max={LIMITS.focus[1]}
              required
              autoFocus
              value={focusMin}
              onChange={(e) => setFocusMin(e.target.value)}
            />
          </label>
          <label>
            Odmor (min)
            <input
              type="number"
              inputMode="numeric"
              min={LIMITS.break[0]}
              max={LIMITS.break[1]}
              required
              value={breakMin}
              onChange={(e) => setBreakMin(e.target.value)}
            />
          </label>
          <div className="pomodoro-settings-actions">
            <button type="submit" className="pomodoro-main">
              Spremi
            </button>
            <button type="button" className="pomodoro-link" onClick={closeSettings}>
              Odustani
            </button>
          </div>
        </form>
      )}

      <p className="visually-hidden" role="status">
        {p.announcement}
      </p>
    </section>
  )
}

/** A compact readout for the study session's top bar; shows only while a block runs or is paused. */
export function PomodoroMini() {
  const { state, now } = usePomodoro()
  if (state.status === 'idle') return null
  return (
    <span className={`pomodoro-mini is-${state.phase}`}>
      <Tomato progress={progress(state, now)} phase={state.phase} size={24} />
      <span className="pomodoro-mini-time" role="timer" aria-label={state.phase === 'focus' ? 'Fokus' : 'Odmor'}>
        {formatClock(remaining(state, now))}
      </span>
    </span>
  )
}
