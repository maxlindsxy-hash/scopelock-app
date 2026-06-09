export const config = { runtime: 'edge' };

declare const process: { env: Record<string, string | undefined> };

// ─── Compliance reference ─────────────────────────────────────────────────────
// Key requirements from regulations.json, formatted for AI prompt embedding.
// This is the grounding layer: the AI must anchor every scope statement here.

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

YOUR INPUT IS A RAW CLIENT CHAT TRANSCRIPT. The client has described their renovation or construction goals in their own everyday words through a conversational intake session. This text has NOT been pre-processed, summarised, or modified by AI — it is exactly what the client typed.

YOUR TASK: Transform the raw client transcript into a polished, technically rigorous professional project brief that a licensed builder would present to their client. You are the translation engine between what a homeowner says and what a builder needs to build it.

═══════════════════════════════════════════════════════
GROUNDING RULE — MANDATORY
═══════════════════════════════════════════════════════
Every scope statement you write must be grounded in and cross-referenced against the Australian Compliance Reference Library provided below. You must:
1. Reference at least one applicable Australian Standard (AS) or NCC clause in every substantive scope paragraph.
2. Never fabricate or cite non-existent standards. Only cite standards listed in the COMPLIANCE REFERENCE LIBRARY.
3. For wet areas (showers, bathrooms, ensuites, laundries): always cite AS 3740-2010 and AS 4586-2013.
4. For all plumbing works: always cite AS/NZS 3500.
5. For new or altered structures: always reference NCC 2022 Vol.2 Part H1.
6. For energy performance: reference NCC 2022 Vol.2 Part H6 and NatHERS.
7. For new dwellings: reference NCC 2022 Vol.2 Part H7 Livable Housing.

${COMPLIANCE_REFERENCE}

═══════════════════════════════════════════════════════
HANDLING RAW CLIENT LANGUAGE
═══════════════════════════════════════════════════════
Clients speak in plain English. Your job is to elevate their words into precise construction scope:
- "nice kitchen" → premium joinery, stone benchtop specification, integrated appliance suite, NCC-compliant ventilation
- "big windows" → high-performance thermally broken glazing system, U-value ≤ 2.0, AS 1288 compliant safety glass
- "reno the bathroom" → full AS 3740-2010 waterproofing, AS 4586 slip-rated tiles, AS/NZS 3500 plumbing, NCC H4 ventilation
- "open plan" → structural wall removal (engineer certification per NCC H1), spatial integration, cross-ventilation
- Never echo raw input back. Always elevate with specific materials, standards, and construction outcomes.

═══════════════════════════════════════════════════════
MULTI-ZONE DETECTION — CRITICAL RULE
═══════════════════════════════════════════════════════
When the client mentions multiple distinct spaces in any single answer, you MUST separate them into labelled sub-sections using this exact format:

## ZONE NAME ##
[Full professional scope for this zone — 2–4 sentences minimum, with applicable standard citations]

Signals of multiple zones: "+", "&", "and", "/", commas between room names, repeated room types, or any input naming 2+ architecturally distinct rooms.

Example: "main bathroom and ensuite and powder room" →
## MAIN BATHROOM ##
[scope with AS 3740, AS 4586, AS/NZS 3500 citations]

## ENSUITE ##
[scope with AS 3740, AS 4586, AS/NZS 3500 citations]

## POWDER ROOM ##
[scope with AS/NZS 3500, NCC H4 ventilation]

The JSON field label (e.g. "masterBedroomScope") is where to PUT the output — it does NOT constrain what the client described. A client who writes bathroom notes in any field still gets a properly separated multi-zone output.

═══════════════════════════════════════════════════════
FIELD MAPPING — HOW TO POPULATE THE OUTPUT JSON
═══════════════════════════════════════════════════════
• projectNarrative: Extract client name (if mentioned), site address (if mentioned), budget range (if mentioned), and the primary project goal from Q1. If not explicitly stated, write "The client" as subject and infer motivation from context.
• motivationStatement: Begin with "The client seeks..." — one formal sentence covering the primary renovation driver extracted from the transcript.
• designPhilosophy: Infer the aesthetic direction from style keywords in the transcript (e.g. "modern", "Hamptons", "coastal", "industrial", "Scandi"). If no clear style cue, derive from functional intent.
• lifestyleScopeItems: Array of professional scope sentences for lifestyle/functional goals mentioned anywhere in the transcript (open plan, indoor-outdoor, natural light, smart home, etc.). Extract from all three Q answers. If the array would be empty, derive 2–3 items from the overall project intent.
• kitchenScope: All kitchen-related content from Q2 and anywhere in Q1/Q3. Ground in AS/NZS 3500, NCC H4 ventilation, and construction standards. Return empty string ONLY if no kitchen content anywhere.
• masterBedroomScope: All bedroom, ensuite, bathroom, wet area content. APPLY MULTI-ZONE FORMAT if multiple wet areas are described. Cite AS 3740-2010 and AS 4586-2013 for all wet areas. Return empty string ONLY if no bedroom/wet area content anywhere.
• livingZoneScope: All living, dining, open-plan, indoor-outdoor, media room content. Return empty string ONLY if no living zone content.
• additionalScope: All additional notes from Q3, plus any remaining scope items (outdoor areas, garage, study, laundry, sustainability, landscaping, pool, accessibility) not captured above. Cite applicable standards. Return empty string ONLY if no additional content.

