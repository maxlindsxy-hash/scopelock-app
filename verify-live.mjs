import { chromium } from 'playwright';
import path from 'path';
import { mkdirSync } from 'fs';

const BASE = 'https://scopelock-app-silk.vercel.app';
const SHOTS_DIR = 'C:/Users/Max/scopelock-app/screenshots/live';
mkdirSync(SHOTS_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];

// ════════════════════════════════════════════════════════════════════════════
// TEST A — Tenant intake portal  (/apex-builds/intake, mobile viewport)
// ════════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST A: /apex-builds/intake ═══');
const intakePage = await browser.newPage();
await intakePage.setViewportSize({ width: 390, height: 844 });
intakePage.on('pageerror', e => errors.push(`[intake pageerror] ${e.message}`));

const intakeApiResponses = [];
intakePage.on('response', r => {
  if (r.url().includes('/api/')) intakeApiResponses.push({ url: r.url(), status: r.status() });
});

await intakePage.goto(`${BASE}/apex-builds/intake`, { waitUntil: 'networkidle' });
await intakePage.waitForTimeout(1000);
await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A1-intake-landing.png') });
console.log('A1: Intake portal loaded');

// Check for contractor chrome (these should NOT exist)
const hasContractorHeader = await intakePage.locator('text=ScopeLock').count();
const hasInboxBtn         = await intakePage.locator('button[aria-label="Inbox"]').count();
console.log(`Contractor header present: ${hasContractorHeader > 0 ? 'YES ⚠️ (should not be here)' : 'NO ✅'}`);
console.log(`Inbox button present: ${hasInboxBtn > 0 ? 'YES ⚠️ (should not be here)' : 'NO ✅'}`);

// Verify tenant branding
const apexText = await intakePage.locator('text=Apex Builds').count();
console.log(`"Apex Builds" branding present: ${apexText > 0 ? 'YES ✅' : 'NO ⚠️'}`);

// ── Fill identity gate ────────────────────────────────────────────────────────
const inputs = intakePage.locator('input');
const inputCount = await inputs.count();
console.log(`\nInputs found: ${inputCount}`);

if (inputCount >= 1) await inputs.nth(0).fill('Sarah & Tom Brennan');
if (inputCount >= 2) await inputs.nth(1).fill('sarah.brennan@email.com');
if (inputCount >= 3) await inputs.nth(2).fill('0412 345 678');
if (inputCount >= 4) await inputs.nth(3).fill('22 Cliffside Parade, Manly NSW 2095');
await intakePage.waitForTimeout(300);
await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A2-identity-filled.png') });
console.log('A2: Identity fields filled');

// Advance through phases — click any Next/Continue button
async function advance(pg, label) {
  const btn = pg.locator('button').filter({ hasText: /next|continue|start|begin/i }).first();
  if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await btn.click();
    await pg.waitForTimeout(600);
    console.log(`  → Advanced: ${label}`);
  } else {
    console.log(`  ⚠️  No advance button found for: ${label}`);
  }
}

await advance(intakePage, 'past identity');
await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A3-phase2.png') });
console.log('A3: Phase 2 loaded');

// Helper: fill textarea and continue
async function fillAndContinue(pg, text, label) {
  const ta = pg.locator('textarea').first();
  if (await ta.isVisible({ timeout: 2000 }).catch(() => false)) {
    await ta.fill(text);
    await pg.waitForTimeout(300);
  }
  await advance(pg, label);
}

// Phase 2 — free-text project overview
await fillAndContinue(intakePage,
  "We want to renovate our kitchen, master bathroom, and create a new master suite with walk-in wardrobe. Main goal is a coastal luxury feel with north-facing light.",
  'phase 2 → 3'
);
await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A4-phase3.png') });
console.log('A4: Phase 3 loaded');

