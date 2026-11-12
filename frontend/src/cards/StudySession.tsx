import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Icon from '../ui/Icon'
import type { Card } from './api'
import './study.css'

type Rating = 'again' | 'hard' | 'good' | 'easy'

const RATINGS: { id: Rating; key: string; label: string; hint: string }[] = [
  { id: 'again', key: '1', label: 'Ponovo', hint: 'nisam se sjetio' },
  { id: 'hard', key: '2', label: 'Teško', hint: 's mukom' },
  { id: 'good', key: '3', label: 'Dobro', hint: 'sjetio sam se' },
  { id: 'easy', key: '4', label: 'Lako', hint: 'odmah' },
]

const AGAIN_GAP = 3 // a card rated "Ponovo" comes back after this many other cards in the same session

const pr = new Intl.PluralRules('hr-HR')
const word = (n: number, one: string, few: string, other: string) => {
  const c = pr.select(n)
  return `${n} ${c === 'one' ? one : c === 'few' ? few : other}`
}

function Front({ card }: { card: Card }) {
  if (card.type !== 'fill_in') return <>{card.question}</>
  return (
    <>
      {card.question.split(/_{3,}/).map((part, i, a) => (
        <span key={i}>
          {part}
          {i < a.length - 1 && <span className="study-blank" role="img" aria-label="praznina" />}
        </span>
      ))}
    </>
  )
}

/** For a fill-in, the back shows the whole sentence with the missing term highlighted (cloze). */
function Back({ card }: { card: Card }) {
  if (card.type !== 'fill_in') return <>{card.answer}</>
  return (
    <>
      {card.question.split(/_{3,}/).map((part, i, a) => (
        <span key={i}>
          {part}
          {i < a.length - 1 && <mark>{card.answer}</mark>}
        </span>
      ))}
    </>
  )
}

/**
 * Focused practice: one card at a time, recall first, then reveal and rate.
 * shortcut: ratings live only in this session; MVP 5.3 (FSRS) will save them and schedule the next review.
 */
