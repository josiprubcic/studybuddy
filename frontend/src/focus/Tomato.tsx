import { useId } from 'react'
import type { Phase } from './timer'

/**
 * The timer face: a tomato that ripens (fills from the bottom) as the block runs.
 * Focus fills tomato red; a break fills calm green. Decorative: the time is announced in text.
 */
export default function Tomato({ progress, phase, size = 56 }: { progress: number; phase: Phase; size?: number }) {
  const clip = useId()
  const p = Math.min(1, Math.max(0, progress))
  // body spans y 9..47 in the 48-unit box
  const fillTop = 47 - 38 * p
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={`tomato is-${phase}`}
    >
      <defs>
        <clipPath id={clip}>
          <path d="M24 9c11.5 0 20 7.6 20 18.2C44 38.4 35.2 47 24 47S4 38.4 4 27.2C4 16.6 12.5 9 24 9z" />
        </clipPath>
      </defs>
      {/* skin */}
      <path
        className="tomato-skin"
        d="M24 9c11.5 0 20 7.6 20 18.2C44 38.4 35.2 47 24 47S4 38.4 4 27.2C4 16.6 12.5 9 24 9z"
      />
      {/* ripening fill */}
      <rect
        className="tomato-fill"
        clipPath={`url(#${clip})`}
        x="0"
        y={fillTop}
        width="48"
        height={48 - fillTop}
      />
      {/* shine */}
      <path className="tomato-shine" d="M13 20c1.5-3 4.5-5 8-5.6" />
      {/* outline on top of the fill */}
      <path
        className="tomato-outline"
        d="M24 9c11.5 0 20 7.6 20 18.2C44 38.4 35.2 47 24 47S4 38.4 4 27.2C4 16.6 12.5 9 24 9z"
      />
      {/* calyx (the green star) and stalk */}
      <path
        className="tomato-leaf"
        d="M24 13.5l-3.6 3.2-4.9-.6 2.6-3.6-3.8-2.7 5 .1L24 5.8l4.7 4.1 5-.1-3.8 2.7 2.6 3.6-4.9.6z"
      />
      <path className="tomato-stalk" d="M24 6.5c.2-2 1.2-3.4 3-4.2" />
    </svg>
  )
}

/** Today's finished focus blocks as a row of small tomatoes. */
export function TomatoTally({ count }: { count: number }) {
  const shown = Math.min(count, 6)
  return (
    <span className="tomato-tally">
      <span className="tomato-tally-row" aria-hidden="true">
        {Array.from({ length: shown }, (_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 48 48" className="tomato tomato-mini is-focus">
            <path
              className="tomato-fill-solid"
              d="M24 9c11.5 0 20 7.6 20 18.2C44 38.4 35.2 47 24 47S4 38.4 4 27.2C4 16.6 12.5 9 24 9z"
            />
            <path
              className="tomato-leaf"
              d="M24 13.5l-3.6 3.2-4.9-.6 2.6-3.6-3.8-2.7 5 .1L24 5.8l4.7 4.1 5-.1-3.8 2.7 2.6 3.6-4.9.6z"
            />
          </svg>
        ))}
      </span>
      {count > shown && <span aria-hidden="true">+{count - shown}</span>}
    </span>
  )
}
