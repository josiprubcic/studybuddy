// Shared fetch wrapper. The backend answers errors with RFC 9457 problem details
// ({ status, title, detail, code }); every failure becomes an ApiError with a stable `code`.

export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

/** Calls the backend and returns the parsed JSON body (undefined for 204). Aborted requests rethrow the AbortError. */
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError('NETWORK', 0, 'Network request failed')
  }
  if (!res.ok) {
    const problem = await res.json().catch(() => null)
    throw new ApiError(problem?.code ?? `HTTP_${res.status}`, res.status, problem?.detail ?? res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError'
}
