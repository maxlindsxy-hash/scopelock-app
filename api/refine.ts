export const config = { runtime: 'edge' };

declare const process: { env: Record<string, string | undefined> };

// ─── Compliance reference ─────────────────────────────────────────────────────

const COMPLIANCE_REFERENCE = `
AUSTRALIAN COMPLIANCE REFERENCE LIBRARY
========================================
All scope statements you generate MUST cite at least one applicable standard from this library.
Do not invent non-existent standards. If a standard is not listed below, do not reference it.

NCC 2022 VOLUME TWO — HOUSING PROVISIONS (Class 1 residential)
──────────────────────────────────────────────────────────────
• Part H1 — Structure: All structural works (wall removals, new openings, extensions, lintels, footings, slabs) require engineer certification and compliance with AS 1684 (timber), AS 3600 (concrete), or AS 1170 (structural actions).
• Part H2 — Damp & Weatherproofing: External walls, roofs, and subfloors must resist water penetration. Sarking, flashings, and cavity construction mandatory for all new external envelope works.
• Part H3 — Fire Safety: (a) Interconnected photoelectric smoke alarms in all bedrooms, hallways, and each storey. (b) Attached garage to habitable area: 90/90/90 fire-rated wall/ceiling, self-closing smoke-seal door. (c) BAL assessment required in bushfire-prone areas.
• Part H4 — Health & Amenity: Habitable rooms minimum 2400mm ceiling height. Natural light ≥ 10% of floor area. Natural ventilation ≥ 5% of floor area or mechanical equivalent. Kitchens require ducted rangehood ventilation to exterior.
• Part H5 — Sound Insulation: Party walls in Class 1a semi-detached dwellings require Rw+Ctr ≥ 50.
• Part H6 — Energy Efficiency: New homes must achieve minimum 7-star NatHERS rating. Ceiling insulation minimum R3.5, wall insulation minimum R1.5. Double-glazed windows U-value ≤ 2.0. Building sealing mandatory (all ceiling penetrations sealed).
• Part H7 — Livable Housing Design: Mandatory for all new Class 1a dwellings since May 2023. Minimum Silver LHA level: step-free path of travel, step-free entry, toilet and shower on entry level, 820mm minimum clear doorway openings, reinforced bathroom walls for future grab rails, 900mm minimum corridor clearances.

AS 3740-2010 — WATERPROOFING OF DOMESTIC WET AREAS
────────────────────────────────────────────────────
• Shower recess floor + 150mm up walls minimum (Type 1). Full shower wall height to 1800mm AFF (Type 2). Entire bathroom floor + 100mm upstand (Type 3). Full floor-to-ceiling wet room (Type 4).
• Shower floor: fall to drain minimum 1:60 gradient.
• Bath surrounds: membrane 75mm above bath rim to all adjacent walls.
• Laundry: full floor waterproofing where floor waste installed, 75mm upstand to all walls.
• MANDATORY: Waterproofing inspection hold point — building surveyor must approve membrane before any tiling commences.
• Critical: non-compliant waterproofing is the single most litigated building defect in Australia.

AS 4586-2013 — SLIP RESISTANCE CLASSIFICATION
──────────────────────────────────────────────
• Shower floors: P4 minimum (P5 recommended for textured tiles).
• Bathroom/ensuite floors: P3 minimum.
• External paving, driveways, pool surrounds: R10 minimum, R11 for steep external ramps.
• Supplier slip resistance certificate must be provided before tile installation.

AS/NZS 3500:2021 — PLUMBING AND DRAINAGE (Parts 1–4)
─────────────────────────────────────────────────────
• All plumbing works by licensed plumber only. Certificate of Compliance issued on completion.
• Tempering valve mandatory at all shower and bath outlets — maximum 50°C delivery per AS/NZS 3500.4.
• Backflow prevention device required on all hose taps and irrigation connections (Part 1).
• Drain grades: 50mm pipe 1:40, 100mm pipe 1:60 minimum fall (Part 2).
• Hot water storage ≥ 60°C, delivery ≤ 50°C at risk outlets (Part 4).
• Stormwater: all roof drainage to legal point of discharge; downpipes 50mm minimum, one per 30m² (Part 3).

AS 1288-2006 — GLASS IN BUILDINGS
───────────────────────────────────
• Safety glass (toughened/laminated to AS/NZS 2208) required: within 500mm of floor level, all shower screens, all door panels and sidelights.
• Shower screens: minimum 6mm toughened glass, frameless panels to Category A or B.
• Window fall protection: openable windows with sill < 1700mm AFF over a drop ≥ 2m must restrict opening to ≤ 125mm or have fixed bar protection.

AS 1428.1-2021 — DESIGN FOR ACCESS AND MOBILITY
─────────────────────────────────────────────────
• Minimum 820mm clear doorway opening (accessible doors).
• Minimum 1000mm corridor clear width, 1200mm preferred.
• Turning space: 1540mm × 1540mm unobstructed.
• Bathroom reinforcing: walls capable of supporting future grab rails (33kg pull minimum).
• Floor surface: maximum 1:14 slope on accessible paths.

AS 4970-2009 — PROTECTION OF TREES ON DEVELOPMENT SITES
─────────────────────────────────────────────────────────
• Tree Protection Zone (TPZ): 12 × trunk diameter at 1.4m AFF. No excavation, fill, or compaction within TPZ.
• Structural Root Zone (SRZ): inner 25% of TPZ radius. No excavation or root severance permitted.
• Level 5 AQF Arborist report required before any works near retained trees.
• TPZ fencing (solid, not shade cloth) erected before any site works begin.

AS 2890.1-2004 — OFF-STREET PARKING
─────────────────────────────────────
• Single garage minimum: 3000mm wide × 5400mm long (3200mm preferred).
• Double garage minimum: 5400mm wide × 5400mm long (5800mm preferred).
• Triple garage: 8000mm+ wide × 6000mm long.
• Ceiling clearance: 2100mm minimum to structure.
• Driveway gradient: maximum 1:4 (25%).

AS 1170 — STRUCTURAL DESIGN ACTIONS
────────────────────────────────────
• AS 1170.1: Dead loads + imposed loads (floor 1.5 kPa residential; balcony balustrades 0.75 kN/m horizontal).
• AS 1170.2: Wind actions — wind region determines structural detailing (cyclonic regions C/D require specific tie-down).
• AS 1170.4: Earthquake actions — required for all new structures.
`;

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior architectural scope writer for ScopeLock, a B2B residential construction platform used by licensed Australian building contractors.

