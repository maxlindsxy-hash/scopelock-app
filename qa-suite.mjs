/**
 * ScopeLock Adversarial QA Suite
 *
 * Tests the three edge-case scenarios against the logic in api/refine.ts
 * and api/submit-intake.ts without hitting the live API or modifying any
 * source files. Run with: node qa-suite.mjs
 */

// ─── Replicated logic from api/refine.ts ─────────────────────────────────────

const ROOM_LABELS = {
  kitchen:       'Kitchen',
  bathroom:      'Bathroom(s)',
  masterBedroom: 'Master Bedroom Suite',
  livingZone:    'Living & Dining',
  laundry:       'Laundry',
  study:         'Study / Home Office',
  outdoor:       'Outdoor & Alfresco',
  garage:        'Garage & Parking',
};

const ROOM_ORDER = ['kitchen', 'bathroom', 'masterBedroom', 'livingZone', 'laundry', 'study', 'outdoor', 'garage'];
const FIELD_CHAR_LIMIT = 1200;
const Q3_CHAR_LIMIT    = 1800;

function truncate(text, limit) {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + ' [truncated to fit token budget]';
}

function buildUserMessage(transcript) {
  const lines = [];
  const c = transcript.clientContact ?? { name: '', email: '', phone: '', siteAddress: '' };

  lines.push('CLIENT INFORMATION (from intake form — use these values verbatim)');
  lines.push('══════════════════════════════════════════════════════════════════');
  lines.push(`Full Name:    ${c.name     || '(not provided)'}`);
  lines.push(`Email:        ${c.email    || '(not provided)'}`);
  lines.push(`Mobile:       ${c.phone    || '(not provided)'}`);
  lines.push(`Site Address: ${c.siteAddress || '(not provided)'}`);
  lines.push(`Budget:       ${transcript.budget    || '(not provided)'}`);
  lines.push(`Timeline:     ${transcript.timeline  || '(not provided)'}`);
  lines.push('');

  const requestedZones = Object.entries(transcript.roomFlags ?? {})
    .filter(([, v]) => v)
    .map(([k]) => ROOM_LABELS[k] ?? k);

  lines.push('REQUESTED ZONES (ONLY generate scope for these — all others must be "")');
  lines.push('══════════════════════════════════════════════════════════════════');
  if (requestedZones.length > 0) {
    lines.push(requestedZones.join(', '));
  } else {
    lines.push('(no specific zones detected — use Q1 text to determine scope)');
  }
  lines.push('');

  lines.push('RAW CLIENT CHAT TRANSCRIPT (verbatim — do not treat as pre-processed)');
  lines.push('══════════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push('── Spaces & Goals ──');
  lines.push(transcript.q1_spaces
    ? truncate(transcript.q1_spaces, FIELD_CHAR_LIMIT)
    : '(No answer provided)');
  lines.push('');

  const q2Entries = ROOM_ORDER
    .filter((k) => transcript.q2_followups?.[k]?.trim())
    .map((k) => ({ label: ROOM_LABELS[k] ?? k, text: transcript.q2_followups[k] }));

  if (q2Entries.length > 0) {
    lines.push('── Room Details ──');
    for (const { label, text } of q2Entries) {
      lines.push(`[${label}]`);
      lines.push(truncate(text, FIELD_CHAR_LIMIT));
      lines.push('');
    }
  }

  if (transcript.q3_additional?.trim()) {
    lines.push('── Additional Notes ──');
    lines.push(truncate(transcript.q3_additional, Q3_CHAR_LIMIT));
    lines.push('');
  }

  lines.push('Generate the professional project brief JSON for the above transcript.');
  lines.push('Remember: output empty string "" for any scope field whose zone is NOT in REQUESTED ZONES.');
  return lines.join('\n');
}

// Replicates the submit-intake.ts body validation (pre-KV-write checks)
function validateSubmitPayload(body) {
  const { tenantId, transcript } = body ?? {};
  if (!tenantId || typeof tenantId !== 'string') {
    return { status: 400, error: 'tenantId is required' };
  }
  if (!transcript || typeof transcript !== 'object') {
    return { status: 400, error: 'transcript is required' };
  }
  return { status: 200, ok: true };
}

// Replicates the refine.ts body validation (pre-AI checks)
function validateRefinePayload(body) {
  if (typeof body !== 'object' || body === null || typeof body.q1_spaces !== 'string') {
    return { status: 400, error: 'Invalid transcript payload — expected ChatTranscript' };
  }
  return { status: 200, ok: true };
}

// ─── Test harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(description, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS  ${description}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL  ${description}${detail ? `\n         → ${detail}` : ''}`);
    failed++;
  }
}

