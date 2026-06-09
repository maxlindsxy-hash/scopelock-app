# ScopeLock — Product Roadmap

**Live URL:** https://scopelock-app-silk.vercel.app  
**Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Vercel Edge Functions · Claude claude-sonnet-4-6

---

## Phase 1 — Core Wizard & Brief Engine ✅

**Shipped.** The foundational product: a 4-stage questionnaire that generates a professional Project Brief.

- 4-stage animated questionnaire (framer-motion slide transitions)
  - Stage 1: Project Identity — client name, site address, budget range, motivation chips
  - Stage 2: Design & Aesthetic — architectural style chips, lifestyle goal chips
  - Stage 3: Room Requirements — kitchen, master bedroom, living zones (freetext)
  - Stage 4: Additional Notes — catch-all textarea
- Desktop 60/40 split-screen layout (wizard left, live brief preview right)
- Mobile single-column wizard + floating FAB → bottom-sheet brief modal
- Generate button fires confetti + sonner toast, transitions brief to "Generated" state
- Offline fallback engine — 37 local pattern-matching rules across all room types
- Contractor branding panel (company name, logo upload, phone, email, licence, ABN) persisted to `localStorage`
- Session history — up to 40 sessions saved, loadable, deletable
- PDF export via `@react-pdf/renderer` — A4 document with contractor header and all brief sections
- Client signature — custom canvas (mouse + touch, quadratic bezier smoothing, HiDPI)

---

## Phase 1 — Critical Bug Fix Sprint ✅

**Shipped.** QA pass on the live Vercel deployment surfaced four production issues, all resolved.

- **Double-click lock** — Generate button immediately disables on first click (`disabled={isRefining}`), preventing multi-fire API requests
- **Chaos input crash** — `isValidRefinedData()` runtime shape validator; malformed or partial AI responses fall through to local engine instead of throwing `Cannot read properties of undefined`
- **Lazy user prompt** — System prompt updated with `HANDLING MINIMALIST INPUT` block; AI now extrapolates full construction scope from shorthand (e.g. "nice kitchen"), proactively applies AS 3740, AS 1428, NCC standards
- **Offline fallback robustness** — `setIsRefining(false)` moved to `finally` block (guaranteed to fire); `clearTimeout` moved to `finally` (no timer leak on network failure)

---

## Phase 2 — Persistence, Guardrails & Export ✅

**Shipped.** State durability, input safety, and alternative export formats.

- **LocalStorage session persistence** — Active draft (`scopelock_active_v1`) survives page refresh or accidental tab close; all 8 restorable state fields lazy-initialise from localStorage on mount; `resetSession` clears the key
- **Token safety guardrails** — Per-field character limits enforced at the textarea level (room fields: 800 chars, additional notes: 1500 chars); live counter appears at 60% capacity, turns amber at 90%, red at 100%; `truncateFields()` pre-flight check in `handleGenerate` as a safety net for legacy session data
- **Copy to Clipboard** — Copies the full brief as Markdown; 2-second "Copied!" checkmark feedback on the button itself
- **Markdown export** — Downloads `ScopeLock-Brief-{ClientName}-{RefNumber}.md`; uses AI-refined copy where available, falls back to raw notes

---

## Phase 3 — Architectural Intelligence, Print & UI Polish ✅

**Shipped.** Multi-zone scope logic, production-grade print layout, and skeleton loading UX.

- **Multi-zone architectural logic** — System prompt updated with `HANDLING MULTI-ZONE INPUT` block; AI detects connectors (`+`, `&`, `,`, ` and `) and splits multi-space input (e.g. "Main bathroom + Ensuite + Powder room") into `## ZONE NAME ##` delimited sub-sections, each with its own AS/NCC compliance citations (AS 3740-2010 per wet area, AS 1288 glazing, AS 4586 slip resistance, AS 1428 accessibility, etc.)
- **Zone rendering in brief panel** — `parseZones()` parser in `ProjectBrief.tsx` detects the `## ZONE NAME ##` format and renders each zone as an indigo left-border sub-section with its own label and prose block; single-zone fields render unchanged
- **Zone-aware Markdown export** — `scopeToMarkdown()` converts `## ZONE NAME ##` delimiters to `####` sub-headings in `.md` downloads
- **Print/PDF CSS overhaul** — `@page { size: A4; margin: 18mm 16mm 20mm 16mm }`, 10.5pt body font, `break-inside: avoid` on all major document blocks (sections, rooms, zones, chips, scope lists, signature, footer); shadows stripped, large radii reduced, gradient fills collapsed to solid for laser printer compatibility
- **Semantic print classes** — Nine `brief-*` class names added to `ProjectBrief.tsx` DOM nodes (`brief-section`, `brief-room`, `brief-zone`, `brief-contractor`, `brief-letterhead`, `brief-narrative`, `brief-tags`, `brief-scope-list`, `brief-signature`, `brief-footer`) for stable CSS targeting
- **Skeleton loading state** — `AiLoadingState` spinner replaced with `BriefSkeleton`: a pixel-accurate `animate-pulse` ghost of the document structure (contractor block, letterhead, narrative card, chip rows, three room blocks, additional requirements); eliminates the layout shift when AI content arrives

