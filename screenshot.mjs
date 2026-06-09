import { chromium } from 'playwright';
import path from 'path';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:4173';
const SHOTS_DIR = 'C:/Users/Max/scopelock-app/screenshots';
mkdirSync(SHOTS_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

const msgs = [];
page.on('pageerror', e => msgs.push(`[pageerror] ${e.message}`));

// ── 1. Stage 1 (blank) ──────────────────────────────────────────────────────
await page.goto(BASE);
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(3000);
await page.screenshot({ path: path.join(SHOTS_DIR, '1-stage1-blank.png') });
console.log('Shot 1: Stage 1 blank');

// Check for errors
if (msgs.length) { console.log('Errors:', msgs); }

// ── 2. Fill Stage 1 ─────────────────────────────────────────────────────────
await page.fill('input[placeholder*="Sarah"]', 'James & Emily Whitfield');
await page.fill('input[placeholder*="Harbour"]', '14 Harbourview Crescent, Mosman NSW 2088');
await page.locator('button:has-text("$250K – $500K")').click();
await page.locator('button:has-text("Creating Dream Home")').click();
await page.locator('button:has-text("Expanding for Family")').click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(SHOTS_DIR, '2-stage1-filled.png') });
console.log('Shot 2: Stage 1 filled');

// ── 3. Stage 2 ──────────────────────────────────────────────────────────────
await page.locator('button:has-text("Next")').click();
await page.waitForTimeout(400);
await page.locator('button:has-text("Hamptons")').click();
await page.locator('button:has-text("Coastal")').click();
await page.locator('button:has-text("Maximising Natural Light")').click();
await page.locator('button:has-text("Indoor–Outdoor Flow")').click();
await page.locator('button:has-text("Open Plan Living")').click();
await page.locator('button:has-text("Entertaining Spaces")').click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(SHOTS_DIR, '3-stage2.png') });
console.log('Shot 3: Stage 2');

// ── 4. Stage 3 ──────────────────────────────────────────────────────────────
await page.locator('button:has-text("Next")').click();
await page.waitForTimeout(400);
const textareas = page.locator('textarea');
await textareas.nth(0).fill("Island bench essential, stone benchtops, butler's pantry, fully integrated appliances, north-facing aspect");
await textareas.nth(1).fill("Large WIR required, ensuite with double vanity and freestanding bath, north-facing");
await textareas.nth(2).fill("Open plan kitchen/dining/living, big windows for light, bi-fold doors to alfresco, high ceilings");
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(SHOTS_DIR, '4-stage3.png') });
console.log('Shot 4: Stage 3');

// ── 5. Stage 4 ──────────────────────────────────────────────────────────────
await page.locator('button:has-text("Next")').click();
await page.waitForTimeout(400);
await page.locator('textarea').fill("Solar panels required. Smart home automation. Double garage with EV charging. Polished concrete floors throughout ground level. Future pool area to be considered in structural design. Heritage overlay applies to front facade.");
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(SHOTS_DIR, '5-stage4.png') });
console.log('Shot 5: Stage 4');

// ── 6. Generate — catch loading state ────────────────────────────────────────
await page.locator('button:has-text("Generate Project Brief")').click();
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(SHOTS_DIR, '6-loading.png') });
console.log('Shot 6: AI loading state');

// ── 7. Wait for generated brief ──────────────────────────────────────────────
await page.waitForTimeout(2200);
await page.screenshot({ path: path.join(SHOTS_DIR, '7-brief-generated.png') });
console.log('Shot 7: Brief generated — full desktop view');

// ── 8. Right panel scrolled to Project Narrative + Design Vision ─────────────
const rightPanel = page.locator('#brief-document').last();
await rightPanel.evaluate(el => el.scrollTop = 300);
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(SHOTS_DIR, '8-brief-narrative.png') });
console.log('Shot 8: Narrative + Design Vision');

// ── 9. Room Specifications section ───────────────────────────────────────────
await rightPanel.evaluate(el => el.scrollTop = 800);
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(SHOTS_DIR, '9-room-specs.png') });
console.log('Shot 9: Room specifications');

// ── 10. Additional Requirements ──────────────────────────────────────────────
await rightPanel.evaluate(el => el.scrollTop = 1200);
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(SHOTS_DIR, '10-additional.png') });
console.log('Shot 10: Additional requirements');

await browser.close();
console.log('\nDone. Screenshots in', SHOTS_DIR);