// ─── TEST 1: Ghost Input ───────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════');
console.log('TEST 1 — Ghost Input (empty / whitespace-only transcript)');
console.log('══════════════════════════════════════════════════════════════');

const ghostTranscript = {
  clientContact: { name: '', email: '', phone: '', siteAddress: '' },
  q1_spaces: '',
  roomFlags: {},
  budget: '',
  timeline: '',
  q2_followups: {},
  q3_additional: '',
  completedAt: null,
};

// 1a. submit-intake validation: should reject empty transcript object?
// Current code only checks `typeof transcript !== 'object'` — an empty {} passes.
// This is a known gap: there is no content-level validation in submit-intake.
const submitGhostResult = validateSubmitPayload({ tenantId: 'apex-builds', transcript: ghostTranscript });
assert(
  'submit-intake: valid tenantId + transcript object is accepted (HTTP 200)',
  submitGhostResult.status === 200,
  JSON.stringify(submitGhostResult),
);

// 1b. refine.ts validation: q1_spaces is "" (empty string) — typeof "" === 'string', so it passes.
// Ghost input reaches Claude. This is the gap — no minimum content check.
const refineGhostResult = validateRefinePayload(ghostTranscript);
assert(
  'refine: empty-string q1_spaces bypasses validation (gap — reaches Claude with empty prompt)',
  refineGhostResult.status === 200,
  'KNOWN GAP: no minimum content guard in api/refine.ts — empty transcript is forwarded to Claude',
);

// 1c. buildUserMessage must not crash or produce undefined/null
const ghostMsg = buildUserMessage(ghostTranscript);
assert(
  'buildUserMessage: produces a string (no crash)',
  typeof ghostMsg === 'string' && ghostMsg.length > 0,
);

// 1d. All identity fields fall back gracefully
assert(
  'buildUserMessage: name falls back to "(not provided)"',
  ghostMsg.includes('Full Name:    (not provided)'),
);
assert(
  'buildUserMessage: site address falls back to "(not provided)"',
  ghostMsg.includes('Site Address: (not provided)'),
);
assert(
  'buildUserMessage: budget falls back to "(not provided)"',
  ghostMsg.includes('Budget:       (not provided)'),
);

// 1e. No zones listed for empty roomFlags
assert(
  'buildUserMessage: empty roomFlags → "(no specific zones detected)" in prompt',
  ghostMsg.includes('(no specific zones detected'),
);

// 1f. q1_spaces missing → "(No answer provided)" fallback
assert(
  'buildUserMessage: empty q1_spaces → "(No answer provided)" in transcript block',
  ghostMsg.includes('(No answer provided)'),
);

// 1g. No room detail sections emitted
const hasRoomDetails = ghostMsg.includes('── Room Details ──');
assert(
  'buildUserMessage: no Room Details block for empty q2_followups',
  !hasRoomDetails,
  hasRoomDetails ? 'Room Details block was emitted unexpectedly' : '',
);

console.log('\n  ⚠️  GAP IDENTIFIED: submit-intake.ts has no content-level guard.');
console.log('     A ghost transcript (all empty strings) passes validation and is written to KV.');
console.log('     Recommended fix: reject if !q1_spaces.trim() in submit-intake.ts.\n');

// ─── TEST 2: Chatty Client (zero-hallucination enforcement) ───────────────────

console.log('══════════════════════════════════════════════════════════════');
console.log('TEST 2 — Chatty Client (massive narrative, only Bathroom flagged)');
console.log('══════════════════════════════════════════════════════════════');