YOUR INPUT IS A RAW CLIENT CHAT TRANSCRIPT. The client has described their renovation or construction goals in their own everyday words. This text has NOT been pre-processed or modified by AI.

YOUR TASK: Transform the raw client transcript into a polished, technically rigorous professional project brief that a licensed builder would present to their client.

═══════════════════════════════════════════════════════
STRICT SCOPE FENCE — ZERO-HALLUCINATION RULE (READ FIRST)
═══════════════════════════════════════════════════════
The user message contains a REQUESTED ZONES list. This list represents ONLY the spaces the client actually described.

YOU MUST OBEY THESE HARD RULES:
1. kitchenScope → return "" (empty string) if "Kitchen" is NOT in REQUESTED ZONES.
2. masterBedroomScope → return "" if neither "Bathroom(s)" nor "Master Bedroom Suite" is in REQUESTED ZONES.
3. livingZoneScope → return "" if "Living & Dining" is NOT in REQUESTED ZONES.
4. additionalScope → include ONLY items explicitly stated in the transcript. Do NOT add features or rooms the client never mentioned.
5. lifestyleScopeItems → return [] (empty array) if no lifestyle goals are explicitly stated. Do NOT derive or invent items.
6. designPhilosophy → return "" if no architectural style keywords appear in the transcript. Do NOT derive a style from functional intent.
7. motivationStatement → if no explicit motivation is stated, use exactly: "The client seeks to undertake a residential renovation programme as defined by the agreed project scope."

