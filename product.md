# Study buddy — product document

> Project for the **Digital Education** course, FER, 2026.
> Document status: working draft · last edited: 12 Nov 2026.
> Development status: Spring Boot backend skeleton created; no features built yet. The idea, scope, competitor analysis, pitch and plan are done.

---

## 1. Summary

**Study buddy** is a web app for studying from your own materials. The learner uploads lecture notes or a script, and the app turns them into flashcards, fill-in-the-blank exercises and quizzes, guides them through focused study blocks, and uses a spaced-repetition algorithm to bring material back just before they would forget it.

What sets it apart: the **"Find the mistake"** quiz, in which the AI deliberately makes a mistake and the learner has to find and correct it.

The **project goal** has two parts:
1. Build the app (MVP by W9, full version by W12).
2. Test, with as many participants as possible, whether they learn more effectively with it than the usual way.

---

## 2. Problem

| Problem | What happens | Consequence |
|---|---|---|
| Passive learning | Learners mostly reread and highlight | In the research review (Dunlosky et al., 2013) these techniques have the weakest effect |
| Scattered tools | Flashcards in one app, notes in another, timer in a third, planner in a fourth | Time and focus are lost with every switch |
| Distractions | The phone is both a study tool and the main source of distraction | Short sessions, many interruptions |
| No review | Material is learned for the exam and forgotten | Little knowledge remains after the exam |

Practice testing (recall from memory) and spaced repetition are the two techniques with the strongest evidence. They are the core of Study buddy.

---

## 3. Target users

**University and high-school students** who study from their own materials (scripts, notes, slides).

| Persona | Description | What they need |
|---|---|---|
| **University student, 20** | Several exams in the exam period, lecture materials as PDFs | Quickly turn scripts into practice, not forget material before the exam |
| **High-school student, 17** | Studies for tests and the state matura, easily distracted | Short sessions, a clear list of what to review today, motivation |

**Important because of minors:** in Croatia the age of digital consent is 16. Users under 16 need parental consent (see §9).

**Out of scope:** teachers (sharing materials, class overview) are not part of the project.

---

## 4. Learning flow

The app takes the user through four steps:

| Step | What the user does | Features |
|---|---|---|
| **1. Plan** | Enters exams and deadlines, uploads materials | Planner, material upload |
| **2. Study** | Works through their own materials in focus blocks | Pomodoro, focus sound, AI assistant |
| **3. Practice** | Answers AI-generated tasks from memory | Flashcards, fill-in-the-blanks, open questions, "Find the mistake" quiz |
| **4. Review** | Gets a daily list of what is due | Spaced-repetition algorithm (FSRS) |

Pomodoro and sound are not a separate learning mode but a concentration frame used in both step 2 and step 3.

**What counts as learning:** progress is measured not by time spent in the app but by correct answers from memory.

---

## 5. Features

Priority: **MVP** = phase 1 (by W9) · **P2** = phase 2 (by W12) · **Later** = after the course.

### 5.1 Material upload and processing — MVP (PDF), P2 (DOCX)

**User story:** As a learner I want to upload my script so the app can create tasks from it.

- MVP: upload a text PDF (not a scanned one).
- P2: upload DOCX.
- Later: images and scanned PDFs (OCR), slide decks.
- Text is extracted from the file and split into sections (by headings or length).
- The material's language is detected automatically (Croatian or English), and all generated content is in the material's language.

**Acceptance criteria**
- The user sees a list of their materials and the sections in each.
- A file larger than [__ MB] or without text is rejected with a clear message.
- Materials are private: only the user who uploaded them can see them.

### 5.2 AI generation of flashcards and fill-in-the-blanks — MVP

**User story:** As a learner I want the app to make flashcards from my materials so I don't have to write them by hand.

- For each section the AI generates:
  - **flashcards** (question → answer),
  - **fill-in-the-blanks** (a sentence from the material with a key term removed).
- Each task stores which part of the material it came from (a quote), so the user can check its accuracy.
- Generated once and stored in the database; daily review uses no AI.
- The user can edit or delete a card.
- P2: a second AI accuracy check before saving, and a "Report mistake" button.