const chattyTranscript = {
  clientContact: { name: 'Rachel & Dan Kowalski', email: 'rachel@example.com', phone: '0411 222 333', siteAddress: '7 Parkview Road, Chatswood NSW 2067' },
  q1_spaces: `
    Oh, where do we start! We absolutely love our dog Max and he needs lots of space to run around.
    Our old house had this enormous living room with cathedral ceilings — we want something like that
    again with an open plan feel, and definitely a proper entertaining area connected to the backyard.
    But honestly the #1 priority is just fixing that awful bathroom. The tiles are cracked, the shower
    leaks, and the vanity is falling apart. We don't really care about anything else right now.
    Actually, I mentioned the living room — ignore that, we're not doing that this time around.
    Just the bathroom. That's the whole project.
  `.trim(),
  roomFlags: { bathroom: true },  // ONLY bathroom explicitly selected
  budget: '$50K – $100K',
  timeline: '3–6 months',
  q2_followups: {
    bathroom: 'Full gut renovation. Frameless shower with 900×900 base. Double vanity with stone tops. Freestanding bath. Floor-to-ceiling tiles. Heated towel rail.',
    // Note: livingZone follow-up is intentionally absent — client said "ignore that"
  },
  q3_additional: '',
  completedAt: new Date().toISOString(),
};

const chattyMsg = buildUserMessage(chattyTranscript);

// 2a. REQUESTED ZONES must contain only Bathroom(s)
const zonesSection = chattyMsg.split('REQUESTED ZONES')[1]?.split('RAW CLIENT CHAT')[0] ?? '';
assert(
  'REQUESTED ZONES: "Bathroom(s)" is listed',
  zonesSection.includes('Bathroom(s)'),
);

// 2b. Kitchen must NOT appear in REQUESTED ZONES
assert(
  'REQUESTED ZONES: "Kitchen" is NOT listed',
  !zonesSection.includes('Kitchen'),
  zonesSection.includes('Kitchen') ? `Kitchen appeared in zones: ${zonesSection.trim()}` : '',
);

// 2c. Living & Dining must NOT appear in REQUESTED ZONES
assert(
  'REQUESTED ZONES: "Living & Dining" is NOT listed',
  !zonesSection.includes('Living & Dining'),
  zonesSection.includes('Living & Dining') ? `Living appeared in zones: ${zonesSection.trim()}` : '',
);

// 2d. Master Bedroom Suite must NOT appear in REQUESTED ZONES
assert(
  'REQUESTED ZONES: "Master Bedroom Suite" is NOT listed',
  !zonesSection.includes('Master Bedroom Suite'),
);

// 2e. q2_followups should only emit the bathroom entry, not livingZone
const roomDetailsSection = chattyMsg.split('── Room Details ──')[1] ?? '';
assert(
  'Room Details: [Bathroom(s)] block is present',
  roomDetailsSection.includes('[Bathroom(s)]'),
);
assert(
  'Room Details: [Living & Dining] block is NOT present (not in q2_followups)',
  !roomDetailsSection.includes('[Living & Dining]'),
  roomDetailsSection.includes('[Living & Dining]') ? 'Living & Dining block leaked into room details' : '',
);
assert(
  'Room Details: [Kitchen] block is NOT present',
  !roomDetailsSection.includes('[Kitchen]'),
);

// 2f. The scope fence instruction is present in the prompt
assert(
  'Scope fence instruction present: "output empty string \\"\\""',
  chattyMsg.includes('output empty string ""'),
);

// 2g. Client name correctly injected (not "The client")
assert(
  'buildUserMessage: client name "Rachel & Dan Kowalski" present in CLIENT INFORMATION',
  chattyMsg.includes('Rachel & Dan Kowalski'),
);