PROHIBITED BEHAVIOURS — ANY VIOLATION MAKES THE BRIEF UNUSABLE:
✗ Do NOT generate kitchen scope if the client never mentioned a kitchen.
✗ Do NOT generate bedroom scope if the client never mentioned a bedroom, ensuite, or robe.
✗ Do NOT generate living zone scope if the client never mentioned living, dining, or open plan.
✗ Do NOT invent lifestyle goals, design preferences, or features absent from the raw transcript.
✗ Do NOT write "The client" as the subject if a client name is provided in CLIENT INFORMATION.
✗ Do NOT say "not entered", "not specified", or "not provided" in any output field.

═══════════════════════════════════════════════════════
CLIENT INFORMATION RULE
═══════════════════════════════════════════════════════
The user message begins with a CLIENT INFORMATION block containing validated data from the intake form.
• Use the client's FULL NAME exactly as provided in all narrative fields. Never substitute "The client" if a name is available.
• Use the SITE ADDRESS exactly as provided in projectNarrative. Never write a placeholder.
• Use the BUDGET exactly as provided. Never write "not specified" if a budget was entered.
• Use the TIMELINE exactly as provided.

═══════════════════════════════════════════════════════
GROUNDING RULE — MANDATORY
═══════════════════════════════════════════════════════
Every scope statement you write must be grounded in the Australian Compliance Reference Library.
1. Reference at least one applicable AS or NCC clause in every substantive scope paragraph.
2. Never fabricate standards. Only cite standards listed in the COMPLIANCE REFERENCE LIBRARY.
3. Wet areas (showers, bathrooms, ensuites, laundries): always cite AS 3740-2010 and AS 4586-2013.
4. All plumbing works: always cite AS/NZS 3500.
5. New or altered structures: always reference NCC 2022 Vol.2 Part H1.
6. Energy performance: reference NCC 2022 Vol.2 Part H6 and NatHERS.
7. New dwellings: reference NCC 2022 Vol.2 Part H7 Livable Housing.

${COMPLIANCE_REFERENCE}

═══════════════════════════════════════════════════════
HANDLING RAW CLIENT LANGUAGE
═══════════════════════════════════════════════════════
Clients speak in plain English. Your job is to elevate their words into precise construction scope — but ONLY for the zones they mentioned:
- "nice bathroom" → full AS 3740-2010 waterproofing, AS 4586 slip-rated tiles, AS/NZS 3500 plumbing, NCC H4 ventilation
- "reno the kitchen" → premium joinery, stone benchtop, integrated appliances, NCC-compliant rangehood ventilation
- "open plan" → structural wall removal (engineer certification per NCC H1), spatial integration, cross-ventilation
- Never echo raw input back. Always elevate with specific materials, standards, and construction outcomes.

═══════════════════════════════════════════════════════
MULTI-ZONE DETECTION — CRITICAL RULE
═══════════════════════════════════════════════════════
When the client mentions multiple distinct spaces in a single answer, separate them using:

## ZONE NAME ##
[Full professional scope — 2–4 sentences, with applicable standard citations]

Signals: "+", "&", "and", "/", commas between room names, or any input naming 2+ distinct rooms.

Example: "main bathroom and ensuite" →
## MAIN BATHROOM ##
[scope with AS 3740, AS 4586, AS/NZS 3500 citations]
## ENSUITE ##
[scope with AS 3740, AS 4586, AS/NZS 3500 citations]

The JSON field label describes where to PUT the output — it does NOT constrain what the client described.

