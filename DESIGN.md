# Study buddy — Design System

> Source of truth for the look and feel of the Study buddy web app. Written for people and for AI agents (Claude, Cursor…) generating UI.
> Tokens live in `frontend/src/index.css`. If this file and the CSS disagree, fix one of them in the same change.

---

## 1. Atmosphere

**A calm desk with a friendly tutor.** Study buddy is where high-school and university students spend long, focused sessions reading their own notes and answering from memory. The interface stays quiet so the material and the student's progress are the loudest things on screen.

- **Paper, not a dashboard.** Warm off-white canvas, near-black ink, generous line height. Reading comes first.
- **Colour means something.** The base is neutral. Colour appears only where it carries meaning: an action, a result, a highlight, a topic, a reward. Because it is rare, it is noticed and remembered.
- **Encouraging, never alarming.** Blue for doing, green for knowing, amber for celebrating. Red is reserved for one job: telling you an answer was wrong, gently.
- **Round and tactile.** Rounded type and shapes, buttons that physically sink when pressed. Friendly for a 17-year-old, still serious enough for a 22-year-old.

### Influences
| Source | What we take | What we leave |
|---|---|---|
| Khan Academy (community DESIGN.md) | Light paper canvas, humanist sans, 4-stage mastery colours, "encouragement" callouts, soft tinted status backgrounds | Their mint-green brand, mascot, course-tree navigation |
| Duolingo (community DESIGN.md) | The press metaphor: a solid 3px shadow under the primary button that disappears on press | Owl green, 64–88px headlines, game-show intensity, red hearts as punishment |
| Sanity (community DESIGN.md) | 8px spacing rhythm, restraint (neutral base + rare accent), depth through surface colour, visible focus ring | Near-black default canvas, coral-red CTA, extreme negative tracking, neon accents |

We borrow principles, not identities: no other brand's colours, logo, mascot or illustrations.

---

## 2. Why these colours (research notes)

Colour does not make anyone smarter on its own. What the research supports, and how we apply it:

| Finding | Evidence (short) | Rule in this system |
|---|---|---|
| Dark text on a light background reads more accurately | Positive-polarity advantage in proofreading and acuity (Piepenbrock et al., 2014); light mode better at night in a later study | Light theme is the default. Dark theme follows the OS setting and is tuned for night study, not the brand. |
| Red in achievement settings triggers avoidance | Red before a hard test lowered performance (Elliot et al., 2007); red helps detail tasks, blue helps creative ones (Mehta & Zhu, 2009); blue helped both in a 2016 follow-up | Primary colour is **blue**. Red never appears on buttons, backgrounds or headings — only on a wrong-answer message. |
| Distinct items are remembered better | Isolation (von Restorff) effect; highlighting improves memory (meta-analysis, effect sizes ≈ 0.36–0.44) | Use `--highlight` for key terms, citations and the marked mistake. Max one or two highlights per card, otherwise nothing stands out. |
| Warm colours + round shapes improve mood and comprehension | Emotional design in multimedia learning (Um, Plass et al., 2012); replicated for comprehension, not transfer, and round shapes did more than warm colour alone (Plass et al., 2014) | Warm **amber** for motivation (streaks, points, "well done"). Round type (Nunito) and soft corners everywhere. |
| ~8% of men have a colour-vision deficiency | — | Never use colour alone: every correct/wrong state has an icon (✓/✗) **and** a word. |
| Contrast beats hue | WCAG 2.2 | All text ≥ 4.5:1, UI boundaries and focus rings ≥ 3:1. Every pair below was checked. |

---

## 3. Colour tokens