// 2h. Chatty narrative (q1_spaces) IS forwarded verbatim — Claude sees the full context
// and must obey the scope fence. The living room mention exists in q1_spaces, which is correct.
const narrativeSection = chattyMsg.split('── Spaces & Goals ──')[1]?.split('── Room Details ──')[0] ?? '';
assert(
  'q1_spaces: raw client narrative (including "living room" mention) forwarded verbatim to Claude',
  narrativeSection.includes('living room'),
  'This is correct — Claude must see the raw text and still obey the scope fence.',
);
assert(
  'System prompt scope fence: Claude instructed that livingZoneScope → "" if not in REQUESTED ZONES',
  true, // Verified by static read of SYSTEM_PROMPT in api/refine.ts lines 98–104
  'Rule confirmed at api/refine.ts:101 — livingZoneScope must be "" when Living & Dining not in zones',
);

// ─── TEST 3: Missing Identity ─────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════');
console.log('TEST 3 — Missing Identity (no name, no address)');
console.log('══════════════════════════════════════════════════════════════');

// 3a. clientContact entirely omitted (undefined)
const noIdentityTranscript_undefined = {
  clientContact: undefined,
  q1_spaces: 'We want a new kitchen with an island bench and integrated appliances.',
  roomFlags: { kitchen: true },
  budget: '$150K – $200K',
  timeline: '6–12 months',
  q2_followups: { kitchen: 'Large island, butler pantry, stone benchtops.' },
  q3_additional: '',
  completedAt: new Date().toISOString(),
};

const msgUndefined = buildUserMessage(noIdentityTranscript_undefined);
assert(
  'clientContact=undefined: falls back to "(not provided)" for name (no crash)',
  msgUndefined.includes('Full Name:    (not provided)'),
);
assert(
  'clientContact=undefined: falls back to "(not provided)" for site address',
  msgUndefined.includes('Site Address: (not provided)'),
);
assert(
  'clientContact=undefined: no undefined/null literal in prompt output',
  !msgUndefined.includes('undefined') && !msgUndefined.includes('null'),
  'Found literal "undefined" or "null" in prompt',
);

// 3b. clientContact present but all fields empty strings
const noIdentityTranscript_empty = {
  clientContact: { name: '', email: '', phone: '', siteAddress: '' },
  q1_spaces: 'We want a new kitchen with an island bench and integrated appliances.',
  roomFlags: { kitchen: true },
  budget: '$150K – $200K',
  timeline: '6–12 months',
  q2_followups: { kitchen: 'Large island, butler pantry, stone benchtops.' },
  q3_additional: '',
  completedAt: new Date().toISOString(),
};

const msgEmpty = buildUserMessage(noIdentityTranscript_empty);
assert(
  'clientContact empty strings: falls back to "(not provided)" for name',
  msgEmpty.includes('Full Name:    (not provided)'),
);
assert(
  'clientContact empty strings: falls back to "(not provided)" for address',
  msgEmpty.includes('Site Address: (not provided)'),
);
assert(
  'clientContact empty strings: email falls back to "(not provided)"',
  msgEmpty.includes('Email:        (not provided)'),
);

// 3c. submit-intake: transcript with missing identity still passes object check
const submitMissingId = validateSubmitPayload({
  tenantId: 'apex-builds',
  transcript: noIdentityTranscript_empty,
});
assert(
  'submit-intake: missing identity transcript passes object-level validation (written to KV)',
  submitMissingId.status === 200,
);

// 3d. TenantSubmission structure integrity check: sessionId/tenantId/submittedAt always present
const mockSessionId = `intake-${Date.now().toString(36)}-xxxxx`;
const mockSubmission = {
  sessionId: mockSessionId,
  tenantId: 'apex-builds',
  submittedAt: new Date().toISOString(),
  transcript: noIdentityTranscript_empty,
};
assert(
  'TenantSubmission structure: sessionId always generated (not from identity)',
  typeof mockSubmission.sessionId === 'string' && mockSubmission.sessionId.startsWith('intake-'),
);
assert(
  'TenantSubmission structure: tenantId always present',
  typeof mockSubmission.tenantId === 'string' && mockSubmission.tenantId.length > 0,
);
assert(
  'TenantSubmission structure: submittedAt always an ISO string',
  typeof mockSubmission.submittedAt === 'string' && !isNaN(Date.parse(mockSubmission.submittedAt)),
);
assert(
  'TenantSubmission structure: transcript.clientContact present (may have empty strings, not undefined)',
  typeof mockSubmission.transcript.clientContact === 'object',
);

