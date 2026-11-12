import { request } from '../api/http'

// Mirrors the records in backend/.../document (DocumentSummary, DocumentDetail).

export type DocumentSummary = {
  id: number
  name: string
  type: string
  createdAt: string
  chunkCount: number
  cardCount: number
}

export type Chunk = {
  id: number
  position: number
  heading: string | null
  text: string
}

export type DocumentDetail = Omit<DocumentSummary, 'chunkCount'> & {
  markdown: string
  chunks: Chunk[]
}

/** Remembers the last opened material so the dashboard can offer "Nastavi". */
export const LAST_DOCUMENT_KEY = 'studybuddy.lastDocument'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // same as spring.servlet.multipart.max-file-size

export async function listDocuments(): Promise<DocumentSummary[]> {
  return request('/api/documents')
}

export async function getDocument(id: number, signal?: AbortSignal): Promise<DocumentDetail> {
  return request(`/api/documents/${id}`, { signal })
}

export async function uploadDocument(file: File): Promise<DocumentSummary> {
  const body = new FormData()
  body.append('file', file) // the name must match @RequestParam("file"); the browser sets Content-Type itself
  return request('/api/documents', { method: 'POST', body })
}
