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

## Phase 4 — Launch Hardening 🔜

**Final pre-launch tasks.** Vercel environment, domain, observability, and access control.

### 4.1 — Vercel Environment Variable Audit
Confirm all production secrets are correctly set in the Vercel dashboard and not accidentally committed to the repo.

- `ANTHROPIC_API_KEY` — verify it is set under **Settings → Environment Variables → Production** (not Preview or Development only)
- Confirm `.env` and `.env.local` are in `.gitignore` and have never been committed
- Rotate the API key if there is any doubt about exposure
- Add `VERCEL_ENV` guard to `api/refine.ts` if rate-limiting by environment is needed

### 4.2 — Custom Domain Mapping
Map the production alias to a custom domain for a professional client-facing URL.

- Purchase or transfer domain (e.g. `scopelock.com.au` or `app.scopelock.com.au`)
- Add domain in Vercel **Settings → Domains**
- Configure DNS: CNAME `@` → `cname.vercel-dns.com` or A record as directed
- Verify SSL certificate auto-provisioned via Let's Encrypt
- Update `roadmap.md` **Live URL** once confirmed

### 4.3 — API Rate Limiting & Abuse Prevention
The `/api/refine` edge function is publicly callable with no authentication. Before launch:

- Add a simple IP-based rate limit (Vercel's built-in edge middleware or Upstash Redis)
- Return `429 Too Many Requests` with a `Retry-After` header on breach
- Front-end should surface a `toast.error` on 429 rather than falling through to local engine silently (distinguish rate-limit from genuine offline)

### 4.4 — Production Error Monitoring
Add Sentry (or similar) so production errors surface without needing a user to report them.

- Install `@sentry/react` and `@sentry/vite-plugin`
- Capture unhandled promise rejections and React error boundaries
- Set `release` tag to git SHA via Vite define at build time
- Add `SENTRY_DSN` to Vercel environment variables

### 4.5 — Performance Baseline
The main JS bundle is ~1.9MB (620KB gzip), driven primarily by `@react-pdf/renderer`. Before launch, establish a baseline and document acceptable thresholds.

- Run Lighthouse on the production URL; target LCP < 2.5s on 4G
- Consider lazy-loading `BriefPDF` behind a dynamic `import()` to defer the renderer until the PDF button is clicked
- Document the baseline score in this file once measured

### 4.6 — Smoke Test Checklist (Pre-Deploy Gate)
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
| Bundle size ~1.9MB gzip 620KB — driven by `@react-pdf/renderer`; candidate for dynamic import | Medium |
| `@react-pdf/renderer` requires `optimizeDeps.exclude` in Vite config — monitor for upstream fix | Low |
| Duplicate toolbar buttons in DOM at desktop viewport (mobile modal renders hidden, buttons are keyboard-reachable) | Medium |
| No unit or integration tests | Medium |
| `eslint-disable` on signature `useEffect` dependency array | Low |
| `/api/refine` has no authentication or rate limiting | High — Phase 4.3 |