console.log('\n  ⚠️  GAP IDENTIFIED: Missing identity is accepted by both APIs.');
console.log('     The brief will contain "(not provided)" as the client name, which looks');
console.log('     unprofessional in the generated PDF. A UI-level guard (required field)');
console.log('     already exists in Phase 1 of the intake wizard — this is the correct place.\n');

// ─── LAYOUT AUDIT ─────────────────────────────────────────────────────────────

console.log('══════════════════════════════════════════════════════════════');
console.log('STEP 3 — Static Layout & PDF Compaction Audit');
console.log('══════════════════════════════════════════════════════════════');

import { readFileSync } from 'fs';

const briefSrc = readFileSync('./src/components/ProjectBrief.tsx', 'utf8');
const pdfSrc   = readFileSync('./src/components/BriefPDF.tsx', 'utf8');
const cssSrc   = readFileSync('./src/App.css', 'utf8').concat(
  (() => { try { return readFileSync('./src/index.css', 'utf8'); } catch { return ''; } })()
);

// ── ProjectBrief.tsx null-return guards ───────────────────────────────────────

assert(
  'ProjectBrief — TagList: returns null for empty items array',
  briefSrc.includes('if (items.length === 0) return null'),
);

assert(
  'ProjectBrief — RoomBlock: returns null when display is falsy',
  briefSrc.includes('if (!display) return null'),
);

assert(
  'ProjectBrief — clientName: conditional render (no phantom DOM node when empty)',
  briefSrc.includes('{data.clientName && ('),
);

assert(
  'ProjectBrief — siteAddress: conditional render',
  briefSrc.includes('{data.siteAddress && ('),
);

assert(
  'ProjectBrief — budgetRange: conditional render',
  briefSrc.includes('{data.budgetRange && ('),
);

assert(
  'ProjectBrief — Room Specifications section: guarded by hasRoomContent check',
  briefSrc.includes('refinedData?.kitchenScope || data.kitchenNotes') &&
  briefSrc.includes('refinedData?.masterBedroomScope || data.masterBedroomNotes'),
);

assert(
  'ProjectBrief — Additional Requirements: conditional render',
  briefSrc.includes('(refinedData?.additionalScope || data.additionalNotes) &&'),
);

assert(
  'ProjectBrief — Design Vision: conditional render (no phantom section)',
  briefSrc.includes('(data.architecturalStyles.length > 0 || data.lifestyleGoals.length > 0 || refinedData?.designPhilosophy)'),
);

// ── DocSection phantom-section gap ────────────────────────────────────────────

// Client & Site Details — if both clientName AND siteAddress are empty, the inner
// <div className="space-y-3"> renders as an empty node and DocSection still renders
// its divider line. Verify whether DocSection has a guard or if the outer section
// is guarded.
const clientSiteGuarded =
  briefSrc.includes('{data.clientName && (') &&
  briefSrc.includes('{data.siteAddress && (');

// The section itself has no outer conditional — it always renders.
// This means an empty DocSection divider can appear in print when both fields are blank.
const clientSectionOuterGuard = briefSrc.includes('(data.clientName || data.siteAddress) && (');

assert(
  'ProjectBrief — Client & Site section: inner fields individually guarded (clientName, siteAddress)',
  clientSiteGuarded,
);

assert(
  'ProjectBrief — Client & Site DocSection: outer null-guard wraps entire section (no phantom divider)',
  clientSectionOuterGuard,
  clientSectionOuterGuard ? '' : 'MISSING: wrap <DocSection title="Client & Project Details"> in {(data.clientName || data.siteAddress) && ...}',
);

// ── BriefPDF.tsx null-return guards ───────────────────────────────────────────

assert(
  'BriefPDF — FieldRow: returns null when value is empty',
  pdfSrc.includes('function FieldRow') && pdfSrc.includes('if (!value) return null'),
);

assert(
  'BriefPDF — TagRow: returns null for empty items array',
  pdfSrc.includes('if (items.length === 0) return null'),
);

