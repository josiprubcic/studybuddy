import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { isAbort } from '../api/http'
import { errorMessage } from '../api/errors'
import { deleteCard, generateCards, listCards, updateCard, type Card } from './api'
import Icon from '../ui/Icon'
import StudySession from './StudySession'
import './cards.css'

const pr = new Intl.PluralRules('hr-HR')
const plural = (n: number, one: string, few: string, other: string) => {
  const c = pr.select(n)
  return c === 'one' ? one : c === 'few' ? few : other
}
const cardsWord = (n: number) => `${n} ${plural(n, 'kartica', 'kartice', 'kartica')}`
const sectionsWord = (n: number) => `${n} ${plural(n, 'cjelina', 'cjeline', 'cjelina')}`

function ErrorCallout({ message }: { message: string }) {
  return (
    <div className="cards-error" role="alert">
      <span className="cards-error-icon">
        <Icon name="x" size={18} />
      </span>
      <span>{message}</span>
    </div>
  )
}

function Question({ card }: { card: Card }) {
  if (card.type !== 'fill_in') return <>{card.question}</>
  return (
    <>
      {card.question.split(/_{3,}/).map((part, i, a) => (
        <span key={i}>
          {part}
          {i < a.length - 1 && <span className="cards-blank" role="img" aria-label="praznina" />}
        </span>
      ))}
    </>
  )
}

type Mode = 'view' | 'edit' | 'delete'