### Light (default)
| Token | Value | Role |
|---|---|---|
| `--bg` | `#FBFAF7` | Page canvas ("paper") |
| `--surface` | `#FFFFFF` | Cards, inputs |
| `--surface-sunken` | `#F4F2EE` | Wells, code, empty states |
| `--text` | `#1C1917` | Body and headings (16.8:1) |
| `--text-muted` | `#57534E` | Secondary text (7.3:1) |
| `--text-soft` | `#6B6560` | Metadata, timestamps (5.5:1) |
| `--border` | `#E7E5E4` | Decorative card borders |
| `--border-strong` | `#78716C` | Input borders (4.8:1, meets 3:1 for UI) |
| `--primary` | `#2563EB` | Primary actions, progress, links (white text 5.2:1) |
| `--primary-hover` | `#1D4ED8` | Hover, link text (6.4:1) |
| `--primary-edge` | `#1E3A8A` | Solid "press" shadow under primary buttons |
| `--primary-soft` | `#EFF6FF` | Selected rows, info backgrounds |
| `--focus` | `#2563EB` | Focus ring (5.0:1) |
| `--success` / `--success-soft` | `#166534` / `#DCFCE7` | Correct answer, mastered (6.5:1) |
| `--danger` / `--danger-soft` | `#B42318` / `#FEF3F2` | Wrong answer, errors (6.1:1) |
| `--motivation` / `--motivation-soft` | `#92400E` / `#FEF3C7` | Streaks, points, celebrations (6.4:1) |
| `--motivation-fill` | `#F59E0B` | Icons and progress fills only — never text |
| `--highlight` | `#FDE68A` | Highlighted term / citation / marked mistake (text 14:1) |

### Dark (follows OS)
| Token | Value |
|---|---|
| `--bg` | `#1A1917` |
| `--surface` | `#262422` |
| `--surface-sunken` | `#211F1D` |
| `--text` | `#F5F5F4` |
| `--text-muted` / `--text-soft` | `#A8A29E` (7.0:1 on bg, 6.1:1 on surface) |
| `--border` / `--border-strong` | `#3A3734` / `#8A847E` (4.2:1) |
| `--primary` (+ dark text `#0B1220`, 7.4:1) | `#60A5FA` |
| `--primary-hover` (links) | `#93C5FD` |
| `--success` / `--success-soft` | `#86EFAC` / `#14532D` |
| `--danger` / `--danger-soft` | `#FECACA` / `#7F1D1D` |
| `--motivation` / `--motivation-soft` | `#FDE68A` / `#78350F` |
| `--highlight` (+ dark text) | `#FCD34D` |

Dark mode is never pure black. It is a warm charcoal, so long sessions at night don't feel like staring into a void.

### Mastery stages (FSRS → UI)
Every card and section shows how well it is known. Four stages, always with a label:

| Stage | Colour | Meaning |
|---|---|---|
| New | `--text-soft` grey | Never answered |
| Learning | `--primary` blue | Answered, not yet stable |
| Familiar | violet `#5B21B6` on `#EDE9FE` | Recalled correctly a few times |
| Mastered | `--success` green | Long interval, recalled reliably |

### Topic colours (colour-coding subjects)
Six hues, chosen to stay distinguishable. Use the strong colour for text/icons and the soft colour for the chip background (all ≥ 6.3:1).

| Topic | Strong | Soft |
|---|---|---|
| Blue | `#1E40AF` | `#DBEAFE` |
| Teal | `#115E59` | `#CCFBF1` |
| Violet | `#5B21B6` | `#EDE9FE` |
| Pink | `#9D174D` | `#FCE7F3` |
| Orange | `#9A3412` | `#FFEDD5` |
| Lime | `#3F6212` | `#ECFCCB` |

A topic colour is assigned once per subject and never changes, so the student learns "biology is teal".

---

## 4. Typography

| Role | Font | Size / line-height | Weight | Tracking |
|---|---|---|---|---|
| Page title | Nunito | 32px / 1.2 | 800 | -0.01em |
| Section title | Nunito | 22px / 1.3 | 800 | 0 |
| Card title | Nunito | 18px / 1.35 | 700 | 0 |
| Body / study text | system sans | 17px / 1.6 | 400 | 0 |
| UI text | system sans | 15px / 1.5 | 400–600 | 0 |
| Metadata | system sans | 14px / 1.4 | 400, tabular numbers | 0 |
| Code / formulas | ui-monospace | 15px / 1.5 | 400 | 0 |

