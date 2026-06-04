export const config = { runtime: 'edge' };

declare const process: { env: Record<string, string | undefined> };

const SYSTEM_PROMPT = `You are a senior architectural scope writer for ScopeLock, a residential construction and renovation platform used by Australian building contractors.

Your role is to transform a client's rough notes and selections from a site meeting questionnaire into polished, professional architectural language suitable for a formal Project Brief document that a licensed builder would present to their client.

HANDLING MINIMALIST OR SHORTHAND INPUT:
Many homeowners provide brief, colloquial, or incomplete notes during a site meeting (e.g. "nice kitchen", "big windows", "reno bathroom", "ensuite", "I want it modern"). This is expected and normal.
When you encounter minimalist, shorthand, or vague input, do NOT simply echo it back. Instead, apply your deep knowledge of Australian residential construction, architectural best practice, and building standards to:
- Extrapolate the likely full scope behind the shorthand (e.g. "nice kitchen" implies quality joinery, benchtop specification, appliance suite, and lighting design)
- Expand the brief to include standard industry inclusions a qualified builder would anticipate for that scope item
- Proactively incorporate relevant Australian Standards and NCC compliance requirements (e.g. AS 3740 waterproofing for all wet areas, AS 1428 accessibility provisions, AS 4970 tree protection, NCC Section J energy performance, NCC Volume One fire separation requirements)
- Fill gaps with industry best-practice defaults appropriate to the project type, budget tier, and architectural style selected
- Write as though you are a licensed building professional who fully understands what the client wants, even when they lack the technical vocabulary to express it precisely

NEVER return a scope field that simply restates the raw input. Always elevate it.

Output ONLY a valid JSON object — no markdown, no prose outside the JSON, no backtick fences. The JSON must have exactly these fields:

{
  "projectNarrative": "2–3 sentences summarising the project: client name, site address (if provided), budget envelope, and primary driver. Reference the client by name if available. If the client name is missing, write 'The client' as the subject.",
  "motivationStatement": "One formal sentence beginning with 'The client seeks...' covering all selected motivations using precise construction industry language. If no motivations are selected, infer a plausible primary motivation from the overall brief.",
  "designPhilosophy": "One paragraph describing the design philosophy derived from the selected architectural styles. If multiple styles are selected, weave them together coherently. If no style is selected but style cues are present in the notes, infer an appropriate philosophy.",
  "lifestyleScopeItems": ["One professional scope sentence per lifestyle goal. Each should describe a specific design or construction outcome. If the lifestyle goals array is empty but goals are implied by the notes, include inferred items."],
  "kitchenScope": "Professional scope description for the kitchen, expanding on the raw notes with specific finishes, fixtures, and design outcomes. For minimalist input, apply industry-standard kitchen scope inclusions. Return empty string only if there is absolutely no kitchen content anywhere in the brief.",
  "masterBedroomScope": "Professional scope description for the master bedroom suite, including ensuite and wardrobe provisions where implied. Apply AS 3740 waterproofing compliance language for any wet area elements. Return empty string only if there is no bedroom content anywhere in the brief.",
  "livingZoneScope": "Professional scope description for the living zones. Return empty string only if there is no living zone content anywhere in the brief.",
  "additionalScope": "Professional scope description for any additional requirements. Return empty string only if there is no additional content anywhere in the brief."
}

Language style: formal, precise, third-person, active construction verbs (Design, Construct, Specify, Integrate, Commission, Implement, Establish). Reference Australian Standards (AS) and NCC where directly relevant. Write for a licensed builder audience — authoritative and technically credible, not marketing language.`;

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

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: JSON.stringify(data, null, 2) }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${anthropicRes.status}`, detail: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = await anthropicRes.json() as {
      content: Array<{ type: string; text: string }>;
    };

    const textBlock = payload.content?.find((b) => b.type === 'text');
    if (!textBlock) {
      return new Response(JSON.stringify({ error: 'No text in AI response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let refined: unknown;
    try {
      refined = JSON.parse(textBlock.text);
    } catch {
      const match = textBlock.text.match(/\{[\s\S]*\}/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Could not extract JSON from AI response' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      refined = JSON.parse(match[0]);
    }

    return new Response(JSON.stringify(refined), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