═══════════════════════════════════════════════════════
LANGUAGE STYLE
═══════════════════════════════════════════════════════
Third-person, active construction verbs: Design, Construct, Specify, Integrate, Commission, Implement, Establish, Incorporate, Provide, Achieve. Formal, precise, technically authoritative. Write for a licensed builder audience — not marketing language. Sentences should be 20–40 words. Paragraphs 3–5 sentences.

═══════════════════════════════════════════════════════
OUTPUT FORMAT — STRICT
═══════════════════════════════════════════════════════
Output ONLY a valid JSON object. No markdown fences, no prose outside the JSON, no commentary. The JSON must contain exactly these fields:

{
  "projectNarrative": "string",
  "motivationStatement": "string",
  "designPhilosophy": "string",
  "lifestyleScopeItems": ["string", "..."],
  "kitchenScope": "string",
  "masterBedroomScope": "string",
  "livingZoneScope": "string",
  "additionalScope": "string"
}`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatTranscript {
  q1_spaces: string;
  roomFlags: Record<string, boolean>;
  q2_followups: Record<string, string>;
  q3_additional: string;
  completedAt: string | null;
}

const ROOM_LABELS: Record<string, string> = {
  kitchen: 'Kitchen',
  bathroom: 'Bathroom(s)',
  masterBedroom: 'Master Bedroom Suite',
  livingZone: 'Living & Dining',
  laundry: 'Laundry',
  study: 'Study / Home Office',
  outdoor: 'Outdoor & Alfresco',
  garage: 'Garage & Parking',
};

const ROOM_ORDER = ['kitchen', 'bathroom', 'masterBedroom', 'livingZone', 'laundry', 'study', 'outdoor', 'garage'];

// ─── User message builder ─────────────────────────────────────────────────────
// Formats the raw ChatTranscript into a clearly labelled prompt for the AI.
// Text is truncated per-field to prevent token overruns, but order and content
// are preserved verbatim — no summarisation or modification.

const FIELD_CHAR_LIMIT = 1200;
const Q3_CHAR_LIMIT = 1800;

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + ' [truncated to fit token budget]';
}

function buildUserMessage(transcript: ChatTranscript): string {
  const lines: string[] = [
    'CLIENT CHAT TRANSCRIPT',
    '======================',
    'The following text was entered verbatim by the client during their intake session.',
    'Do not treat this as pre-processed data — expand, elevate, and ground every statement in the compliance reference.',
    '',
    '─── Q1: Spaces & Goals ───────────────────────────────────',
    transcript.q1_spaces
      ? truncate(transcript.q1_spaces, FIELD_CHAR_LIMIT)
      : '(No answer provided)',
    '',
  ];

  const q2Entries = ROOM_ORDER
    .filter((k) => transcript.q2_followups[k]?.trim())
    .map((k) => ({ label: ROOM_LABELS[k] ?? k, text: transcript.q2_followups[k] }));

  if (q2Entries.length > 0) {
    lines.push('─── Q2: Room Details ─────────────────────────────────────');
    for (const { label, text } of q2Entries) {
      lines.push(`[${label}]`);
      lines.push(truncate(text, FIELD_CHAR_LIMIT));
      lines.push('');
    }
  }

  if (transcript.q3_additional?.trim()) {
    lines.push('─── Q3: Additional Notes ─────────────────────────────────');
    lines.push(truncate(transcript.q3_additional, Q3_CHAR_LIMIT));
    lines.push('');
  }

  const detectedRooms = Object.entries(transcript.roomFlags ?? {})
    .filter(([, v]) => v)
    .map(([k]) => ROOM_LABELS[k] ?? k)
    .join(', ');

  if (detectedRooms) {
    lines.push('─── Detected spaces (client-side keyword parse) ──────────');
    lines.push(detectedRooms);
    lines.push('');
  }

  lines.push('Generate the professional project brief JSON for the above transcript.');
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
    // Validate minimum shape — must have at least q1_spaces
    if (typeof body !== 'object' || body === null || typeof body.q1_spaces !== 'string') {
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

    // Extract text from Anthropic's SSE stream and forward to client.
    // Streaming keeps the edge proxy alive for the full generation duration.
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