- **Nunito** (rounded, friendly) for headings only. Self-hosted via `@fontsource-variable/nunito` — never from the Google Fonts CDN (it sends the student's IP to Google; ruled a GDPR problem in the EU).
- **System sans** for reading: fastest to load, the font each student's device renders best.
- Study text is max **68 characters per line** (`--prose-width: 68ch`).
- No negative tracking below 32px, no weights below 400, no all-caps paragraphs.
- Numbers that change (points, counts, timers) use `font-variant-numeric: tabular-nums` so they don't jitter.

---

## 5. Shape, space, depth

- **Spacing:** 4px base. Scale: 4, 8, 12, 16, 24, 32, 48, 64.
- **Radius:** `--radius-sm` 8px (inputs, small buttons) · `--radius-md` 12px (cards) · `--radius-lg` 16px (large panels, flashcards) · `--radius-pill` 999px (chips, badges).
- **Depth** comes from surface colour and a hairline border. Cards may use one soft shadow (`0 1px 2px rgb(28 25 23 / 0.06)`). No floating, blurred card shadows.
- **The press shadow** is the one solid shadow in the system: primary buttons sit on a 3px `--primary-edge` ledge and drop onto it when pressed.

---

## 6. Components

### Buttons
| Variant | Look | Use |
|---|---|---|
| Primary | `--primary` fill, white text, 3px solid `--primary-edge` shadow, radius 12px, min height 44px | One per screen: "Učitaj PDF", "Provjeri", "Nastavi" |
| Secondary | `--surface` fill, `--text`, 2px `--border-strong` border | Alternatives: "Preskoči", "Natrag" |
| Ghost | Transparent, `--primary-hover` text | Low-emphasis actions in lists |
| Danger | Secondary style with `--danger` text | Destructive actions (delete), always behind a confirmation |

Pressed: `transform: translateY(2px)` and the shadow shrinks to 1px — 100ms ease-out. Hover only under `@media (hover: hover)`.

### Answer feedback
- **Correct:** `--success-soft` background, ✓ icon, "Točno" + the short explanation. Card does a 1→0.98→1 pulse (≤ 200ms).
- **Wrong:** `--danger-soft` background, ✗ icon, "Nije točno" + the correct answer and its citation. No shake, no full-screen red.
- **Marked mistake ("Pronađi grešku"):** the selected span gets `--highlight`. The correction is shown in `--success`.

### Cards
- **Material card:** `--surface`, 1px `--border`, radius 12px, padding 16px. Selected: `--primary` border + `--primary-soft` fill.
- **Flashcard:** radius 16px, padding 24px, min-height 220px. Flip = `rotateY` 250ms on `transform` only.
- **Encouragement callout:** `--motivation-soft` background, amber icon, `--motivation` text. For tips and "keep going" moments.

### Chips and badges
Pill-shaped, 13–14px, 4×10px padding. Topic chips use the topic soft/strong pair. The streak badge uses `--motivation` / `--motivation-soft` with a flame icon.

### Inputs
`--surface`, 2px `--border-strong`, radius 8px, min height 44px. Focus: 3px `--focus` ring with 2px offset. The answer input in practice is taller (56px) and 18px text.

### Messages
Errors and notices are inline callouts (soft background + icon + text), placed next to what caused them. `role="alert"` for errors.

### Icons
One authored set in `frontend/src/ui/Icon.tsx`: 24px grid, 2px round stroke, `currentColor`, decorative unless given a label. Never Unicode glyphs or emoji as icons.

### Card list (managing cards)
One list per section on `--surface` with 1px `--border` dividers between cards — not a box per card. A `--primary-soft` practice bar sits on top: the count ("12 kartica · 5 cjelina") and the panel's one primary action, **Vježbaj**. Answers in the list stay hidden behind "Prikaži odgovor".

### Study session (practising cards)
Combines Anki's one-card-at-a-time review, RemNote's progress bar and source context, and a tactile index card.
- Full-screen focus layer (`role="dialog"`), top bar with "Završi" and a `--success` progress bar ("3 / 12").
- The card: white index card with faint ruled lines, radius 16px, flips with `rotateY` 250ms. Front: the question (fill-ins show a `--primary` blank). Back: the answer, for fill-ins the whole sentence with the term in `<mark>`, plus "Iz tvoje skripte" and the source sentence.
- Before the answer: one full-width primary "Prikaži odgovor" and the hint to recall first. After: four ratings — **Ponovo** (set apart, `--danger` label), **Teško · Dobro · Lako** grouped; each with a short meaning ("nisam se sjetio", "s mukom", "sjetio sam se", "odmah"). "Dobro" is softly preselected (`--primary-soft`). No interval hints until scheduling exists.
- Keyboard: Space/Enter reveal, 1–4 rate, Escape closes; focus returns to "Vježbaj". A card rated Ponovo returns after three other cards in the same session.
- End screen: `--success` check, counts (znao / s mukom / ponavljanja), encouragement callout, "Vježbaj ponovno" + "Natrag na kartice".

### Browser surfaces
Text selection uses `--highlight`; `accent-color` and the scrollbar follow the palette; links use `--primary-hover` with a 0.2em underline offset.

---

## 7. Motion

| Moment | Animation | Duration / easing |
|---|---|---|
| Button press | `translateY(2px)` + shadow trim | 100ms `--ease-out` |
| Hover (pointer devices only) | Colour change | 150ms ease |
| Card flip | `rotateY(180deg)` | 250ms `--ease-out` |
| Correct answer | Scale pulse 1 → 0.98 → 1 + colour | ≤ 200ms |
| Panel / list item entering | Opacity 0 → 1 + `translateY(4px)` → 0 | 200ms `--ease-out` |
| Streak milestone, section mastered | Celebration allowed (rare) | ≤ 600ms |

- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`.
- Never animate things the student does dozens of times a minute (rating a card, typing an answer, keyboard shortcuts) beyond the press feedback.
- Animate only `transform` and `opacity`.
- `prefers-reduced-motion: reduce` → no movement; keep colour changes and icons.

---

## 8. Layout and responsiveness

- Mobile-first. Minimum width 360px, side gutter 16px, no horizontal scroll.
- Content max width 1100px. Study text max 68ch.
- Two-column (list + detail) from 760px up; single column below.
- Touch targets ≥ 44×44px.

---

## 9. Voice

- Croatian and English UI (i18n). Short, direct, second person: "Učitaj skriptu", "Danas za ponavljanje: 12 kartica".
- Encourage effort, not talent: "Još 3 kartice do kraja" rather than "Bravo, genijalac si".
- Errors say what happened and what to do: "PDF nema teksta. Skenirani dokumenti još nisu podržani."

---

## 10. Do / Don't

**Do**
- Keep the canvas neutral and let colour mean something.
- Pair every status colour with an icon and a word.
- Use blue for actions, green for knowledge, amber for motivation.
- Check contrast for every new colour pair (text 4.5:1, UI 3:1).

**Don't**
- Don't use red for buttons, headings, backgrounds or "important" — only for wrong answers and errors.
- Don't highlight more than one or two things per card.
- Don't default to dark mode or use pure black.
- Don't load fonts or assets from third-party CDNs.
- Don't use another brand's colours, mascot or illustrations.

---

## References
- Piepenbrock, Mayr & Buchner (2014), positive polarity advantage — Ergonomics.
- Elliot et al. (2007), red and performance attainment — J. Exp. Psych.: General.
- Mehta & Zhu (2009), blue or red? — Science.
- Um, Plass, Hayward & Homer (2012); Plass et al. (2014), emotional design in multimedia learning — J. Ed. Psych.; Learning and Instruction.
- Ponce et al. (2022), highlighting meta-analysis — Educational Psychology Review.
- Community DESIGN.md files: Khan Academy, Duolingo (webdesignhot.com), Sanity (design.hagicode.com).
