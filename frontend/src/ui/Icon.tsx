// One small authored icon set: 24px grid, 2px round stroke, currentColor. Decorative by default.
const paths = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  arrowRight: 'M5 12h13M13 6.5l5.5 5.5-5.5 5.5',
  arrowLeft: 'M19 12H6M11 6.5L5.5 12l5.5 5.5',
  rotate: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4',
  book: 'M4.5 5.5c2.5-1 5-1 7.5.5 2.5-1.5 5-1.5 7.5-.5v13c-2.5-1-5-1-7.5.5-2.5-1.5-5-1.5-7.5-.5zM12 6v13',
} as const

export type IconName = keyof typeof paths

export default function Icon({ name, size = 20, label }: { name: IconName; size?: number; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className="icon"
    >
      <path d={paths[name]} />
    </svg>
  )
}
