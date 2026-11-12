import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ApiError, isAbort } from '../api/http'
import { errorMessage } from '../api/errors'
import CardsPanel from '../cards/CardsPanel'
import FileName from '../ui/FileName'
import { prettyName } from '../ui/prettyName'
import Icon from '../ui/Icon'
import MarkdownText from '../ui/MarkdownText'
import {
  getDocument,
  listDocuments,
  LAST_DOCUMENT_KEY,
  MAX_UPLOAD_BYTES,
  uploadDocument,
  type DocumentDetail,
  type DocumentSummary,
} from './api'

const dateFormat = new Intl.DateTimeFormat('hr-HR', { dateStyle: 'medium', timeStyle: 'short' })
const plural = new Intl.PluralRules('hr-HR')

// Croatian: 1 cjelina, 2–4 cjeline, 5+ cjelina (21 cjelina, 22 cjeline…)
function cardWord(n: number) {
  const c = plural.select(n)
  return c === 'one' ? 'kartica' : c === 'few' ? 'kartice' : 'kartica'
}

function chunkWord(n: number) {
  return plural.select(n) === 'few' ? 'cjeline' : 'cjelina'
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null) // null = not loaded yet
  const [listError, setListError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<DocumentDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const openCtl = useRef<AbortController | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const pendingFocus = useRef(false)

  const load = useCallback(
    () =>
      listDocuments()
        .then((d) => {
          setDocuments(d)
          setListError(null)
        })
        .catch((e) => setListError(errorMessage(e))),
    [],
  )

  useEffect(() => {
    load()
    // /materijali?d=12 opens that material (links from the dashboard)
    const id = Number(new URLSearchParams(window.location.search).get('d'))
    if (id > 0) open(id)
    return () => openCtl.current?.abort()
  }, [load])

  // Runs after the detail heading is rendered.
  useEffect(() => {
    const h = headingRef.current
    if (!detail || !h || !pendingFocus.current) return
    pendingFocus.current = false
    h.focus({ preventScroll: true })
    if (window.matchMedia('(max-width: 760px)').matches) {
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      h.scrollIntoView({ block: 'start', behavior: calm ? 'auto' : 'smooth' })
    }
  }, [detail])

  async function onFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again
    if (!file) return
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(errorMessage(new ApiError('FILE_TOO_LARGE', 413, '')))
      return
    }
    setError(null)
    setUploading(true)
    setStatus(`Obrađujem „${file.name}“…`)
    try {
      const created = await uploadDocument(file)
      await load()
      setStatus(`Učitano: ${prettyName(file.name)} (${created.chunkCount} ${chunkWord(created.chunkCount)})`)
      await open(created.id)
    } catch (err) {
      setStatus('')
      setError(errorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  async function open(id: number) {
    openCtl.current?.abort()
    const ctl = new AbortController()
    openCtl.current = ctl
    setSelectedId(id)
    window.history.replaceState(null, '', `/materijali?d=${id}`)
    try {
      localStorage.setItem(LAST_DOCUMENT_KEY, String(id))
    } catch {
      // storage unavailable: "continue" on the dashboard just won't appear
    }
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    try {
      const d = await getDocument(id, ctl.signal)
      pendingFocus.current = true
      setDetail(d)
      setDetailLoading(false)
    } catch (err) {
      if (isAbort(err)) return // a newer open() owns the state now
      setDetailError(errorMessage(err))
      setDetailLoading(false)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Materijali</h1>
        <label className={`button ${uploading ? 'is-busy' : ''}`}>
          {uploading ? 'Obrađujem…' : 'Učitaj PDF'}
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={onFileChosen}
            disabled={uploading}
            className="visually-hidden"
          />
        </label>
      </header>

      <p role="status" className="visually-hidden">
        {status}
      </p>

      {error && (
        <div className="callout is-error" role="alert">
          <span className="callout-icon">
            <Icon name="x" size={18} />
          </span>
          <span>{error}</span>
        </div>
      )}

      <div className="layout">
        <section aria-labelledby="list-title" aria-busy={documents === null && !listError}>
          <h2 id="list-title" className="visually-hidden">
            Učitani materijali
          </h2>
          {listError ? (
            <>
              <div className="callout is-error" role="alert">
                <span className="callout-icon">
            <Icon name="x" size={18} />
          </span>
                <span>{listError}</span>
              </div>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setListError(null)
                  load()
                }}
              >
                Pokušaj ponovno
              </button>
            </>
          ) : documents === null ? (
            <p className="muted">Učitavam materijale…</p>
          ) : documents.length === 0 ? (
            <p className="empty">Još nema materijala. Učitaj skriptu u PDF-u.</p>
          ) : (
            <ul className="doc-list">
              {documents.map((d) => (
                <li key={d.id}>
                  <button
                    className={`doc ${selectedId === d.id ? 'is-selected' : ''}`}
                    onClick={() => open(d.id)}
                    aria-current={selectedId === d.id}
                  >
                    <span className="doc-name">
                      <FileName name={d.name} />
                    </span>
                    <span className="doc-meta">
                      {d.chunkCount} {chunkWord(d.chunkCount)}
                      {d.cardCount > 0 && ` · ${d.cardCount} ${cardWord(d.cardCount)}`} · {dateFormat.format(new Date(d.createdAt))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="detail-title" aria-busy={detailLoading}>
          {detail ? (
            <>
              <h2 id="detail-title" className="section-title" tabIndex={-1} ref={headingRef}>
                <FileName name={detail.name} />
              </h2>
              <CardsPanel documentId={detail.id} />
              {detail.chunks.map((c) => (
                <article key={c.id} className="chunk">
                  <h3>{c.heading ?? 'Uvod'}</h3>
                  <MarkdownText className="chunk-text" text={c.text} />
                </article>
              ))}
            </>
          ) : detailError ? (
            <div id="detail-title" className="callout is-error" role="alert">
              <span className="callout-icon">
            <Icon name="x" size={18} />
          </span>
              <span>{detailError}</span>
            </div>
          ) : detailLoading ? (
            <p id="detail-title" className="muted">
              Učitavam…
            </p>
          ) : (
            <p id="detail-title" className="muted">
              Odaberi materijal da vidiš njegove cjeline.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
