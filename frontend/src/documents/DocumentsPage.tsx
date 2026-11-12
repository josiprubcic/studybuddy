import { useEffect, useState, type ChangeEvent } from 'react'
import {
  getDocument,
  listDocuments,
  MAX_UPLOAD_BYTES,
  uploadDocument,
  type DocumentDetail,
  type DocumentSummary,
} from './api'

const dateFormat = new Intl.DateTimeFormat('hr-HR', { dateStyle: 'medium', timeStyle: 'short' })
const plural = new Intl.PluralRules('hr-HR')

// Croatian: 1 cjelina, 2–4 cjeline, 5+ cjelina (21 cjelina, 22 cjeline…)
function chunkWord(n: number) {
  return plural.select(n) === 'few' ? 'cjeline' : 'cjelina'
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [selected, setSelected] = useState<DocumentDetail | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDocuments().then(setDocuments).catch((e: Error) => setError(e.message))
  }, [])

  async function onFileChosen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again
    if (!file) return
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('Datoteka je veća od 10 MB.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const created = await uploadDocument(file)
      setDocuments(await listDocuments())
      await open(created.id)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function open(id: number) {
    setError(null)
    try {
      setSelected(await getDocument(id))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Moji materijali</h1>
        <label className={`button ${uploading ? 'is-busy' : ''}`}>
          {uploading ? 'Obrađujem…' : 'Učitaj PDF'}
          <input type="file" accept="application/pdf,.pdf" onChange={onFileChosen} disabled={uploading} hidden />
        </label>
      </header>

      {error && (
        <div className="callout is-error" role="alert">
          <span className="callout-icon" aria-hidden="true">
            ✗
          </span>
          <span>{error}</span>
        </div>
      )}

      <div className="layout">
        <section aria-labelledby="list-title">
          <h2 id="list-title" className="section-title">
            Materijali
          </h2>
          {documents.length === 0 ? (
            <p className="empty">Još nema materijala. Učitaj skriptu u PDF-u.</p>
          ) : (
            <ul className="doc-list">
              {documents.map((d) => (
                <li key={d.id}>
                  <button
                    className={`doc ${selected?.id === d.id ? 'is-selected' : ''}`}
                    onClick={() => open(d.id)}
                    aria-current={selected?.id === d.id}
                  >
                    <span className="doc-name">{d.name}</span>
                    <span className="doc-meta">
                      {d.chunkCount} {chunkWord(d.chunkCount)} · {dateFormat.format(new Date(d.createdAt))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="detail-title">
          {selected ? (
            <>
              <h2 id="detail-title" className="section-title">
                {selected.name}
              </h2>
              {selected.chunks.map((c) => (
                <article key={c.id} className="chunk">
                  <h3>{c.heading ?? 'Uvod'}</h3>
                  {/* shortcut: raw Markdown text; render it with react-markdown when the study view is built */}
                  <p className="chunk-text">{c.text}</p>
                </article>
              ))}
            </>
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
