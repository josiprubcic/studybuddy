import type { ReactNode } from 'react'

// The subset our PDF converter produces: paragraphs, "- " lists, "#" headings and **bold**.
// Builds React elements from text, never HTML, so content from a PDF can't inject markup.
// shortcut: no tables, links or nested lists; use react-markdown if notes ever need them.

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  )
}

export default function MarkdownText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        if (lines.every((l) => /^[-*•]\s/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^[-*•]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        const heading = block.match(/^#{1,6}\s+(.*)$/)
        if (heading && lines.length === 1) return <h4 key={i}>{inline(heading[1])}</h4>
        return <p key={i}>{inline(lines.join(' '))}</p>
      })}
    </div>
  )
}
