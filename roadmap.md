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

## Phase 3 — Sharing, Polish & Monetisation 🔜

**Up next.** The priorities below are roughly ordered by user impact.

### 3.1 — Shareable Brief Link
Generate a unique read-only URL for each brief (e.g. `scopelock-app.vercel.app/brief/{id}`) so contractors can send a link to the client for review without needing to download a PDF.

- Store brief JSON server-side (Vercel KV or PlanetScale)
- Read-only rendered view (no wizard chrome)
- Optional expiry / password protection

### 3.2 — Additional Room Types
Expand Stage 3 beyond the three fixed rooms to support configurable rooms: bathrooms, laundry, home office, garage, alfresco, pool, granny flat.

- Dynamic "Add Room" UI in Stage 3
- Per-room AI scope generation
- Room list reflected in PDF and Markdown export

### 3.3 — PDF Styling Overhaul
The current PDF is functional but sparse. Elevate it to a document a contractor would be proud to hand a client.

- Brand colour theming pulled from contractor profile
- Section icons, dividers, and typography hierarchy
- Cover page with project image placeholder and contractor logo
- Footer with page numbers and "Confidential" watermark option

### 3.4 — Email Brief to Client
One-tap "Email to Client" action from the brief toolbar.

- Resend (or similar) for transactional email
- Brief body as HTML, PDF attached
- Contractor reply-to address from their profile

### 3.5 — Multi-Stage Progress Autosave Indicator
Show users that their progress is being saved as they type — a subtle "Saved" pulse in the header rather than silent background writes.

### 3.6 — Onboarding & Empty State
First-run experience for new contractors:

- Prompt to complete contractor profile before first brief
- Guided tooltip overlay for first session
- Sample brief pre-loaded to demonstrate the output quality

### 3.7 — Subscription & Access Control (Monetisation)
Gate advanced features (shareable links, additional rooms, email) behind a paid tier.

- Stripe integration
- Free tier: 5 briefs/month, PDF + Markdown export
- Pro tier: unlimited briefs, shareable links, email, priority AI

---

## Known Tech Debt

| Item | Priority |
|------|----------|
| Bundle size warning — main JS chunk is ~1.9MB (gzip: 619KB), driven by `@react-pdf/renderer` | Medium |
| `@react-pdf/renderer` requires `optimizeDeps.exclude` in Vite config — monitor for upstream fixes | Low |
| No unit or integration tests | Medium |
| `eslint-disable` on signature `useEffect` dependency array | Low |