---

## Phase 4 — B2B Conversational Architecture & Validation Gate ✅

**Shipped.** Full platform refactor into a premium contractor-to-client onboarding product. The four-stage chip form has been retired and replaced with a two-step validation gate: a conversational client intake followed by a contractor-controlled brief generation.

### 4.1 — Conversational Chat Wizard (Client-Facing)
Replaced the rigid 4-stage questionnaire with a 3-step single-question-at-a-time chat interface that feels like a professional intake assistant.

- **Q1 — Spaces & Goals:** Open textarea with a wide, clean design; client describes their project in plain English
- **Client-side room parser:** `parseRoomFlags()` runs entirely in the browser — no AI, no network call — keyword-matching against 8 room types (`kitchen`, `bathroom`, `masterBedroom`, `livingZone`, `laundry`, `study`, `outdoor`, `garage`)
- **Q2 — Dynamic Room Details:** Labeled textarea inputs rendered on the fly, one per flagged room; rooms are labelled with the exact names detected from Q1 (e.g. "Kitchen", "Bathroom(s)", "Master Bedroom Suite")
- **Q3 — Additional Notes:** Catch-all open textarea for finishes, constraints, and unique requirements
- **Completion screen:** Animated checkmark + handoff message; toast with direct "Go to Dashboard" action button
- **Session resumption:** Chat state survives page refresh; step is re-derived from saved transcript fields on mount
- **Step indicator:** 3-step progress bar (Spaces & Goals / Room Details / Final Notes) replaces the old 4-stage form tracker

### 4.2 — Raw Data Intake Schema (Zero AI Modification)
The client's answers are saved exactly as typed — no extrapolation, summarisation, or AI processing during the intake phase.

- New `ChatTranscript` type: `q1_spaces`, `roomFlags`, `q2_followups` (per-room keyed record), `q3_additional`, `completedAt`
- `Session` type extended with `transcript: ChatTranscript | null` field for history persistence
- `localStorage` key bumped to `scopelock_active_v2` to prevent stale-schema collisions
- `completedAt` timestamp gates the generate button — button is disabled and labelled "Awaiting client submission…" until the client submits

### 4.3 — Contractor Review Dashboard
New split-view contractor interface replacing the left-panel wizard.

- **Raw transcript card:** Displays Q1, Q2 (per-room sub-sections), and Q3 verbatim with section headers and italic question prompts — zero AI involvement visible to contractor
- **Ref + submitted timestamp** from `transcript.completedAt`
- **Detected spaces chips:** Indigo chip row summarising the rooms the parser flagged
- **Generate gate:** Dark slate card with `[ Generate Professional Brief ]` button — pulsing glow animation; only active after `completedAt` is set
- **View toggle:** Header button switches between "Client Chat" and "Contractor Dashboard" views; subtitle updates accordingly
- **Mobile FAB** for brief preview and inline generate button retained in contractor view only

### 4.4 — Local Regulations Engine (`regulations.json`)
Created `regulations.json` in the project root as the canonical compliance reference for all brief generation.

- **NCC 2022 Volume Two** (Parts H1–H7): Structure, damp/weatherproofing, fire safety, health & amenity, sound insulation, energy efficiency (7-star NatHERS), livable housing design
- **AS 3740-2010** Waterproofing: All four exposure type classifications, critical requirements (shower falls, bath surrounds, laundry), mandatory inspection hold point language
- **AS 4586-2013** Slip Resistance: P3/P4/P5 wet area classifications, R10/R11 external, residential minimums table
- **AS/NZS 3500-2021** Plumbing & Drainage: All four parts (water services, sanitary, stormwater, heated water), tempering valve mandate, licensed plumber certificate requirement
- **AS 1288-2006** Glass in Buildings: Human impact zones, shower screen minimum 6mm toughened, fall protection for openable windows
- **AS 1428-2021** Access & Mobility: Doorway clearances, corridor widths, turning circles, grab rail reinforcing
- **AS 4970-2009** Tree Protection: TPZ/SRZ calculations, arborist report requirement, fencing specifications
- **AS 2890-2004** Parking: Single/double/triple garage dimensions, driveway gradient limits
- **AS 1170** Structural Actions: Wind regions, earthquake, residential floor loads
- **Zone-compliance matrix:** Maps 10 space types to their mandatory standards
- **Compliance language templates:** Pre-written standard clauses for waterproofing, slip resistance, plumbing, glazing, fire separation, energy rating, smoke alarms, structural, livable housing

### 4.5 — Updated AI Translation Engine
`/api/refine` rewritten to accept `ChatTranscript` and generate compliance-grounded briefs.