**Acceptance criteria**
- A one-page section yields at least [__] cards in a reasonable time.
- Every card links to the source part of the material.

### 5.3 Spaced repetition (FSRS) — MVP

**User story:** As a learner I want to know every day what to review so I don't forget the material.

- The **FSRS** algorithm computes when each card comes back.
- After answering, the user rates how well they knew it (e.g. *Again / Hard / Good / Easy*).
- What they don't know comes back more often, what they know less and less often, but nothing disappears completely.
- Home screen: "Due for review today: N cards".
- Flashcards and fill-in-the-blanks are scheduled individually; open questions and quizzes by **topic** (more often from topics where the user makes mistakes).
- P2: review adapts to the exam date from the planner (gets denser before the exam).

**Acceptance criteria**
- Every answer is logged (time, rating) for evaluation.
- A card rated "Again" comes back in the same session.

### 5.4 "Find the mistake" quiz — MVP

**User story:** As a learner I want to find mistakes in AI answers so I can actively check whether I understand the material.

- The AI answers a question from the material and inserts **one plausible mistake**.
- The user marks the part of the answer that is wrong and writes a correction.
- The AI checks the correction and shows the correct answer with a quote from the material.
- Example: *"Most ATP is produced in the ribosomes"* → correction: *mitochondria*.

**Acceptance criteria**
- There is always exactly one mistake, and it is verifiable from the material.
- The user gets feedback immediately after correcting.

**Risk:** the AI may insert a mistake that is hard to prove, or accidentally make two. Mitigation: the generator also returns a description of the inserted mistake, and a second AI check confirms it.

### 5.5 Pomodoro — MVP (basic), P2 (sound)

- MVP: a timer with work and break blocks (default 25 + 5 min, adjustable).
- P2: **focus sound** — instrumental music, ambience, brown noise (music with lyrics usually interferes with reading).
- The timer runs both while the user studies material and while they solve tasks.

### 5.6 Planner (Notion-like) — P2

**User story:** As a learner I want my exams, tasks and notes in one place so I don't need yet another app.

- Pages made of blocks (text, headings, lists, checklists), organised by subject.
- A calendar with exams and deadlines.
- Tasks with a due date and status.
- Link to studying: an exam is tied to materials, and the review schedule adapts to the exam date.

**Note:** this is the biggest phase-2 feature. The recommendation is to use an existing block editor (e.g. BlockNote or Tiptap) instead of writing one. See the risks in §13.

### 5.7 Open questions with AI grading — P2

- The user answers in their own words.
- The AI grades the answer (e.g. correct / partially correct / incorrect), explains what is missing and quotes the material.
- Answers are compared by meaning, not word for word.

### 5.8 AI assistant — P2

- The user asks questions about the material while studying.
- The assistant answers **only from the user's materials** (RAG: searching sections with embeddings) and cites the source.
- If the answer is not in the materials, it says so clearly.

### 5.9 Gamification — P2

- **Streak:** grows when the user completes the daily review.
- **Points:** for correct answers and mistakes found in the quiz, not for clicking.
- **Badges:** for progress (e.g. first section mastered, 7 days in a row).

### 5.10 Out of scope for the course

| Feature | Why not now |
|---|---|
| Mobile app | A web app is enough for the course |
| Teachers and classes | Focus on learners |
| Educational feed | Dropped by team decision |
| Shared study rooms | Later |
| Audio mode, OCR | Later |
| Monetisation | Not a project goal |

---

## 6. Language

- UI in **Croatian and English** (i18n from the start, e.g. `react-i18next`).
- The AI generates tasks **in the material's language**.
- The assistant answers in the language of the question.
- Code, database names and API paths are in English.

---

## 7. Technical architecture