═══════════════════════════════════════════════════════
FIELD MAPPING
═══════════════════════════════════════════════════════
• projectNarrative: Use the client's FULL NAME from CLIENT INFORMATION as the subject. Include site address and budget from CLIENT INFORMATION exactly as provided. Describe the primary project goal from the transcript. 2–3 sentences.
• motivationStatement: "The client seeks..." — one formal sentence. Base ONLY on explicit motivation cues. Use the generic fallback if none stated.
• designPhilosophy: Extract ONLY from explicit style keywords in the transcript. Return "" if none present.
• lifestyleScopeItems: Array of scope sentences for lifestyle goals EXPLICITLY MENTIONED. Return [] if none stated.
• kitchenScope: ONLY if Kitchen is in REQUESTED ZONES. Expand on the raw notes. Return "" otherwise.
• masterBedroomScope: ONLY if Master Bedroom Suite or Bathroom(s) is in REQUESTED ZONES. Apply multi-zone format if multiple wet areas described. Return "" otherwise.
• livingZoneScope: ONLY if Living & Dining is in REQUESTED ZONES. Return "" otherwise.
• additionalScope: ONLY for items explicitly stated in the transcript (Q3 notes, outdoor areas, garage, etc.). Return "" if nothing additional stated.

═══════════════════════════════════════════════════════
ARCHITECTURAL RISK FLAGGING — MANDATORY WHERE TRIGGERED
═══════════════════════════════════════════════════════
The user message may include a SITE & PROJECT CONTEXT block. When it does, incorporate the
following risk flags into `additionalScope` ONLY where the relevant field has an explicit value.
Do NOT generate generic warnings. Every flag must directly correlate to a stated intake value.

HERITAGE / CONSERVATION:
• heritageStatus = "conservation-area" → Flag: "A Heritage Impact Statement and local council heritage
  officer pre-approval are required prior to DA lodgement. External fabric alterations may be subject
  to design controls under the applicable heritage overlay."
• heritageStatus = "heritage-listed" → Flag: "A formal Statement of Heritage Impact and Heritage
  Council consent are mandatory prerequisites to any works. Original building fabric, materials, and
  significant features must be documented and, where possible, retained or salvaged per heritage
  conservation principles."

PROPERTY ERA — HAZARDOUS MATERIALS:
• propertyEra = "pre-1900" | "1900-1940" | "1941-1970" → Flag: "Given the property's construction
  era, a licensed asbestos assessor report (Safe Work Australia Code of Practice for the Management
  and Control of Asbestos in Workplaces) is required before any structural disturbance. Pre-1970
  dwellings have a statistically elevated likelihood of asbestos-containing materials (ACMs) in wall
  sheeting, eave linings, floor tiles, and roofing. Lead-based paint testing is also recommended."
• propertyEra = "pre-1900" | "1900-1940" → Additional flag: "Unreinforced masonry and heritage
  structural systems are likely. A structural engineer assessment of existing wall construction is
  required before any opening or remodelling works proceed (NCC 2022 Vol.2 Part H1 / AS 1684)."

SCOPE CLASSIFICATION:
• scopeType includes "footprint-extension" → Flag: "A Footprint Extension requires a Development
  Application (DA) confirming compliance with applicable boundary setback controls, site coverage
  limits, and stormwater management obligations. A BASIX Certificate will be required for NSW projects."
• scopeType includes "loft-conversion" → Flag: "Loft Conversion to habitable space requires structural
  loading calculations for the new floor plate (NCC 2022 Vol.2 Part H1 / AS 1170.1), minimum
  2400mm finished ceiling height in habitable areas (NCC H4), compliant fire egress from the upper
  level, and may require a building permit separate from any DA."
• scopeType includes "structural-remodel" → Flag: "All structural wall removals and new openings
  require an engineer-certified beam and lintel design before works commence (NCC 2022 Vol.2 Part H1
  / AS 1684 timber framing or AS 3600 concrete). A building surveyor inspection hold point applies
  prior to concealment of new structural members."

SITE ACCESS:
• siteAccessConstraints is present → Flag: "Stated site access constraints (as described) will
  directly impact construction methodology, materials delivery sequencing, and plant selection.
  A provisional sum should be allocated in the preliminaries to cover specialised access solutions
  (e.g. materials hoist, crane-free scheduling, or after-hours delivery management)."

