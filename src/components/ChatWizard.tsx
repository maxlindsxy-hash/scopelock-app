import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import type { ChatTranscript, RoomFlags, RoomKey, ClientContact } from '../types';
import { initialClientContact } from '../types';

// ─── Room metadata ────────────────────────────────────────────────────────────

export const ROOM_ORDER: RoomKey[] = [
  'kitchen', 'bathroom', 'masterBedroom', 'livingZone',
  'laundry', 'study', 'outdoor', 'garage',
];

export const ROOM_META: Record<RoomKey, { label: string; placeholder: string }> = {
  kitchen: {
    label: 'Kitchen',
    placeholder: "e.g. Island bench with waterfall stone benchtops, butler's pantry, fully integrated appliances, open to the living area...",
  },
  bathroom: {
    label: 'Bathroom(s)',
    placeholder: 'e.g. Frameless shower and freestanding bath in the main bathroom, double vanity, floor-to-ceiling tiles throughout...',
  },
  masterBedroom: {
    label: 'Master Bedroom Suite',
    placeholder: 'e.g. Walk-in robe, ensuite with double vanity and freestanding bath, north-facing aspect, plenty of natural light...',
  },
  livingZone: {
    label: 'Living & Dining',
    placeholder: 'e.g. Open-plan kitchen, dining and living with bi-fold doors to the outdoor area, high ceilings, separate media room...',
  },
  laundry: {
    label: 'Laundry',
    placeholder: 'e.g. Separate laundry room with bench space, overhead storage, external access to a clothesline...',
  },
  study: {
    label: 'Study / Home Office',
    placeholder: 'e.g. Quiet dedicated room with built-in desk and shelving, good natural light — used for working from home daily...',
  },
  outdoor: {
    label: 'Outdoor & Alfresco',
    placeholder: 'e.g. Covered alfresco dining area, inground pool, landscaped rear garden — we entertain outdoors year-round...',
  },
  garage: {
    label: 'Garage & Parking',
    placeholder: 'e.g. Double garage with internal access, EV charging point, extra storage mezzanine above...',
  },
};

// ─── Room keyword parser ──────────────────────────────────────────────────────

export function parseRoomFlags(text: string): RoomFlags {
  const t = text.toLowerCase();
  return {
    kitchen:      /kitchen|cook|culinary|bench|island|pantry|appliance/.test(t),
    bathroom:     /bathroom|bath\b|shower|vanity|toilet|ensuite|wet area|powder room/.test(t),
    masterBedroom:/master|bedroom|bed room|\brobe\b|wardrobe|\bwir\b|suite/.test(t),
    livingZone:   /living|lounge|family room|dining|open.?plan|media room|theatre/.test(t),
    laundry:      /laundry|mud.?room|utility room/.test(t),
    study:        /study|office|home office|work from home|library/.test(t),
    outdoor:      /outdoor|alfresco|garden|pool|deck|patio|backyard|verand|balcony/.test(t),
    garage:       /garage|\bcar\b|parking|carport/.test(t),
  };
}

function getActiveRooms(flags: RoomFlags): RoomKey[] {
  return ROOM_ORDER.filter((k) => flags[k]);
}

// ─── Architectural context options ───────────────────────────────────────────

const HERITAGE_OPTIONS = [
  { value: 'none',              label: 'Not Listed'         },
  { value: 'conservation-area', label: 'Conservation Area'  },
  { value: 'heritage-listed',   label: 'Heritage Listed'    },
];

const PROPERTY_ERAS = [
  { value: 'pre-1900',   label: 'Pre-1900'   },
  { value: '1900-1940',  label: '1900–1940'  },
  { value: '1941-1970',  label: '1941–1970'  },
  { value: '1971-2000',  label: '1971–2000'  },
  { value: '2001+',      label: '2001+'       },
];

const SCOPE_TYPES = [
  { value: 'footprint-extension', label: 'Footprint Extension' },
  { value: 'structural-remodel',  label: 'Structural Remodel'  },
  { value: 'loft-conversion',     label: 'Loft Conversion'     },
  { value: 'internal-remodel',    label: 'Internal Remodel'    },
];