// Phase 3 — style/aesthetic (chips or free text)
const styleChip = intakePage.locator('button').filter({ hasText: /coastal|hampton/i }).first();
if (await styleChip.isVisible({ timeout: 1000 }).catch(() => false)) {
  await styleChip.click();
  await advance(intakePage, 'phase 3 → 4');
} else {
  await fillAndContinue(intakePage,
    'Coastal and Hamptons aesthetic, maximising natural light, open plan living.',
    'phase 3 → 4'
  );
}
await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A5-phase4.png') });
console.log('A5: Phase 4 loaded');

// Phase 4 — rooms or specific details
const roomChip = intakePage.locator('button').filter({ hasText: /kitchen|bathroom/i }).first();
if (await roomChip.isVisible({ timeout: 1000 }).catch(() => false)) {
  for (const label of ['Kitchen', 'Bathroom', 'Master']) {
    const chip = intakePage.locator('button').filter({ hasText: new RegExp(label, 'i') }).first();
    if (await chip.isVisible({ timeout: 500 }).catch(() => false)) await chip.click();
  }
  await advance(intakePage, 'phase 4 → 5');
} else {
  await fillAndContinue(intakePage,
    'Kitchen with island bench and butler pantry. Master ensuite with freestanding bath.',
    'phase 4 → 5'
  );
}
await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A6-phase5.png') });
console.log('A6: Phase 5 loaded');

// Phase 5 — final notes / additional
await fillAndContinue(intakePage,
  'Solar panels, smart home automation, double garage with EV charging, north-facing orientation preferred.',
  'phase 5 → submit'
);
await intakePage.waitForTimeout(500);
await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A7-pre-submit.png') });
console.log('A7: Pre-submit state');

// Submit
const submitBtn = intakePage.locator('button').filter({ hasText: /submit|send|complete/i }).first();
const hasSubmit = await submitBtn.isVisible({ timeout: 1000 }).catch(() => false);
if (hasSubmit) {
  await submitBtn.click();
  await intakePage.waitForTimeout(3000); // wait for POST + animation
  await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A8-submitted.png') });
  console.log('A8: Submitted — checking ThankYou screen');

  const thankYouText = await intakePage.locator('text=Project details captured').count();
  const securedBy    = await intakePage.locator('text=ScopeLock').count();
  console.log(`ThankYou copy ("Project details captured"): ${thankYouText > 0 ? 'YES ✅' : 'NO ⚠️'}`);
  console.log(`"Secured by ScopeLock" footer: ${securedBy > 0 ? 'YES ✅' : 'NO ⚠️'}`);

  const submitApiHit = intakeApiResponses.find(r => r.url.includes('submit-intake'));
  console.log(`\n/api/submit-intake: ${submitApiHit ? `HTTP ${submitApiHit.status} ${submitApiHit.status === 200 ? '✅' : '⚠️'}` : 'NOT CALLED ⚠️'}`);
} else {
  await intakePage.screenshot({ path: path.join(SHOTS_DIR, 'A8-no-submit.png') });
  console.log('A8: Submit button not found — captured current state');
}

// ════════════════════════════════════════════════════════════════════════════
// TEST B — Contractor dashboard  (desktop, main app)
// ════════════════════════════════════════════════════════════════════════════
console.log('\n═══ TEST B: Contractor dashboard ═══');
const dashPage = await browser.newPage();
await dashPage.setViewportSize({ width: 1440, height: 900 });
dashPage.on('pageerror', e => errors.push(`[dashboard pageerror] ${e.message}`));

await dashPage.goto(BASE, { waitUntil: 'networkidle' });
await dashPage.waitForTimeout(1000);
await dashPage.screenshot({ path: path.join(SHOTS_DIR, 'B1-dashboard.png') });
console.log('B1: Dashboard loaded');

const appTitle = await dashPage.locator('text=ScopeLock').count();
console.log(`ScopeLock header: ${appTitle > 0 ? 'YES ✅' : 'NO ⚠️'}`);

// ── Results ─────────────────────────────────────────────────────────────────
console.log('\n═══ SUMMARY ═══');
if (errors.length) {
  console.log('Errors:');
  errors.forEach(e => console.log(' ', e));
} else {
  console.log('No JS errors detected ✅');
}
console.log(`\nScreenshots saved to ${SHOTS_DIR}`);

await browser.close();