| Layer | Technology | Note |
|---|---|---|
| Frontend | **React + TypeScript** (Vite) | SPA in `frontend/`; calls the backend REST API |
| Backend | **Spring Boot 4** (Java 21, Gradle) | In `backend/`, package `com.ssz.studybuddy`; REST API, all AI calls, FSRS scheduling, file processing |
| Sign-in | **Auth0** | Frontend signs in with `@auth0/auth0-react` and sends the access token; backend validates it as an OAuth2 Resource Server |
| Database | **PostgreSQL** (e.g. Supabase or Neon; Docker Compose locally) | Schema via Flyway, access via Spring Data JPA |
| File storage | Supabase Storage or S3 | Uploaded PDF/DOCX |
| Vector search | **pgvector** | For the AI assistant (P2), via Spring AI |
| AI | **OpenAI API** via **Spring AI** | Generation, checking, grading, embeddings |
| Spaced repetition | **FSRS** on the backend | Java port of FSRS (to verify), or `ts-fsrs` on the frontend with the backend only storing state |
| PDF / DOCX processing | Apache PDFBox, Apache POI | Text extraction |
| Planner | BlockNote or Tiptap | Block editor (P2) |
| Hosting | Frontend: Vercel or Netlify · Backend: e.g. Render, Railway or Fly.io | Free tiers of backend hosts sleep or are limited — check before the pilot |

The backend talks to Postgres directly and checks on every request that the data belongs to the signed-in user (Auth0 `sub` → `users.auth0_id`). The frontend never accesses the database.

**Backend dependencies:** Spring Web, OAuth2 Resource Server, Spring Data JPA, PostgreSQL Driver, Flyway Migration, Validation, Spring AI OpenAI, Docker Compose Support. Added later by hand: PDFBox, an FSRS library, and in P2 Apache POI and the Spring AI PGvector store.

**Secrets** (OpenAI key, database password, Auth0 settings) are passed as environment variables and never committed.

### 7.1 Data model (sketch)

```
users            id, auth0_id, language, date_of_birth, parental_consent
documents        id, user_id, name, type, language, created_at
chunks           id, document_id, position, text, embedding (P2)
cards            id, chunk_id, user_id, type (flashcard|fill_in), question, answer, quote
card_state       card_id, fsrs_state (due, stability, difficulty, reps, lapses...)
review_logs      id, card_id, user_id, rating, duration_ms, created_at
quizzes          id, chunk_id, question, answer_with_mistake, mistake_description, correct_answer
quiz_attempts    id, quiz_id, user_id, marked_part, correction, correct, created_at
focus_sessions   id, user_id, started_at, duration, type
planner_pages    id, user_id, subject, block_content (JSON)        -- P2
events           id, user_id, type (exam|deadline), date, document_ids    -- P2
```

### 7.2 AI flow

1. Upload → text extraction → split into sections.
2. One call per section: flashcards + fill-in-the-blanks + quiz questions (structured JSON output).
3. P2: a second accuracy check with a cheaper call.
4. Everything is stored; AI is not called during review.
5. AI is called live only for: checking the quiz correction, grading open answers, and the assistant.

---

## 8. Measurement and analytics

For evaluation and quality tracking the app logs:
- number of sessions, length of focus blocks,
- flashcard answers (rating, time), accuracy per topic,
- "Find the mistake" quiz attempts (whether the mistake was found),
- reports of mistakes in AI content.

Research data is exported **anonymised**.

---

## 9. Privacy, security and ethics

- **GDPR:** the user can download and delete all their data.
- **Minors:** date of birth is asked at sign-up; users under 16 need parental consent.
- **Materials are private:** never shared with other users.
- **OpenAI API:** data sent through the API is not used for model training by default; this must be stated in the privacy policy.
- **Research:** informed consent from all participants (and parents for those under 16), anonymous data, the right to withdraw.
- **AI literacy:** the "Find the mistake" quiz and the quotes attached to every answer teach the user that AI can be wrong.

---

## 10. AI costs — *open*

No decision yet. Proposal:
- generate once and store (review costs nothing),
- a cheaper model for generation and checking, a stronger one only where needed (grading open answers),
- a daily limit per user (e.g. [__] uploads and [__] assistant questions per day),
- a limit on material size,
- usage tracking and a budget alert on the OpenAI account.

---

## 11. Evaluation — *design open*

Based on the *Research Methodology* lecture (DIGOB-03).

**Approach:** mixed methods (quantitative + qualitative data) within design-based research (DBR): design → implementation → analysis (pilot) → redesign.