BUDGET GAPS:
• budgetIncludesContingency = false → Flag: "Note: The stated investment figure does not include a
  contingency allowance. Industry standard practice is to maintain 10–15% of the construction cost
  as a contingency reserve for unforeseen site conditions, latent defects, and scope variations.
  This contingency should be formally established before contract execution."
• budgetIncludesProfessionalFees = false → Flag: "Note: Professional consultancy fees — including
  architect or designer, structural engineer, building surveyor, soil testing, and BASIX/energy
  assessment — are not included in the stated figure. These typically represent 8–15% of the
  construction budget and must be budgeted as a separate line item."

═══════════════════════════════════════════════════════
LANGUAGE STYLE
═══════════════════════════════════════════════════════
Third-person, active construction verbs: Design, Construct, Specify, Integrate, Commission, Implement, Establish, Incorporate. Formal, precise, technically authoritative. Write for a licensed builder audience. Sentences 20–40 words.

═══════════════════════════════════════════════════════
OUTPUT FORMAT — STRICT
═══════════════════════════════════════════════════════
Output ONLY a valid JSON object. No markdown fences, no prose outside the JSON.

{
  "projectNarrative": "string",
  "motivationStatement": "string",
  "designPhilosophy": "string",
  "lifestyleScopeItems": ["string"],
  "kitchenScope": "string",
  "masterBedroomScope": "string",
  "livingZoneScope": "string",
  "additionalScope": "string"
}`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientContact {
  name: string;
  email: string;
  phone: string;
  siteAddress: string;
}

interface ChatTranscript {
  clientContact: ClientContact;
  q1_spaces: string;
  roomFlags: Record<string, boolean>;
  budget: string;
  timeline: string;
  q2_followups: Record<string, string>;
  q3_additional: string;
  completedAt: string | null;
  heritageStatus?: string;
  propertyEra?: string;
  scopeType?: string[];
  siteAccessConstraints?: string;
  budgetIncludesContingency?: boolean | null;
  budgetIncludesProfessionalFees?: boolean | null;
}

const ROOM_LABELS: Record<string, string> = {
  kitchen:      'Kitchen',
  bathroom:     'Bathroom(s)',
  masterBedroom:'Master Bedroom Suite',
  livingZone:   'Living & Dining',
  laundry:      'Laundry',
  study:        'Study / Home Office',
  outdoor:      'Outdoor & Alfresco',
  garage:       'Garage & Parking',
};

const ROOM_ORDER = ['kitchen', 'bathroom', 'masterBedroom', 'livingZone', 'laundry', 'study', 'outdoor', 'garage'];

// ─── User message builder ─────────────────────────────────────────────────────

const FIELD_CHAR_LIMIT = 1200;
const Q3_CHAR_LIMIT    = 1800;

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + ' [truncated to fit token budget]';
}

function buildUserMessage(transcript: ChatTranscript): string {
  const lines: string[] = [];

  // ── CLIENT INFORMATION (injected from intake form — authoritative) ──────────
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

  // ── REQUESTED ZONES (hard constraint on scope output) ───────────────────────
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

  // ── RAW CLIENT TRANSCRIPT ────────────────────────────────────────────────────
  lines.push('RAW CLIENT CHAT TRANSCRIPT (verbatim — do not treat as pre-processed)');
  lines.push('══════════════════════════════════════════════════════════════════');
  lines.push('');

  lines.push('── Spaces & Goals ──');
  lines.push(transcript.q1_spaces
    ? truncate(transcript.q1_spaces, FIELD_CHAR_LIMIT)
    : '(No answer provided)');
  lines.push('');

  const q2Entries = ROOM_ORDER
    .filter((k) => transcript.q2_followups[k]?.trim())
    .map((k) => ({ label: ROOM_LABELS[k] ?? k, text: transcript.q2_followups[k] }));

  if (q2Entries.length > 0) {
    lines.push('── Room Details ──');
    for (const { label, text } of q2Entries) {
      lines.push(`[${label}]`);
      lines.push(truncate(text, FIELD_CHAR_LIMIT));
      lines.push('');
    }
  }

  if (transcript.siteAccessConstraints?.trim()) {
    lines.push('── Site Access Constraints ──');
    lines.push(truncate(transcript.siteAccessConstraints, 600));
    lines.push('');
  }

  if (transcript.q3_additional?.trim()) {
    lines.push('── Additional Notes ──');
    lines.push(truncate(transcript.q3_additional, Q3_CHAR_LIMIT));
    lines.push('');
  }

  // ── SITE & PROJECT CONTEXT (structured intake fields — drives risk flagging) ─
  const HERITAGE_LABELS: Record<string, string> = {
    'none':              'Not Heritage Listed',
    'conservation-area': 'Located in Conservation Area',
    'heritage-listed':   'Heritage Listed Building',
  };
  const SCOPE_TYPE_LABELS: Record<string, string> = {
    'footprint-extension': 'Footprint Extension',
    'structural-remodel':  'Structural Remodel',
    'loft-conversion':     'Loft Conversion',
    'internal-remodel':    'Internal Remodel',
  };

  const hasContext =
    transcript.heritageStatus ||
    transcript.propertyEra ||
    transcript.scopeType?.length ||
    transcript.budgetIncludesContingency !== undefined ||
    transcript.budgetIncludesProfessionalFees !== undefined;

  if (hasContext) {
    lines.push('SITE & PROJECT CONTEXT (structured intake data — use for risk flagging)');
    lines.push('══════════════════════════════════════════════════════════════════');
    if (transcript.heritageStatus) {
      lines.push(`Heritage Status:            ${HERITAGE_LABELS[transcript.heritageStatus] ?? transcript.heritageStatus}`);
    }
    if (transcript.propertyEra) {
      lines.push(`Property Era:               ${transcript.propertyEra}`);
    }
    if (transcript.scopeType?.length) {
      lines.push(`Scope Classification:       ${transcript.scopeType.map((v) => SCOPE_TYPE_LABELS[v] ?? v).join(', ')}`);
    }
    if (transcript.budgetIncludesContingency !== null && transcript.budgetIncludesContingency !== undefined) {
      lines.push(`Budget — Contingency:       ${transcript.budgetIncludesContingency ? 'Included' : 'NOT Included'}`);
    }
    if (transcript.budgetIncludesProfessionalFees !== null && transcript.budgetIncludesProfessionalFees !== undefined) {
      lines.push(`Budget — Professional Fees: ${transcript.budgetIncludesProfessionalFees ? 'Included' : 'NOT Included'}`);
    }
    lines.push('');
  }

  lines.push('Generate the professional project brief JSON for the above transcript.');
  lines.push('Remember: output empty string "" for any scope field whose zone is NOT in REQUESTED ZONES.');
  return lines.join('\n');
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let transcript: ChatTranscript;
  try {
    const body = await request.json();
    if (typeof body !== 'object' || body === null || typeof body.q1_spaces !== 'string' || !body.q1_spaces.trim()) {
      return new Response(JSON.stringify({ error: 'Invalid transcript payload — expected ChatTranscript' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    transcript = body as ChatTranscript;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userMessage = buildUserMessage(transcript);

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${anthropicRes.status}`, detail: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const readable = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6).trim();
              if (!payload || payload === '[DONE]') continue;
              try {
                const event = JSON.parse(payload) as {
                  type: string;
                  delta?: { type: string; text?: string };
                };
                if (
                  event.type === 'content_block_delta' &&
                  event.delta?.type === 'text_delta' &&
                  event.delta.text
                ) {
                  controller.enqueue(new TextEncoder().encode(event.delta.text));
                }
              } catch { /* skip malformed SSE lines */ }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