// ─── Shared chip component ────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-colors
        ${active
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
    >
      {label}
    </button>
  );
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const ZONE_QUESTIONS: Record<RoomKey, string> = {
  kitchen:      "Tell me about your kitchen — what are the must-haves? Island bench, butler's pantry, appliances, layout?",
  bathroom:     "Describe your bathrooms — shower style, bath, vanity configuration, finishes, any specific rooms?",
  masterBedroom:"What's your vision for the master suite? Walk-in robe, ensuite, orientation, size targets?",
  livingZone:   "How do you want your living and dining to work? Open plan, separate rooms, indoor-outdoor connection?",
  laundry:      "What do you need from your laundry — bench space, storage, external access, separate room?",
  study:        "Tell me about the study or home office — how do you use it and what's essential?",
  outdoor:      "Describe your outdoor vision — alfresco, pool, garden, entertaining. How do you live outside?",
  garage:       "What are your garage and parking needs — size, EV charging, internal access, storage?",
};

function buildScopePrompt(firstName: string): string {
  return `Hi ${firstName}! Which spaces are you looking to renovate or build, and what's the main goal? Describe the work type and spaces in your own words.`;
}

const BUDGET_PROMPT =
  "What's your investment target for this project and when are you looking to start? Also let us know whether your figure already includes a contingency buffer or professional fees (design, survey, certification).";

const FINISHES_PROMPT =
  "Nearly there. First — are there any site access constraints we should know about? Then add any final notes on finishes, materials, or other requirements.";

function buildZonePrompt(room: RoomKey, index: number, total: number): string {
  const q = ZONE_QUESTIONS[room];
  if (total === 1) return q;
  if (index === 0) return `Perfect — let's go through each space. ${q}`;
  if (index === total - 1) return `Last one. ${q}`;
  return q;
}

function formatBudgetAnswer(
  budget: string,
  timeline: string,
  contingency: boolean | null,
  fees: boolean | null,
): string {
  const parts: string[] = [];
  if (budget.trim()) parts.push(`Budget: ${budget.trim()}`);
  if (timeline.trim()) parts.push(`Timeline: ${timeline.trim()}`);
  const inclusions: string[] = [];
  if (contingency === true) inclusions.push('contingency buffer');
  if (fees === true) inclusions.push('professional fees');
  if (inclusions.length > 0) parts.push(`Includes: ${inclusions.join(', ')}`);
  return parts.join('\n') || '(No details provided)';
}

// ─── Phase machine ────────────────────────────────────────────────────────────

type PhaseKind = 'contact' | 'scope' | 'budget' | 'zone' | 'finishes' | 'complete';

interface Phase {
  kind: PhaseKind;
  zoneIndex: number;
}

function getInitialPhase(t: ChatTranscript, rooms: RoomKey[]): Phase {
  if (t.completedAt) return { kind: 'complete', zoneIndex: 0 };
  if (t.q1_spaces && (t.budget || t.timeline)) {
    if (rooms.length === 0) return { kind: 'finishes', zoneIndex: 0 };
    const firstUnanswered = rooms.findIndex((r) => !t.q2_followups[r]?.trim());
    if (firstUnanswered === -1) return { kind: 'finishes', zoneIndex: 0 };
    return { kind: 'zone', zoneIndex: firstUnanswered };
  }
  if (t.q1_spaces) return { kind: 'budget', zoneIndex: 0 };
  if (t.clientContact.name) return { kind: 'scope', zoneIndex: 0 };
  return { kind: 'contact', zoneIndex: 0 };
}