export default function StudySession({ cards, onClose }: { cards: Card[]; onClose: () => void }) {
  const titleId = useId()
  const [queue, setQueue] = useState<number[]>(() => cards.map((_, i) => i))
  const [step, setStep] = useState(0) // increments on every rating so each card face mounts fresh
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(0)
  const [counts, setCounts] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 })
  const revealBtn = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  const done = queue.length === 0
  const card = done ? null : cards[queue[0]]

  const reveal = useCallback(() => setRevealed(true), [])

  const rate = useCallback(
    (r: Rating) => {
      setCounts((c) => ({ ...c, [r]: c[r] + 1 }))
      setQueue(([head, ...rest]) => {
        if (r !== 'again') return rest
        const at = Math.min(AGAIN_GAP, rest.length)
        return [...rest.slice(0, at), head, ...rest.slice(at)]
      })
      if (r !== 'again') setFinished((f) => f + 1)
      setRevealed(false)
      setStep((s) => s + 1)
    },
    [],
  )

  const restart = () => {
    setQueue(cards.map((_, i) => i))
    setFinished(0)
    setCounts({ again: 0, hard: 0, good: 0, easy: 0 })
    setRevealed(false)
    setStep((s) => s + 1)
  }

  // Focus: the reveal button for a new card, the card itself once the answer shows, the summary at the end.
  useEffect(() => {
    if (done) doneRef.current?.focus()
    else if (revealed) cardRef.current?.focus()
    else revealBtn.current?.focus()
  }, [done, revealed, step])

  // Keyboard: Space/Enter reveal, 1–4 rate, Escape closes.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (done) return
      const onButton = e.target instanceof Element && e.target.closest('button')
      if (!revealed && (e.key === ' ' || e.key === 'Enter') && !onButton) {
        e.preventDefault()
        reveal()
        return
      }
      const r = RATINGS.find((x) => x.key === e.key)
      if (revealed && r) {
        e.preventDefault()
        rate(r.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, revealed, reveal, rate, onClose])

  // The session covers the page: keep the page behind it from scrolling.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const total = cards.length
  const known = counts.good + counts.easy

  return (
    <div className="study" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="study-bar">
        <button type="button" className="study-close" onClick={onClose}>
          <Icon name="arrowLeft" size={20} />
          Završi
        </button>
        <h2 id={titleId} className="visually-hidden">
          Vježbanje kartica
        </h2>
        <div className="study-progress">
          <div
            className="study-progress-track"
            role="progressbar"
            aria-label="Napredak"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={finished}
          >
            <span style={{ transform: `scaleX(${total ? finished / total : 0})` }} />
          </div>
          <span className="study-progress-label">
            {finished} / {total}
          </span>
        </div>
      </header>

      <div className="study-stage">
        {card ? (
          <>
            <p className="study-context">
              <span className={`study-chip ${card.type === 'fill_in' ? 'is-cloze' : ''}`}>
                {card.type === 'fill_in' ? 'Nadopunjavanje' : 'Kartica'}
              </span>
              <span className="study-section">{card.chunkHeading ?? 'Uvod'}</span>
            </p>

            <div
              key={step}
              ref={cardRef}
              tabIndex={-1}
              className={`study-card ${revealed ? 'is-revealed' : ''}`}
              aria-live="polite"
            >
              <div className="study-card-inner">
                <section className="study-face study-front" aria-hidden={revealed}>
                  <p className="study-q">
                    <Front card={card} />
                  </p>
                </section>
                <section className="study-face study-back" aria-hidden={!revealed}>
                  {revealed && (
                    <>
                      {card.type !== 'fill_in' && (
                        <p className="study-q-small">
                          <Front card={card} />
                        </p>
                      )}
                      <p className="study-a">
                        <Back card={card} />
                      </p>
                      <figure className="study-source">
                        <figcaption>
                          <Icon name="book" size={16} />
                          Iz tvoje skripte
                        </figcaption>
                        <blockquote>{card.quote}</blockquote>
                      </figure>
                    </>
                  )}
                </section>
              </div>
            </div>

            <div className="study-controls">
              {!revealed ? (
                <>
                  <button ref={revealBtn} type="button" className="button study-reveal" onClick={reveal}>
                    Prikaži odgovor
                  </button>
                  <p className="study-tip">Prvo se pokušaj sjetiti, pa okreni karticu.</p>
                </>
              ) : (
                <div className="study-rating" role="group" aria-label="Koliko si se dobro sjetio?">
                  {RATINGS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`study-rate is-${r.id}`}
                      onClick={() => rate(r.id)}
                      aria-keyshortcuts={r.key}
                    >
                      <span className="study-rate-label">{r.label}</span>
                      <span className="study-rate-hint">{r.hint}</span>
                      <kbd aria-hidden="true">{r.key}</kbd>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="study-done">
            <span className="study-done-icon">
              <Icon name="check" size={32} />
            </span>
            <h3 ref={doneRef} tabIndex={-1}>
              Prošao si {word(total, 'karticu', 'kartice', 'kartica')}.
            </h3>
            <ul className="study-summary">
              <li>
                <strong>{known}</strong> znao si
              </li>
              <li>
                <strong>{counts.hard}</strong> s mukom
              </li>
              <li>
                <strong>{counts.again}</strong> {counts.again === 1 ? 'ponavljanje' : 'ponavljanja'} u sesiji
              </li>
            </ul>
            <p className="study-note">
              Ocjene se zasad ne spremaju. Uskoro će ih raspored ponavljanja koristiti da ti kaže što ponoviti
              sutra.
            </p>
            <div className="study-done-actions">
              <button type="button" className="button" onClick={restart}>
                <Icon name="rotate" size={20} />
                Vježbaj ponovno
              </button>
              <button type="button" className="button-secondary" onClick={onClose}>
                Natrag na kartice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