**Research question:** Do learners who study with Study buddy make greater progress from pre-test to post-test?

- **H0:** there is no difference.
- **H1:** studying with Study buddy leads to greater progress.

**Participants:** as many as possible (no fixed number).

**Design — pick one:**

| | A: with a control group | B: everyone uses the app |
|---|---|---|
| How | One group studies with Study buddy, the other the usual way | Everyone studies with the app; pre-test and post-test are compared |
| Advantage | Shows whether progress is due to the app | Easier to recruit, larger sample |
| Drawback | Needs more participants (two groups) | Cannot separate the app's effect from studying itself |
| Test | Independent-samples t-test or Mann-Whitney U | Paired t-test or Wilcoxon |

**Instruments**
- Pre-test and post-test of knowledge from one section (same type of questions).
- **SUS** usability questionnaire (10 questions).
- Open questions in the survey and short semi-structured interviews with a few participants.

**Analysis:** mean, standard deviation, distribution check, then a parametric or non-parametric test; significance level 0.05 with effect size. Qualitative answers are processed with thematic analysis.

**Watch out for:** sample size, choosing the right test, correlation is not causation.

---

## 12. Phase plan

| When | Phase | Area | Tasks |
|---|---|---|---|
| W6–W7 | MVP | Design | Wireframes: materials, practice, review |
| W6–W7 | MVP | Foundation | Spring Boot API, React (Vite) frontend, Auth0 sign-in, database, file storage |
| W7–W8 | MVP | Materials | PDF upload, text extraction, splitting into sections |
| W7–W8 | MVP | AI content | Flashcards and fill-in-the-blanks from materials |
| W8 | MVP | Review | FSRS schedule and daily list |
| W8–W9 | MVP | Quiz and focus | "Find the mistake", simple pomodoro |
| **W9** | | **Presentation** | **Working MVP, demo, pilot with 3–5 users** |
| W9–W10 | P2 | Redesign | Fixes based on the pilot, second AI check, DOCX |
| W9–W11 | P2 | Planner | Notion-like pages, calendar, exams, tasks |
| W9–W10 | P2 | Open questions | AI grading with quotes |
| W10 | P2 | AI assistant | RAG over materials |
| W10 | P2 | Motivation | Streak, points, badges, focus sound |
| W10 | Evaluation | Preparation | Tests, SUS survey, consent forms, recruiting participants |
| W11–W12 | Evaluation | Execution | Testing and interviews |
| W12–W13 | Wrap-up | Analysis | Statistical analysis, final presentation |

**Team roles (4+ members):** [fill in names and roles — e.g. frontend, backend and database, AI, planner, research and evaluation].

---

## 13. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Notion-like planner doesn't fit in phase 2 | High | Existing block editor; if late, a version with exams and deadlines is enough for evaluation |
| Accuracy of AI content | Medium | Quote with every task, second AI check, mistake reporting |
| OpenAI API cost | Medium | Generate once, limits, cheaper model |
| Too few participants | Medium | Start recruiting early, design B if needed |
| MVP late for W9 | Medium | MVP is deliberately small; the quiz is the first candidate to postpone |
| Consent for minors | Low | Age check and parental consent at sign-up |
| Auth0 between frontend and backend (audience, CORS) | Low | Set up at the very start (W6–W7) |

---

## 14. Open questions

1. Evaluation design: with a control group, or everyone uses the app?
2. AI cost control: limits and budget.
3. Which OpenAI models for which task (generation, checking, grading, embeddings)?
4. Database: Supabase (used as plain Postgres) or another Postgres service? Where to host the Spring backend?
5. FSRS: Java library on the backend, or `ts-fsrs` on the frontend?
6. Team roles and division of work.
7. Where to recruit participants (which faculty / school, which subject to test)?
8. If the planner is late: what is the minimum planner for W12?

---

## 15. Success criteria

- **W9:** a user can upload a PDF, get flashcards, review them on the FSRS schedule and complete a "Find the mistake" quiz.
- **W12:** all phase-2 features work; evaluation carried out.
- **Research:** progress from pre-test to post-test statistically tested, SUS score above average (≈ 68), themes from the interviews.