- **New system prompt:** `COMPLIANCE_REFERENCE` constant embeds the full regulations library inline — AI must cite at least one standard per scope statement; fabricating non-existent standards explicitly prohibited
- **Mandatory grounding rules:** Wet areas → AS 3740 + AS 4586; plumbing → AS/NZS 3500; new structures → NCC H1; new dwellings → NCC H7 Livable Housing; energy → NCC H6 + NatHERS
- **`buildUserMessage()`:** Formats raw transcript into clearly labelled Q1/Q2/Q3 sections with room labels; per-field truncation at 1200 chars (Q3 at 1800) to prevent token overruns without modifying verbatim content
- **Input validation:** Rejects payloads missing `q1_spaces` with a 400 before hitting the AI
- **Multi-zone detection preserved:** AI still separates "Bathroom + Ensuite + Powder Room" into `## ZONE NAME ##` sub-sections, each with independent compliance citations
- **Live test result:** 25s wall time on claude-haiku-4-5; Master Ensuite output cited AS 3740-2010 Type 2, AS 1288-2006, AS 4586-2013, AS/NZS 3500:2021, AS 1428.1-2021, and mandatory inspection hold point — all grounded in `regulations.json`

---

## Phase 5 — Launch Hardening 🔜

**Final pre-launch tasks.** Vercel environment, domain, observability, and access control.

### 5.1 — Vercel Environment Variable Audit
Confirm all production secrets are correctly set in the Vercel dashboard and not accidentally committed to the repo.

- `ANTHROPIC_API_KEY` — verify it is set under **Settings → Environment Variables → Production** (not Preview or Development only)
- Confirm `.env` and `.env.local` are in `.gitignore` and have never been committed
- Rotate the API key if there is any doubt about exposure
- Add `VERCEL_ENV` guard to `api/refine.ts` if rate-limiting by environment is needed

### 5.2 — Custom Domain Mapping
Map the production alias to a custom domain for a professional client-facing URL.

- Purchase or transfer domain (e.g. `scopelock.com.au` or `app.scopelock.com.au`)
- Add domain in Vercel **Settings → Domains**
- Configure DNS: CNAME `@` → `cname.vercel-dns.com` or A record as directed
- Verify SSL certificate auto-provisioned via Let's Encrypt
- Update `roadmap.md` **Live URL** once confirmed

### 5.3 — API Rate Limiting & Abuse Prevention
The `/api/refine` edge function is publicly callable with no authentication. Before launch:

- Add a simple IP-based rate limit (Vercel's built-in edge middleware or Upstash Redis)
- Return `429 Too Many Requests` with a `Retry-After` header on breach
- Front-end should surface a `toast.error` on 429 rather than falling through to local engine silently (distinguish rate-limit from genuine offline)

### 5.4 — Production Error Monitoring
Add Sentry (or similar) so production errors surface without needing a user to report them.

- Install `@sentry/react` and `@sentry/vite-plugin`
- Capture unhandled promise rejections and React error boundaries
- Set `release` tag to git SHA via Vite define at build time
- Add `SENTRY_DSN` to Vercel environment variables

### 5.5 — Performance Baseline
The main JS bundle is ~1.9MB (620KB gzip), driven primarily by `@react-pdf/renderer`. Before launch, establish a baseline and document acceptable thresholds.

- Run Lighthouse on the production URL; target LCP < 2.5s on 4G
- Consider lazy-loading `BriefPDF` behind a dynamic `import()` to defer the renderer until the PDF button is clicked
- Document the baseline score in this file once measured

### 5.6 — Smoke Test Checklist (Pre-Deploy Gate)
Run this manually before each production deploy:

- [ ] Generate a brief with AI (online) — confirm AI-enhanced copy appears
- [ ] Generate a brief offline (DevTools → Network → Offline) — confirm fallback toast fires, local brief renders
- [ ] Type 800+ chars in a room field — confirm counter turns red and input is capped
- [ ] Refresh mid-fill — confirm form state and stage are restored from localStorage
- [ ] Download PDF — confirm file opens correctly and contractor header is present
- [ ] Export MD — confirm `## ZONE NAME ##` delimiters appear as `####` headings
- [ ] Print (Ctrl+P) — confirm wizard panel is hidden, brief fills the page, no sections cut across page break
- [ ] Mobile (375px) — confirm FAB is visible, brief modal opens, signature field is usable

---

## Known Tech Debt

| Item | Priority |
|------|----------|
| Bundle size ~1.9MB gzip 620KB — driven by `@react-pdf/renderer`; candidate for dynamic `import()` on PDF button click | Medium |
| `optimizeDeps: { include: ['@react-pdf/renderer'] }` required in Vite 8 to fix CJS interop — monitor for upstream fix | Low |
| Offline fallback (`refineProjectBrief`) still uses empty `ProjectData`, not `ChatTranscript` — fallback brief is minimal if AI unavailable | Medium |
| `regulations.json` is embedded in the API as a string constant; not read at runtime — update both files if compliance data changes | Low |
| No unit or integration tests | Medium |
| `eslint-disable` on signature `useEffect` dependency array | Low |
| `/api/refine` has no authentication or rate limiting | High — Phase 5.3 |