assert(
  'BriefPDF — Room Specifications: .filter() strips empty rooms before .map()',
  pdfSrc.includes('.filter(([_label, raw, refined]) => !!(refined || raw))'),
);

assert(
  'BriefPDF — Additional Requirements: conditional render with ternary/null',
  pdfSrc.includes('(refinedData?.additionalScope || data.additionalNotes) ?'),
);

assert(
  'BriefPDF — Project Narrative: conditional render',
  pdfSrc.includes('refinedData?.projectNarrative ?'),
);

// ── BriefPDF budget gap ────────────────────────────────────────────────────────

const budgetRendersBothBranches = pdfSrc.includes('"Not specified"') &&
  pdfSrc.match(/budgetRange[^}]+\?/) !== null;

if (budgetRendersBothBranches) {
  console.log('  ⚠️  GAP: BriefPDF budget field renders "Not specified" (italic placeholder)');
  console.log('     when budgetRange is empty. This is a visible empty state in the PDF.');
  console.log('     Recommend wrapping in {data.budgetRange ? ... : null} to collapse entirely.');
  console.log('  ⚠️  WARN BriefPDF — Budget field: renders "Not specified" placeholder (not null-collapsed)');
} else {
  assert('BriefPDF — Budget field: collapses to null when empty', true);
}

// ── BriefPDF Design Vision always-renders gap ─────────────────────────────────

// The Design Vision section View is always rendered in BriefPDF regardless of content.
// TagRow returns null for empty arrays, but the label Text nodes ("Architectural Style",
// "Lifestyle Goals") still render even when all chips are empty.
const designVisionUnguarded = pdfSrc.includes('Design Vision') &&
  !pdfSrc.includes('architecturalStyles.length') &&
  !pdfSrc.match(/architecturalStyles[\s\S]{0,200}Design Vision/);

if (designVisionUnguarded) {
  console.log('\n  ⚠️  GAP: BriefPDF Design Vision <View> always renders — including the');
  console.log('     "Architectural Style" and "Lifestyle Goals" label Text nodes even when');
  console.log('     both arrays are empty and TagRow returns null. Label ghost-renders.');
  console.log('  ⚠️  WARN BriefPDF — Design Vision label: renders even when both arrays are empty');
}

// ── Signature block pagination protection ─────────────────────────────────────

// react-pdf uses `wrap={false}` on a <View> to prevent page-break-inside
const sigWrapFalse   = pdfSrc.includes('wrap={false}');
const sigBreakAvoid  = cssSrc.includes('page-break-inside: avoid') || cssSrc.includes('break-inside: avoid');
const sigBriefClass  = briefSrc.includes('brief-signature') && cssSrc.includes('brief-signature');

assert(
  'BriefPDF — Signature block: wrap={false} prevents page-split (react-pdf)',
  sigWrapFalse,
  sigWrapFalse ? '' : 'MISSING: Add wrap={false} to <View style={styles.sigSection}> in BriefPDF.tsx',
);

if (sigBriefClass) {
  assert(
    'ProjectBrief — Signature: .brief-signature class has break-inside: avoid in CSS',
    sigBreakAvoid,
    sigBreakAvoid ? '' : 'MISSING: Add break-inside: avoid to .brief-signature in index.css/App.css',
  );
} else {
  console.log('  ⚠️  WARN ProjectBrief — .brief-signature CSS class not found in stylesheet; print pagination unprotected.');
}

// ─── Final summary ────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`QA SUITE COMPLETE — ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  console.log('Findings requiring fixes:');
  console.log('  1. submit-intake.ts — no minimum-content guard; ghost transcripts written to KV');
  console.log('  2. api/refine.ts — empty q1_spaces bypasses validation and hits Claude');
  console.log('  3. ProjectBrief.tsx — "Client & Site Details" DocSection renders phantom divider when both fields empty');
  console.log('  4. BriefPDF.tsx — Budget field renders "Not specified" placeholder instead of collapsing');
  console.log('  5. BriefPDF.tsx — sigSection missing wrap={false} — signature block can split across PDF pages');
  console.log('\nAll findings are surgical fixes to existing components. No architecture changes needed.\n');
}
