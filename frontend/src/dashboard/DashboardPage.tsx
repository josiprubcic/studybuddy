import { useEffect, useState } from 'react'
import { isAbort } from '../api/http'
import { errorMessage } from '../api/errors'
import { listAllCards, type Card } from '../cards/api'
import StudySession from '../cards/StudySession'
import { LAST_DOCUMENT_KEY, listDocuments, type DocumentSummary } from '../documents/api'
import PomodoroTimer from '../focus/PomodoroTimer'
import { usePomodoro } from '../focus/usePomodoro'
import Icon from '../ui/Icon'
import FileName from '../ui/FileName'
import Link from '../ui/Link'
import './dashboard.css'

const pr = new Intl.PluralRules('hr-HR')
const word = (n: number, one: string, few: string, other: string) => {
  const c = pr.select(n)
  return `${n} ${c === 'one' ? one : c === 'few' ? few : other}`
}
const cardsWord = (n: number) => word(n, 'kartica', 'kartice', 'kartica')
const materialsWord = (n: number) => word(n, 'materijal', 'materijala', 'materijala')
const dayFormat = new Intl.DateTimeFormat('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' })

function greeting(hour: number) {
  if (hour < 5) return 'Dobra noć'
  if (hour < 12) return 'Dobro jutro'
  if (hour < 18) return 'Dobar dan'
  return 'Dobra večer'
}

function lastDocumentId(): number | null {
  try {
    const id = Number(localStorage.getItem(LAST_DOCUMENT_KEY))
    return id > 0 ? id : null
  } catch {
    return null
  }
}

type Step = { name: string; status: string; href?: string; soon?: boolean }

