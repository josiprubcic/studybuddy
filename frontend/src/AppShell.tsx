import type { ReactNode } from 'react'
import { PomodoroMini } from './focus/PomodoroTimer'
import Link from './ui/Link'
import './shell.css'

const NAV = [
  { href: '/', label: 'Početna' },
  { href: '/materijali', label: 'Materijali' },
]

export default function AppShell({ path, children }: { path: string; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Preskoči na sadržaj
      </a>
      <header className="shell-bar">
        <div className="shell-inner">
          <Link className="shell-wordmark" href="/">
            Study buddy
          </Link>
          <nav aria-label="Glavna navigacija">
            <ul className="shell-nav">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link className="shell-link" href={n.href} aria-current={path === n.href ? 'page' : undefined}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {path !== '/' && (
            <Link className="shell-timer" href="/" aria-label="Pomodoro timer na početnoj">
              <PomodoroMini />
            </Link>
          )}
        </div>
      </header>
      <div id="main" tabIndex={-1} className="shell-main">
        {children}
      </div>
    </>
  )
}