function CardItem({
  card,
  onSaved,
  onDeleted,
}: {
  card: Card
  onSaved: (c: Card) => void
  onDeleted: (id: number) => void
}) {
  const [mode, setMode] = useState<Mode>('view')
  const [shown, setShown] = useState(false)
  const [question, setQuestion] = useState(card.question)
  const [answer, setAnswer] = useState(card.answer)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstField = useRef<HTMLTextAreaElement>(null)
  const editBtn = useRef<HTMLButtonElement>(null)
  const deleteBtn = useRef<HTMLButtonElement>(null)
  const confirmCancel = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<'edit' | 'delete' | null>(null)
  const answerId = useId()

  useEffect(() => {
    if (mode === 'edit') firstField.current?.focus()
    else if (mode === 'delete') confirmCancel.current?.focus()
    else if (returnTo.current === 'edit') editBtn.current?.focus()
    else if (returnTo.current === 'delete') deleteBtn.current?.focus()
    if (mode === 'view') returnTo.current = null
  }, [mode])

  const close = (from: 'edit' | 'delete') => {
    returnTo.current = from
    setError(null)
    setMode('view')
  }

  const startEdit = () => {
    setQuestion(card.question)
    setAnswer(card.answer)
    setError(null)
    setMode('edit')
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      onSaved(await updateCard(card.id, { question, answer }))
      returnTo.current = 'edit'
      setMode('view')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    setError(null)
    try {
      await deleteCard(card.id)
      onDeleted(card.id)
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <li className="cards-card">
      <span className="cards-chip">{card.type === 'flashcard' ? 'Kartica' : 'Nadopunjavanje'}</span>

      {mode === 'edit' ? (
        <form
          className="cards-form"
          onSubmit={save}
          onKeyDown={(e: KeyboardEvent) => e.key === 'Escape' && close('edit')}
        >
          <label>
            Pitanje
            <textarea ref={firstField} required maxLength={2000} rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
          </label>
          <label>
            Odgovor
            <textarea required maxLength={2000} rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </label>
          {error && <ErrorCallout message={error} />}
          <div className="cards-actions">
            <button type="submit" className="button" disabled={busy}>Spremi</button>
            <button type="button" className="button-secondary" onClick={() => close('edit')}>Odustani</button>
          </div>
        </form>
      ) : (
        <>
          <p className="cards-question"><Question card={card} /></p>
          {mode === 'delete' ? (
            <div className="cards-confirm" role="group" aria-label="Brisanje kartice">
              <p>Obrisati ovu karticu?</p>
              {error && <ErrorCallout message={error} />}
              <div className="cards-actions">
                <button type="button" className="button-ghost is-danger" disabled={busy} onClick={remove}>Obriši</button>
                <button ref={confirmCancel} type="button" className="button-secondary" onClick={() => close('delete')}>Odustani</button>
              </div>
            </div>
          ) : (
            <div className="cards-actions cards-row">
              <button
                type="button"
                className="button-ghost"
                data-reveal={card.id}
                aria-expanded={shown}
                aria-controls={answerId}
                onClick={() => setShown(!shown)}
              >
                {shown ? 'Sakrij odgovor' : 'Prikaži odgovor'}
              </button>
              <span className="cards-row-end">
                <button ref={editBtn} type="button" className="button-ghost" onClick={startEdit}>Uredi</button>
                <button ref={deleteBtn} type="button" className="button-ghost is-danger" onClick={() => { setError(null); setMode('delete') }}>Obriši</button>
              </span>
            </div>
          )}
          {/* Always in the DOM so aria-controls resolves; the reveal animation replays when `hidden` is removed. */}
          <div id={answerId} className="cards-answer" hidden={!shown}>
            <p className="cards-answer-text">{card.answer}</p>
            {card.quote && (
              <>
                <span className="cards-quote-label">Izvor:</span>
                <blockquote>{card.quote}</blockquote>
              </>
            )}
          </div>
        </>
      )}
    </li>
  )
}

export default function CardsPanel({ documentId }: { documentId: number }) {
  const headingId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [focusId, setFocusId] = useState<number | 'heading' | null>(null)
  const [studying, setStudying] = useState(false)
  const studyBtn = useRef<HTMLButtonElement>(null)
  const controller = useRef<AbortController | null>(null)

  const closeStudy = () => {
    setStudying(false)
    requestAnimationFrame(() => studyBtn.current?.focus())
  }

  useEffect(() => {
    const ctl = new AbortController()
    controller.current = ctl
    setLoading(true)
    setGenerating(false)
    setError(null)
    setStatus('')
    setCards([])
    listCards(documentId, ctl.signal)
      .then((c) => { setCards(c); setLoading(false) })
      .catch((e) => {
        if (isAbort(e)) return
        setError(errorMessage(e))
        setLoading(false)
      })
    return () => ctl.abort()
  }, [documentId])

  useEffect(() => {
    if (focusId === null) return
    const target =
      focusId === 'heading' ? headingRef.current : rootRef.current?.querySelector<HTMLElement>(`[data-reveal="${focusId}"]`)
    target?.focus()
    setFocusId(null)
  }, [focusId, cards])

  const generate = async () => {
    const ctl = controller.current
    if (!ctl || generating) return
    setGenerating(true)
    setError(null)
    setStatus('Izrađujem kartice. Ovo može potrajati minutu ili dvije.')
    try {
      const all = await generateCards(documentId, ctl.signal)
      const added = all.length - cards.length
      setCards(all)
      setStatus(added > 0 ? `Napravljeno: ${cardsWord(added)}` : 'Sve cjeline već imaju kartice.')
    } catch (e) {
      if (isAbort(e)) return
      setStatus('')
      setError(errorMessage(e))
      // Sections finished before the failure are already saved on the server; show them.
      listCards(documentId, ctl.signal).then(setCards).catch(() => {})
    } finally {
      if (!ctl.signal.aborted) setGenerating(false)
    }
  }

  const onDeleted = (id: number) => {
    const i = cards.findIndex((c) => c.id === id)
    const next = cards[i + 1] ?? cards[i - 1]
    setCards(cards.filter((c) => c.id !== id))
    setFocusId(next ? next.id : 'heading')
  }

  const groups: { chunkId: number; heading: string; cards: Card[] }[] = []
  for (const c of cards) {
    const last = groups[groups.length - 1]
    if (last && last.chunkId === c.chunkId) last.cards.push(c)
    else groups.push({ chunkId: c.chunkId, heading: c.chunkHeading ?? 'Uvod', cards: [c] })
  }

  const generateButton = (label: string, cls: string) => (
    <button type="button" className={cls} disabled={generating} onClick={generate}>
      {generating ? 'Izrađujem kartice…' : label}
    </button>
  )

  return (
    <section ref={rootRef} className="cards-panel" aria-labelledby={headingId} aria-busy={loading || generating}>
      <h3 id={headingId} ref={headingRef} tabIndex={-1}>Kartice</h3>
      <div role="status" className="cards-status">{status}</div>

      {loading ? (
        <p className="cards-muted">Učitavam kartice…</p>
      ) : (
        <>
          {error && <ErrorCallout message={error} />}
          {cards.length === 0 ? (
            <div className="cards-empty">
              <p>AI će od cjelina tvog gradiva napraviti kartice i zadatke nadopunjavanja.</p>
              {generateButton('Napravi kartice', 'button')}
            </div>
          ) : (
            <>
              <div className="cards-practice">
                <div>
                  <p className="cards-practice-title">Spremno za vježbu</p>
                  <p className="cards-muted cards-count">
                    {cardsWord(cards.length)} · {sectionsWord(groups.length)}
                  </p>
                </div>
                <button ref={studyBtn} type="button" className="button" onClick={() => setStudying(true)}>
                  Vježbaj
                  <Icon name="arrowRight" size={20} />
                </button>
              </div>
              {studying && <StudySession cards={cards} onClose={closeStudy} />}
              {groups.map((g) => (
                <div key={g.chunkId} className="cards-group">
                  <h4>{g.heading}</h4>
                  <ul>
                    {g.cards.map((c) => (
                      <CardItem
                        key={c.id}
                        card={c}
                        onSaved={(u) => setCards((cs) => cs.map((x) => (x.id === u.id ? u : x)))}
                        onDeleted={onDeleted}
                      />
                    ))}
                  </ul>
                </div>
              ))}
              <div className="cards-more">{generateButton('Napravi kartice za nove cjeline', 'button-secondary')}</div>
            </>
          )}
        </>
      )}
    </section>
  )
}