function phaseToStep(phase: Phase): number {
  switch (phase.kind) {
    case 'contact':  return 1;
    case 'scope':    return 2;
    case 'budget':   return 3;
    case 'zone':     return 4;
    case 'finishes': return 5;
    default:         return 0;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

interface Props {
  transcript: ChatTranscript;
  onUpdate: (t: ChatTranscript) => void;
  onComplete: (t: ChatTranscript) => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Contact', 'Scope', 'Budget', 'Rooms', 'Site & Notes'];

function ChatStepIndicator({ step }: { step: number }) {
  if (step === 0) return null;
  return (
    <div className="flex items-start mb-6">
      {STEP_LABELS.map((label, i) => {
        const s = i + 1;
        const isDone = s < step;
        const isCurrent = s === step;
        const isLast = i === STEP_LABELS.length - 1;
        return (
          <div key={s} className={`flex items-start ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${isDone ? 'bg-indigo-600 text-white' : isCurrent ? 'bg-white border-2 border-indigo-600 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                {isDone ? <CheckCircle2 size={13} strokeWidth={2.5} /> : s}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block whitespace-nowrap transition-colors
                ${isCurrent ? 'text-indigo-600' : isDone ? 'text-indigo-400' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 mt-3.5 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isDone ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Chat bubbles ─────────────────────────────────────────────────────────────

function AssistantBubble({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
        <Lock size={13} className="text-white" />
      </div>
      <div className="max-w-[82%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 shadow-sm text-sm text-slate-700 leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[82%] px-4 py-3 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

// ─── Completion screen ────────────────────────────────────────────────────────

function CompletionScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 px-5 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 280, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
      >
        <CheckCircle2 size={40} className="text-emerald-500" />
      </motion.div>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">All done!</h2>
      <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
        Your project details have been submitted. Your contractor will review your answers and prepare a professional brief shortly.
      </p>
    </motion.div>
  );
}

// ─── Contact screen ───────────────────────────────────────────────────────────

interface ContactScreenProps {
  contact: ClientContact;
  onChange: (c: ClientContact) => void;
  onSubmit: () => void;
  heritageStatus: string;
  onHeritageChange: (v: string) => void;
  propertyEra: string;
  onEraChange: (v: string) => void;
}

function ContactScreen({
  contact, onChange, onSubmit,
  heritageStatus, onHeritageChange,
  propertyEra, onEraChange,
}: ContactScreenProps) {
  const canSubmit = contact.name.trim() && contact.email.trim() && contact.siteAddress.trim();

  const field = (
    label: string,
    key: keyof ClientContact,
    placeholder: string,
    type = 'text',
    optional = false
  ) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {label}
        {optional && <span className="text-xs font-normal text-slate-400">(optional)</span>}
      </label>
      <input
        type={type}
        value={contact[key]}
        onChange={(e) => onChange({ ...contact, [key]: e.target.value })}
        onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) onSubmit(); }}
        placeholder={placeholder}
        autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'street-address'}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900
                   placeholder:text-slate-400 text-sm focus:border-indigo-500 focus:outline-none
                   transition-colors bg-white"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-sm mx-auto w-full px-5 py-8 space-y-6">
        <ChatStepIndicator step={1} />

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Let's get started</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            A few quick details before we dive into your project.
          </p>
        </div>

        <div className="space-y-4">
          {field('Full Name', 'name', 'e.g. Sarah Mitchell')}
          {field('Email Address', 'email', 'sarah@example.com', 'email')}
          {field('Mobile', 'phone', '+61 4xx xxx xxx', 'tel', true)}
          {field('Site Address', 'siteAddress', '14 Harbour View Rd, Newport NSW 2106')}
        </div>

        {/* Heritage / Conservation Status */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            Heritage Status
            <span className="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {HERITAGE_OPTIONS.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                active={heritageStatus === value}
                onClick={() => onHeritageChange(heritageStatus === value ? '' : value)}
              />
            ))}
          </div>
          {heritageStatus === 'conservation-area' && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Heritage officer pre-approval may be required before DA submission.
            </p>
          )}
          {heritageStatus === 'heritage-listed' && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Statement of Heritage Impact and Heritage Council approval will be required.
            </p>
          )}
        </div>

        {/* Property Era */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            Property Era
            <span className="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_ERAS.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                active={propertyEra === value}
                onClick={() => onEraChange(propertyEra === value ? '' : value)}
              />
            ))}
          </div>
          {(propertyEra === 'pre-1900' || propertyEra === '1900-1940' || propertyEra === '1941-1970') && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Pre-1970 properties may contain asbestos or lead-based materials — a licensed assessor report is recommended before structural works.
            </p>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                     bg-indigo-600 text-white font-semibold text-sm
                     hover:bg-indigo-700 active:bg-indigo-800
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Begin
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Message history builder (for session resume) ─────────────────────────────

function buildInitialMessages(
  t: ChatTranscript,
  phase: Phase,
  rooms: RoomKey[]
): ChatMessage[] {
  const msgs: ChatMessage[] = [];
  if (phase.kind === 'contact') return msgs;

  const firstName = t.clientContact.name.split(' ')[0] || 'there';
  msgs.push({ id: 'scope-prompt', role: 'assistant', content: buildScopePrompt(firstName) });
  if (!t.q1_spaces || phase.kind === 'scope') return msgs;

  msgs.push({ id: 'scope-ans', role: 'user', content: t.q1_spaces });
  msgs.push({ id: 'budget-prompt', role: 'assistant', content: BUDGET_PROMPT });
  if (phase.kind === 'budget') return msgs;

  msgs.push({
    id: 'budget-ans',
    role: 'user',
    content: formatBudgetAnswer(
      t.budget, t.timeline,
      t.budgetIncludesContingency ?? null,
      t.budgetIncludesProfessionalFees ?? null,
    ),
  });

  if (rooms.length === 0) {
    msgs.push({ id: 'finishes-prompt', role: 'assistant', content: FINISHES_PROMPT });
    return msgs;
  }

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    msgs.push({ id: `zone-prompt-${room}`, role: 'assistant', content: buildZonePrompt(room, i, rooms.length) });
    if (phase.kind === 'zone' && phase.zoneIndex === i) return msgs;
    const ans = t.q2_followups[room];
    if (ans?.trim()) {
      msgs.push({ id: `zone-ans-${room}`, role: 'user', content: ans });
    } else {
      return msgs;
    }
  }

  msgs.push({ id: 'finishes-prompt', role: 'assistant', content: FINISHES_PROMPT });
  if (phase.kind === 'finishes') return msgs;
  if (t.q3_additional) {
    msgs.push({ id: 'finishes-ans', role: 'user', content: t.q3_additional });
  }
  return msgs;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChatWizard({ transcript, onUpdate, onComplete }: Props) {
  const initialRooms = getActiveRooms(transcript.roomFlags);
  const initialPhase = getInitialPhase(transcript, initialRooms);

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [localRooms, setLocalRooms] = useState<RoomKey[]>(initialRooms);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(transcript, initialPhase, initialRooms)
  );

  // Per-phase input state
  const [contact, setContact] = useState<ClientContact>(
    transcript.clientContact ?? initialClientContact
  );
  const [heritageStatus, setHeritageStatus] = useState(transcript.heritageStatus ?? '');
  const [propertyEra, setPropertyEra] = useState(transcript.propertyEra ?? '');
  const [scopeInput, setScopeInput] = useState('');
  const [scopeTypes, setScopeTypes] = useState<string[]>(transcript.scopeType ?? []);
  const [budgetInput, setBudgetInput] = useState(transcript.budget);
  const [timelineInput, setTimelineInput] = useState(transcript.timeline);
  const [budgetContingency, setBudgetContingency] = useState<boolean | null>(
    transcript.budgetIncludesContingency ?? null
  );
  const [budgetFees, setBudgetFees] = useState<boolean | null>(
    transcript.budgetIncludesProfessionalFees ?? null
  );
  const [zoneInput, setZoneInput] = useState('');
  const [siteAccessInput, setSiteAccessInput] = useState(transcript.siteAccessConstraints ?? '');
  const [finishesInput, setFinishesInput] = useState(transcript.q3_additional);

  // Pre-populate zone input when phase moves to a new room
  useEffect(() => {
    if (phase.kind === 'zone') {
      const room = localRooms[phase.zoneIndex];
      setZoneInput(transcript.q2_followups[room] ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.kind, phase.zoneIndex]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Submissions ──────────────────────────────────────────────────────────────

  const submitContact = () => {
    if (!contact.name.trim() || !contact.email.trim() || !contact.siteAddress.trim()) return;
    const updated = { ...transcript, clientContact: contact, heritageStatus, propertyEra };
    onUpdate(updated);
    const firstName = contact.name.trim().split(' ')[0];
    setMessages([{ id: 'scope-prompt', role: 'assistant', content: buildScopePrompt(firstName) }]);
    setPhase({ kind: 'scope', zoneIndex: 0 });
  };

  const submitScope = () => {
    const text = scopeInput.trim();
    if (!text) return;
    const flags = parseRoomFlags(text);
    const rooms = getActiveRooms(flags);
    setLocalRooms(rooms);
    const updated = { ...transcript, q1_spaces: text, roomFlags: flags, scopeType: scopeTypes };
    onUpdate(updated);
    setMessages((prev) => [
      ...prev,
      { id: `scope-ans-${Date.now()}`, role: 'user', content: text },
      { id: `budget-prompt-${Date.now()}`, role: 'assistant', content: BUDGET_PROMPT },
    ]);
    setScopeInput('');
    setPhase({ kind: 'budget', zoneIndex: 0 });
  };

  const submitBudget = () => {
    const updated = {
      ...transcript,
      budget: budgetInput.trim(),
      timeline: timelineInput.trim(),
      budgetIncludesContingency: budgetContingency,
      budgetIncludesProfessionalFees: budgetFees,
    };
    onUpdate(updated);
    const answer = formatBudgetAnswer(budgetInput, timelineInput, budgetContingency, budgetFees);
    const newMsgs: ChatMessage[] = [
      { id: `budget-ans-${Date.now()}`, role: 'user', content: answer },
    ];
    const rooms = localRooms;
    if (rooms.length > 0) {
      newMsgs.push({
        id: `zone-0-prompt-${Date.now()}`,
        role: 'assistant',
        content: buildZonePrompt(rooms[0], 0, rooms.length),
      });
      setMessages((prev) => [...prev, ...newMsgs]);
      setPhase({ kind: 'zone', zoneIndex: 0 });
    } else {
      newMsgs.push({ id: `finishes-prompt-${Date.now()}`, role: 'assistant', content: FINISHES_PROMPT });
      setMessages((prev) => [...prev, ...newMsgs]);
      setPhase({ kind: 'finishes', zoneIndex: 0 });
    }
  };

  const submitZone = () => {
    const room = localRooms[phase.zoneIndex];
    const text = zoneInput.trim();
    const newFollowups = { ...transcript.q2_followups, [room]: text };
    const updated = { ...transcript, q2_followups: newFollowups };
    onUpdate(updated);

    const nextIdx = phase.zoneIndex + 1;
    const newMsgs: ChatMessage[] = [];
    if (text) newMsgs.push({ id: `zone-ans-${room}-${Date.now()}`, role: 'user', content: text });

    if (nextIdx < localRooms.length) {
      newMsgs.push({
        id: `zone-prompt-${nextIdx}-${Date.now()}`,
        role: 'assistant',
        content: buildZonePrompt(localRooms[nextIdx], nextIdx, localRooms.length),
      });
      setMessages((prev) => [...prev, ...newMsgs]);
      setPhase({ kind: 'zone', zoneIndex: nextIdx });
    } else {
      newMsgs.push({ id: `finishes-prompt-${Date.now()}`, role: 'assistant', content: FINISHES_PROMPT });
      setMessages((prev) => [...prev, ...newMsgs]);
      setPhase({ kind: 'finishes', zoneIndex: 0 });
    }
  };

  const submitFinishes = () => {
    const text = finishesInput.trim();
    const completedAt = new Date().toISOString();
    const updated = {
      ...transcript,
      q3_additional: text,
      siteAccessConstraints: siteAccessInput.trim(),
      completedAt,
    };
    onUpdate(updated);
    onComplete(updated);
    const summaryParts: string[] = [];
    if (siteAccessInput.trim()) summaryParts.push(`Site access: ${siteAccessInput.trim()}`);
    if (text) summaryParts.push(text);
    const userContent = summaryParts.join('\n\n');
    if (userContent) {
      setMessages((prev) => [
        ...prev,
        { id: `fin-ans-${Date.now()}`, role: 'user', content: userContent },
      ]);
    }
    setPhase({ kind: 'complete', zoneIndex: 0 });
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const currentRoom = phase.kind === 'zone' ? localRooms[phase.zoneIndex] : undefined;
  const indicatorStep = phaseToStep(phase);

  // ── Render ────────────────────────────────────────────────────────────────────

  if (phase.kind === 'contact') {
    return (
      <ContactScreen
        contact={contact}
        onChange={setContact}
        onSubmit={submitContact}
        heritageStatus={heritageStatus}
        onHeritageChange={setHeritageStatus}
        propertyEra={propertyEra}
        onEraChange={setPropertyEra}
      />
    );
  }

  if (phase.kind === 'complete') return <CompletionScreen />;

  return (
    <div className="flex flex-col h-full">

      {/* Step indicator */}
      <div className="px-5 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <ChatStepIndicator step={indicatorStep} />
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {msg.role === 'assistant'
                  ? <AssistantBubble content={msg.content} />
                  : <UserBubble content={msg.content} />
                }
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input panel */}
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 shrink-0">
        <div className="max-w-2xl mx-auto space-y-3">

          {/* Scope — project type chips + free text */}
          {phase.kind === 'scope' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Project Type <span className="ml-1 font-normal normal-case text-slate-400">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SCOPE_TYPES.map(({ value, label }) => (
                    <Chip
                      key={value}
                      label={label}
                      active={scopeTypes.includes(value)}
                      onClick={() =>
                        setScopeTypes((prev) =>
                          prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
                        )
                      }
                    />
                  ))}
                </div>
              </div>
              <textarea
                value={scopeInput}
                onChange={(e) => setScopeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitScope(); }}
                placeholder="e.g. We want to extend the rear footprint to add a kitchen-dining zone, convert the loft into a master suite, and structurally open the ground floor..."
                rows={4}
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white
                           text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed
                           focus:border-indigo-500 focus:outline-none resize-none transition-colors"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">⌘↵ to send</span>
                <button onClick={submitScope} disabled={!scopeInput.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white
                             font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40
                             disabled:cursor-not-allowed transition-colors">
                  <Send size={14} /> Continue
                </button>
              </div>
            </>
          )}

          {/* Budget & timeline + contingency/fees toggles */}
          {phase.kind === 'budget' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Investment Target
                  </label>
                  <input
                    type="text"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="e.g. $250K – $500K"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white
                               text-slate-900 placeholder:text-slate-400 text-sm
                               focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Intended Timeline
                  </label>
                  <input
                    type="text"
                    value={timelineInput}
                    onChange={(e) => setTimelineInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitBudget(); }}
                    placeholder="e.g. Start early 2026"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white
                               text-slate-900 placeholder:text-slate-400 text-sm
                               focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Budget Includes
                </label>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    label={budgetContingency === true ? '✓ Contingency Buffer' : 'Contingency Buffer'}
                    active={budgetContingency === true}
                    onClick={() => setBudgetContingency((v) => (v === true ? null : true))}
                  />
                  <Chip
                    label={budgetFees === true ? '✓ Professional Fees' : 'Professional Fees'}
                    active={budgetFees === true}
                    onClick={() => setBudgetFees((v) => (v === true ? null : true))}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Select if your figure already covers contingency and/or design/survey/certification fees.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Skip any fields not yet decided</span>
                <button onClick={submitBudget}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white
                             font-semibold text-sm hover:bg-indigo-700 transition-colors">
                  <Send size={14} /> Continue
                </button>
              </div>
            </>
          )}

          {/* Zone deep-dive */}
          {phase.kind === 'zone' && currentRoom && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {ROOM_META[currentRoom].label}
                  <span className="ml-2 font-normal normal-case text-slate-400">
                    {phase.zoneIndex + 1} of {localRooms.length}
                  </span>
                </label>
                <textarea
                  key={currentRoom}
                  value={zoneInput}
                  onChange={(e) => setZoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitZone(); }}
                  placeholder={ROOM_META[currentRoom].placeholder}
                  rows={4}
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white
                             text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed
                             focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Skip if not applicable</span>
                <button onClick={submitZone}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white
                             font-semibold text-sm hover:bg-indigo-700 transition-colors">
                  <Send size={14} />
                  {phase.zoneIndex + 1 < localRooms.length ? 'Continue' : 'Next'}
                </button>
              </div>
            </>
          )}

          {/* Site & notes — site access + finishes */}
          {phase.kind === 'finishes' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Site Access Constraints
                  <span className="ml-2 font-normal normal-case text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={siteAccessInput}
                  onChange={(e) => setSiteAccessInput(e.target.value)}
                  placeholder="e.g. Narrow side passage (600mm), overhead power lines on the north boundary, shared driveway with neighbour — no crane access from the street..."
                  rows={3}
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white
                             text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed
                             focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Additional Notes & Finishes
                  <span className="ml-2 font-normal normal-case text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={finishesInput}
                  onChange={(e) => setFinishesInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitFinishes(); }}
                  placeholder="e.g. Polished concrete floors throughout ground level. Existing Jacaranda tree must be retained. Future pool provision in structural design. Stone and joinery samples already selected..."
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white
                             text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed
                             focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">⌘↵ to submit</span>
                <button onClick={submitFinishes}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                             bg-gradient-to-r from-indigo-600 to-violet-600 text-white
                             hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-[0.98]">
                  <CheckCircle2 size={14} /> Submit
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
