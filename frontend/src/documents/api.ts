// Mirrors the records in backend/.../document (DocumentSummary, DocumentDetail).

export type DocumentSummary = {
  id: number
  name: string
  type: string
  createdAt: string
  chunkCount: number
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

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // same as spring.servlet.multipart.max-file-size

export async function listDocuments(): Promise<DocumentSummary[]> {
  return request('/api/documents')
}

export async function getDocument(id: number): Promise<DocumentDetail> {
  return request(`/api/documents/${id}`)
}

export async function uploadDocument(file: File): Promise<DocumentSummary> {
  const body = new FormData()
  body.append('file', file) // the name must match @RequestParam("file"); the browser sets Content-Type itself
  return request('/api/documents', { method: 'POST', body })
}

// The backend answers errors with RFC 9457 problem details: { title, detail, status, code }.
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    throw new Error('Poslužitelj nije dostupan. Je li backend pokrenut?')
  }
  if (!res.ok) {
    const problem = await res.json().catch(() => null)
    throw new Error(problem?.detail ?? problem?.title ?? `Greška ${res.status}`)
  }
  return res.json()
}