export default function DashboardPage() {
  const pomodoro = usePomodoro()
  const [docs, setDocs] = useState<DocumentSummary[] | null>(null)
  const [cards, setCards] = useState<Card[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [studying, setStudying] = useState(false)
  const [now] = useState(() => new Date()) // read once: the greeting needn't tick
  const [lastId] = useState(lastDocumentId)

  useEffect(() => {
    const ctl = new AbortController()
    Promise.all([listDocuments(), listAllCards(ctl.signal)])
      .then(([d, c]) => {
        setDocs(d)
        setCards(c)
      })
      .catch((e) => !isAbort(e) && setError(errorMessage(e)))
    return () => ctl.abort()
  }, [])

  const loading = docs === null && !error
  const totalCards = cards?.length ?? 0
  const withCards = (docs ?? []).filter((d) => d.cardCount > 0)
  const last = docs?.find((d) => d.id === lastId) ?? docs?.[0] ?? null
  const blocks = pomodoro.todayBlocks ?? 0

  const steps: Step[] = [
    { name: 'Planiraj', status: 'uskoro', soon: true },
    { name: 'Prouči', status: docs ? materialsWord(docs.length) : '…', href: '#prouci' },
    { name: 'Vježbaj', status: cards ? cardsWord(totalCards) : '…', href: '#vjezbaj' },
    { name: 'Ponovi', status: 'uskoro', soon: true },
  ]

  return (
    <main className="dash">
      <header className="dash-head">
        <h1>{greeting(now.getHours())}</h1>
        <p className="dash-date">{dayFormat.format(now)}</p>
      </header>

      {error && (
        <div className="callout is-error" role="alert">
          <span className="callout-icon">
            <Icon name="x" size={18} />
          </span>
          <span>{error}</span>
        </div>
      )}

      <nav className="dash-flow" aria-label="Tok učenja">
        <ol>
          {steps.map((s) => (
            <li key={s.name} className={s.soon ? 'is-soon' : ''}>
              {s.href ? (
                <a href={s.href} className="dash-flow-step">
                  <span className="dash-flow-name">{s.name}</span>
                  <span className="dash-flow-status">{s.status}</span>
                </a>
              ) : (
                <span className="dash-flow-step">
                  <span className="dash-flow-name">{s.name}</span>
                  <span className="dash-flow-status">{s.status}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="dash-grid">
        <section id="vjezbaj" className="dash-panel dash-practice" aria-labelledby="practice-title" aria-busy={loading}>
          <h2 id="practice-title">Vježbaj</h2>
          {loading ? (
            <p className="dash-muted">Učitavam kartice…</p>
          ) : totalCards === 0 ? (
            <div className="dash-empty">
              <p>Još nemaš kartica. Učitaj skriptu i AI će iz nje napraviti kartice i nadopunjavanja.</p>
              <Link className="button" href="/materijali">
                Učitaj skriptu
              </Link>
            </div>
          ) : (
            <>
              <p className="dash-big">
                <strong>{totalCards}</strong> {cardsWord(totalCards).split(' ')[1]}
              </p>
              <p className="dash-muted">iz {withCards.length} materijala, spremno za vježbu</p>
              <button type="button" className="button dash-practice-cta" onClick={() => setStudying(true)}>
                Vježbaj sve
                <Icon name="arrowRight" size={20} />
              </button>
              <ul className="dash-list" aria-label="Kartice po materijalu">
                {withCards.map((d) => (
                  <li key={d.id}>
                    <Link className="dash-row" href={`/materijali?d=${d.id}`}>
                      <span className="dash-row-name">
                        <FileName name={d.name} />
                      </span>
                      <span className="dash-row-meta">{cardsWord(d.cardCount)}</span>
                      <Icon name="arrowRight" size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="dash-panel dash-focus" aria-labelledby="focus-title">
          <h2 id="focus-title">Fokus</h2>
          <p className="dash-muted">
            {blocks > 0
              ? `Danas: ${word(blocks, 'blok', 'bloka', 'blokova')} fokusa.`
              : 'Blok od 25 minuta, pa kratki odmor. Mobitel može čekati.'}
          </p>
          <PomodoroTimer />
        </section>

        <section id="prouci" className="dash-panel dash-study" aria-labelledby="study-title" aria-busy={loading}>
          <div className="dash-panel-head">
            <h2 id="study-title">Prouči</h2>
            <Link className="dash-link" href="/materijali">
              Svi materijali
            </Link>
          </div>
          {loading ? (
            <p className="dash-muted">Učitavam materijale…</p>
          ) : !last ? (
            <div className="dash-empty">
              <p>Učitaj PDF s predavanja. Podijelit ćemo ga na cjeline prema naslovima.</p>
              <Link className="button" href="/materijali">
                Učitaj PDF
              </Link>
            </div>
          ) : (
            <>
              <Link className="dash-continue" href={`/materijali?d=${last.id}`}>
                <span className="dash-continue-label">{last.id === lastId ? 'Nastavi gdje si stao' : 'Najnovije'}</span>
                <span className="dash-continue-name">
                  <FileName name={last.name} />
                </span>
                <span className="dash-row-meta">
                  {word(last.chunkCount, 'cjelina', 'cjeline', 'cjelina')}
                  {last.cardCount > 0 && ` · ${cardsWord(last.cardCount)}`}
                </span>
              </Link>
              <ul className="dash-list" aria-label="Ostali materijali">
                {docs!
                  .filter((d) => d.id !== last.id)
                  .slice(0, 3)
                  .map((d) => (
                    <li key={d.id}>
                      <Link className="dash-row" href={`/materijali?d=${d.id}`}>
                        <span className="dash-row-name">
                          <FileName name={d.name} />
                        </span>
                        <span className="dash-row-meta">{word(d.chunkCount, 'cjelina', 'cjeline', 'cjelina')}</span>
                        <Icon name="arrowRight" size={18} />
                      </Link>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </section>

        <section className="dash-panel dash-soon" aria-labelledby="soon-title">
          <h2 id="soon-title">Uskoro</h2>
          <ul>
            <li>
              <strong>Ponovi</strong>
              <span>Svaki dan popis kartica koje treba ponoviti, prije nego što ih zaboraviš.</span>
            </li>
            <li>
              <strong>Pronađi grešku</strong>
              <span>AI namjerno pogriješi u odgovoru, a ti pronađeš i ispraviš grešku.</span>
            </li>
            <li>
              <strong>Planer</strong>
              <span>Ispiti, rokovi i bilješke na jednom mjestu, povezani s ponavljanjem.</span>
            </li>
          </ul>
        </section>
      </div>

      {studying && cards && <StudySession cards={cards} onClose={() => setStudying(false)} />}
    </main>
  )
}
