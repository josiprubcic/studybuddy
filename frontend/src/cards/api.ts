import { request } from '../api/http'

export interface Card {
  id: number
  chunkId: number
  chunkPosition: number
  chunkHeading: string | null
  type: 'flashcard' | 'fill_in'
  question: string
  answer: string
  quote: string
}

export const listCards = (documentId: number, signal?: AbortSignal) =>
  request<Card[]>(`/api/documents/${documentId}/cards`, { signal })

export const generateCards = (documentId: number, signal?: AbortSignal) =>
  request<Card[]>(`/api/documents/${documentId}/cards/generate`, { method: 'POST', signal })

export const updateCard = (cardId: number, body: { question: string; answer: string }) =>
  request<Card>(`/api/cards/${cardId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

export const deleteCard = (cardId: number) => request<void>(`/api/cards/${cardId}`, { method: 'DELETE' })
