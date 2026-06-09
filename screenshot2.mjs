import { chromium } from 'playwright';
import path from 'path';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:4173';
const SHOTS_DIR = 'C:/Users/Max/scopelock-app/screenshots';
mkdirSync(SHOTS_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Re-fill the form quickly
await page.goto(BASE);
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(2500);

await page.fill('input[placeholder*="Sarah"]', 'James & Emily Whitfield');
await page.fill('input[placeholder*="Harbour"]', '14 Harbourview Crescent, Mosman NSW 2088');
await page.locator('button:has-text("$250K – $500K")').click();
await page.locator('button:has-text("Creating Dream Home")').click();
await page.locator('button:has-text("Expanding for Family")').click();

await page.locator('button:has-text("Next")').click();
await page.waitForTimeout(400);
await page.locator('button:has-text("Hamptons")').click();
await page.locator('button:has-text("Coastal")').click();
await page.locator('button:has-text("Maximising Natural Light")').click();
await page.locator('button:has-text("Indoor–Outdoor Flow")').click();
await page.locator('button:has-text("Open Plan Living")').click();
await page.locator('button:has-text("Entertaining Spaces")').click();

await page.locator('button:has-text("Next")').click();
await page.waitForTimeout(400);
const textareas = page.locator('textarea');
await textareas.nth(0).fill("Island bench essential, stone benchtops, butler's pantry, fully integrated appliances, north-facing aspect");
await textareas.nth(1).fill("Large WIR required, ensuite with double vanity and freestanding bath, north-facing");
await textareas.nth(2).fill("Open plan kitchen/dining/living, big windows for light, bi-fold doors to alfresco, high ceilings");

await page.locator('button:has-text("Next")').click();
await page.waitForTimeout(400);
await page.locator('textarea').fill("Solar panels required. Smart home automation. Double garage with EV charging. Polished concrete floors throughout ground level. Future pool area to be considered in structural design. Heritage overlay applies to front facade.");

// Generate
await page.locator('button:has-text("Generate Project Brief")').click();
await page.waitForTimeout(700);

// ── Loading state — screenshot-element of the right panel ──────────────────
await page.locator('.hidden.lg\\:flex').screenshot({ path: path.join(SHOTS_DIR, 'A-loading-panel.png') });
console.log('Shot A: Loading panel close-up');

// Wait for brief to finish
await page.waitForTimeout(2200);

// ── Full brief panel top ────────────────────────────────────────────────────
const panel = page.locator('.hidden.lg\\:flex');
await panel.screenshot({ path: path.join(SHOTS_DIR, 'B-brief-top.png') });
console.log('Shot B: Brief top (narrative + client + overview)');

// ── Scroll to Design Vision ─────────────────────────────────────────────────
const doc = page.locator('#brief-document').last();
await doc.evaluate(el => el.scrollTop = 420);
await page.waitForTimeout(150);
await panel.screenshot({ path: path.join(SHOTS_DIR, 'C-design-vision.png') });
console.log('Shot C: Design Vision (philosophy + lifestyle scope)');

// ── Room Specs ──────────────────────────────────────────────────────────────
await doc.evaluate(el => el.scrollTop = 850);
await page.waitForTimeout(150);
await panel.screenshot({ path: path.join(SHOTS_DIR, 'D-room-specs.png') });
console.log('Shot D: Room specifications (AI-expanded)');

// ── Additional Requirements ─────────────────────────────────────────────────
await doc.evaluate(el => el.scrollTop = 1200);
await page.waitForTimeout(150);
await panel.screenshot({ path: path.join(SHOTS_DIR, 'E-additional.png') });
console.log('Shot E: Additional requirements (AI-expanded)');

await browser.close();
console.log('\nDone.');
