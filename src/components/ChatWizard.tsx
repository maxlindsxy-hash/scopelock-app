import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Lock } from 'lucide-react';
import type { ChatTranscript, RoomFlags, RoomKey } from '../types';

// ─── Room metadata ────────────────────────────────────────────────────────────

export const ROOM_ORDER: RoomKey[] = [
  'kitchen', 'bathroom', 'masterBedroom', 'livingZone',
  'laundry', 'study', 'outdoor', 'garage',
];

export const ROOM_META: Record<RoomKey, { label: string; placeholder: string }> = {
  kitchen: {
    label: 'Kitchen',
    placeholder: "e.g. I'd love an island bench with stone benchtops, a butler's pantry, and fully integrated appliances. The kitchen should open to the living area...",
  },
  bathroom: {
    label: 'Bathroom(s)',
    placeholder: 'e.g. A frameless shower and freestanding bath in the main bathroom, double vanity, floor-to-ceiling tiles, heated floors...',
  },
  masterBedroom: {
    label: 'Master Bedroom Suite',
    placeholder: 'e.g. A large walk-in robe, ensuite with double vanity and a freestanding bath, north-facing aspect, plenty of natural light...',
  },
  livingZone: {
    label: 'Living & Dining',
    placeholder: 'e.g. Open-plan kitchen, dining, and living area with bi-fold doors to the outdoor entertaining space, high ceilings, a separate media room...',
  },
  laundry: {
    label: 'Laundry',
    placeholder: 'e.g. Separate laundry room with plenty of bench space, overhead storage, external access to a clothesline area...',
  },
  study: {
    label: 'Study / Home Office',
    placeholder: 'e.g. A quiet dedicated room with a built-in desk and shelving, good natural light — I work from home every day...',
  },
  outdoor: {
    label: 'Outdoor & Alfresco',
    placeholder: 'e.g. Covered alfresco dining area, inground pool, landscaped rear garden — we love entertaining outdoors year-round...',
  },
  garage: {
    label: 'Garage & Parking',
    placeholder: 'e.g. Double garage with internal access to the house, EV charging point, extra storage area above...',
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

// ─── Prompt builders ──────────────────────────────────────────────────────────

const Q1_PROMPT =
  "Hi there! Which spaces are you looking to renovate or build, and what's the main goal for this project? Feel free to describe everything in your own words — there are no right or wrong answers.";

function buildQ2Prompt(flags: RoomFlags): string {
  const rooms = getActiveRooms(flags);
  if (rooms.length === 0) {
    return "Tell us more about the spaces you have in mind. Describe the key features, layout preferences, or anything specific that matters to you.";
  }
  const labels = rooms.map((r) => ROOM_META[r].label);
  const listed =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
  return `Perfect — I've noted you're focusing on your ${listed}. Let's get into the details. Describe your vision for each space in your own words.`;
}

const Q3_PROMPT =
  "Almost there! Is there anything else we should know? Think about material finishes you love, any site constraints, unique requirements, or ideas you haven't mentioned yet.";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

type Step = 1 | 2 | 3 | 4;

interface Props {
  transcript: ChatTranscript;
  onUpdate: (t: ChatTranscript) => void;
  onComplete: (t: ChatTranscript) => void;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Spaces & Goals', 'Room Details', 'Final Notes'];

function ChatStepIndicator({ step }: { step: Step }) {
  if (step === 4) return null;
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEP_LABELS.map((label, i) => {
        const s = (i + 1) as Step;
        const isDone = s < step;
        const isCurrent = s === step;
        const isLast = i === STEP_LABELS.length - 1;
        return (
          <div key={s} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isDone ? 'bg-indigo-600 text-white' : isCurrent ? 'bg-white border-2 border-indigo-600 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}
              >
                {isDone ? <CheckCircle2 size={13} strokeWidth={2.5} /> : s}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block whitespace-nowrap transition-colors
                ${isCurrent ? 'text-indigo-600' : isDone ? 'text-indigo-400' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 mb-4 rounded-full bg-slate-200 overflow-hidden">
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

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export function ChatWizard({ transcript, onUpdate, onComplete }: Props) {
  // ── Derive initial step from saved transcript ──
  const getInitialStep = (): Step => {
    if (transcript.completedAt) return 4;
    if (transcript.q1_spaces && Object.keys(transcript.q2_followups).length > 0) return 3;
    if (transcript.q1_spaces) return 2;
    return 1;
  };

  const [step, setStep] = useState<Step>(getInitialStep);
  const [localFlags, setLocalFlags] = useState<RoomFlags>(transcript.roomFlags);

  // ── Input state ──
  const [q1Input, setQ1Input] = useState('');
  const [q2Inputs, setQ2Inputs] = useState<Partial<Record<RoomKey, string>>>(transcript.q2_followups);
  const [q3Input, setQ3Input] = useState(transcript.q3_additional);

  // ── Build initial message history from saved transcript ──
  const buildInitialMessages = (): ChatMessage[] => {
    const msgs: ChatMessage[] = [{ id: 'q1-prompt', role: 'assistant', content: Q1_PROMPT }];
    if (!transcript.q1_spaces) return msgs;

    msgs.push({ id: 'q1-answer', role: 'user', content: transcript.q1_spaces });
    msgs.push({ id: 'q2-prompt', role: 'assistant', content: buildQ2Prompt(transcript.roomFlags) });

    if (Object.keys(transcript.q2_followups).length > 0) {
      const summary = (ROOM_ORDER as RoomKey[])
        .filter((k) => transcript.q2_followups[k]?.trim())
        .map((k) => `${ROOM_META[k].label}:\n${transcript.q2_followups[k]}`)
        .join('\n\n');
      if (summary) msgs.push({ id: 'q2-answer', role: 'user', content: summary });
      msgs.push({ id: 'q3-prompt', role: 'assistant', content: Q3_PROMPT });
    }

    if (transcript.q3_additional) {
      msgs.push({ id: 'q3-answer', role: 'user', content: transcript.q3_additional });
    }
    return msgs;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(buildInitialMessages);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Step submissions ──────────────────────────────────────────────────────

  const submitQ1 = () => {
    const text = q1Input.trim();
    if (!text) return;
    const flags = parseRoomFlags(text);
    setLocalFlags(flags);
    const updated: ChatTranscript = { ...transcript, q1_spaces: text, roomFlags: flags };
    onUpdate(updated);
    const q2Prompt = buildQ2Prompt(flags);
    setMessages((prev) => [
      ...prev,
      { id: `u1-${Date.now()}`, role: 'user', content: text },
      { id: `a2-${Date.now()}`, role: 'assistant', content: q2Prompt },
    ]);
    setQ1Input('');
    setStep(2);
  };

  const submitQ2 = () => {
    const updated: ChatTranscript = { ...transcript, q2_followups: q2Inputs };
    onUpdate(updated);

    const activeRooms = getActiveRooms(localFlags).length > 0
      ? getActiveRooms(localFlags)
      : (['livingZone'] as RoomKey[]);

    const summary = activeRooms
      .filter((k) => q2Inputs[k]?.trim())
      .map((k) => `${ROOM_META[k].label}:\n${q2Inputs[k]}`)
      .join('\n\n');

    setMessages((prev) => [
      ...prev,
      ...(summary ? [{ id: `u2-${Date.now()}`, role: 'user' as const, content: summary }] : []),
      { id: `a3-${Date.now()}`, role: 'assistant' as const, content: Q3_PROMPT },
    ]);
    setStep(3);
  };

  const submitQ3 = () => {
    const text = q3Input.trim();
    const completedAt = new Date().toISOString();
    const updated: ChatTranscript = { ...transcript, q3_additional: text, completedAt };
    onUpdate(updated);
    onComplete(updated);
    if (text) {
      setMessages((prev) => [
        ...prev,
        { id: `u3-${Date.now()}`, role: 'user', content: text },
      ]);
    }
    setStep(4);
  };

  // ── Active rooms (for Q2 input rendering) ────────────────────────────────

  const activeRooms = getActiveRooms(localFlags).length > 0
    ? getActiveRooms(localFlags)
    : (['livingZone'] as RoomKey[]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (step === 4) return <CompletionScreen />;

  return (
    <div className="flex flex-col h-full">

      {/* Step indicator */}
      <div className="px-5 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <ChatStepIndicator step={step} />
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
        <div className="max-w-2xl mx-auto">

          {/* Q1 input */}
          {step === 1 && (
            <div className="space-y-3">
              <textarea
                value={q1Input}
                onChange={(e) => setQ1Input(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitQ1(); }}
                placeholder="e.g. We want to renovate the kitchen and master bedroom, and add an outdoor entertaining area. The main goal is to create a modern family home that's great for entertaining..."
                rows={4}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white
                           text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed
                           focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">⌘↵ to send</span>
                <button
                  onClick={submitQ1}
                  disabled={!q1Input.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white
                             font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800
                             disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Q2 input — dynamic per-room textareas */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 max-h-[50vh] overflow-y-auto pr-1">
                {activeRooms.map((room) => (
                  <div key={room} className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {ROOM_META[room].label}
                    </label>
                    <textarea
                      value={q2Inputs[room] ?? ''}
                      onChange={(e) => setQ2Inputs((prev) => ({ ...prev, [room]: e.target.value }))}
                      placeholder={ROOM_META[room].placeholder}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white
                                 text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed
                                 focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Fill in what's relevant — skip anything that doesn't apply</span>
                <button
                  onClick={submitQ2}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white
                             font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                >
                  <Send size={14} />
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Q3 input */}
          {step === 3 && (
            <div className="space-y-3">
              <textarea
                value={q3Input}
                onChange={(e) => setQ3Input(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitQ3(); }}
                placeholder="e.g. Heritage overlay on the front facade — no visible changes to the street elevation. Polished concrete floors throughout. An existing 80-year-old Jacaranda tree must be retained. We already have stone and joinery samples picked out..."
                rows={5}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white
                           text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed
                           focus:border-indigo-500 focus:outline-none resize-none transition-colors"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Skip if nothing else to add</span>
                <button
                  onClick={submitQ3}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                             bg-gradient-to-r from-indigo-600 to-violet-600 text-white
                             hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 size={14} />
                  Submit
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
