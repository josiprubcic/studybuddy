import { ApiError } from './http'

// Croatian text for every backend error code. Keep in sync with the backend's "code" properties.
// shortcut: Croatian only; move into react-i18next resources when the English UI is added.
const messages: Record<string, string> = {
  NETWORK: 'Poslužitelj nije dostupan. Provjeri vezu i pokušaj ponovno.',
  EMPTY_FILE: 'Datoteka je prazna.',
  NOT_PDF: 'Podržane su samo PDF datoteke.',
  UNREADABLE_FILE: 'Datoteku nije moguće pročitati. Pokušaj ponovno.',
  DAMAGED_PDF: 'PDF je oštećen ili zaštićen lozinkom.',
  NO_TEXT: 'PDF nema teksta. Skenirani dokumenti još nisu podržani.',
  FILE_TOO_LARGE: 'Datoteka je veća od 10 MB.',
  DOCUMENT_NOT_FOUND: 'Materijal nije pronađen. Možda je obrisan.',
  CARD_NOT_FOUND: 'Kartica nije pronađena. Možda je obrisana.',
  AI_UNAVAILABLE: 'Izrada kartica trenutno nije dostupna. Pokušaj ponovno za nekoliko minuta.',
  VALIDATION_FAILED: 'Provjeri unos: polja ne smiju biti prazna.',
}

/** A user-facing Croatian message for any error thrown by request(). */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (messages[e.code]) return messages[e.code]
    if (e.status === 413) return messages.FILE_TOO_LARGE
    if (e.status >= 500) return 'Nešto je pošlo po zlu na poslužitelju. Pokušaj ponovno.'
  }
  return 'Nešto je pošlo po zlu. Pokušaj ponovno.'
}
