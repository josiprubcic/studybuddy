/** "biologija-stanice.pdf" → "Biologija stanice": the name a student would give it, not the file's. */
export function prettyName(fileName: string): string {
  const base = fileName.replace(/\.(pdf|docx?)$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  return base ? base.charAt(0).toLocaleUpperCase('hr') + base.slice(1) : fileName
}
