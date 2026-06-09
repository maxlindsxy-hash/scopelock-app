import { motion } from 'framer-motion';
import { Sparkles, ClipboardList, MessageSquare, AlertCircle, User, MapPin, DollarSign, Calendar } from 'lucide-react';
import type { ChatTranscript, RoomKey } from '../types';
import { ROOM_ORDER, ROOM_META } from './ChatWizard';

interface Props {
  transcript: ChatTranscript | null;
  refNumber: string;
  isGenerating: boolean;
  onGenerate: () => void;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <ClipboardList size={28} className="text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-700 mb-1">No client response yet</h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        Share the Client Chat link with your client. Their answers will appear here once submitted.
      </p>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
  );
}

function TranscriptField({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
        {value}
      </p>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800 leading-snug">{value}</p>
      </div>
    </div>
  );
}

export function ContractorDashboard({ transcript, refNumber, isGenerating, onGenerate }: Props) {
  const hasStarted = transcript?.clientContact?.name || transcript?.q1_spaces;
  if (!hasStarted) return <EmptyState />;

  const { clientContact, q1_spaces, budget, timeline, q2_followups, q3_additional, roomFlags, completedAt } = transcript!;

  const hasQ2 = Object.values(q2_followups).some((v) => v?.trim());
  const activeRooms = (ROOM_ORDER as RoomKey[]).filter((k) => q2_followups[k]?.trim());

  const submittedAt = completedAt
    ? new Date(completedAt).toLocaleString('en-AU', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-5 py-7 pb-28 lg:pb-12 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
              Raw Client Transcript
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {clientContact?.name ? `${clientContact.name}'s Intake` : 'Client Intake Responses'}
          </h2>
          <p className="text-sm text-slate-500">
            Exactly as typed — no AI modification. Review before generating the brief.
          </p>
        </div>

        {/* Ref + timestamp */}
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium flex-wrap">
          <span>Ref: <span className="text-slate-600 font-semibold">{refNumber}</span></span>
          {submittedAt && <span>Submitted: <span className="text-slate-600">{submittedAt}</span></span>}
          {!completedAt && (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertCircle size={12} />
              In progress
            </span>
          )}
        </div>

        {/* Transcript card */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">

          {/* Client contact */}
          {clientContact?.name && (
            <div className="px-5 py-5 space-y-4">
              <SectionHeader label="Client Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <MetaRow icon={<User size={13} className="text-slate-500" />} label="Name" value={clientContact.name} />
                <MetaRow icon={<MessageSquare size={13} className="text-slate-500" />} label="Email" value={clientContact.email} />
                {clientContact.phone && (
                  <MetaRow icon={<MessageSquare size={13} className="text-slate-500" />} label="Mobile" value={clientContact.phone} />
                )}
                <MetaRow icon={<MapPin size={13} className="text-slate-500" />} label="Site Address" value={clientContact.siteAddress} />
              </div>
            </div>
          )}

          {/* Scope */}
          {q1_spaces && (
            <div className="px-5 py-5 space-y-2">
              <SectionHeader label="Scope & Goals" />
              <p className="text-xs text-slate-400 italic mt-1 mb-2">
                "Which spaces are you looking to renovate or build, and what's the main goal?"
              </p>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                {q1_spaces}
              </p>
            </div>
          )}

          {/* Budget & timeline */}
          {(budget || timeline) && (
            <div className="px-5 py-5 space-y-3">
              <SectionHeader label="Budget & Timeline" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {budget && (
                  <div className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                    <DollarSign size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Budget</p>
                      <p className="text-sm font-semibold text-slate-800">{budget}</p>
                    </div>
                  </div>
                )}
                {timeline && (
                  <div className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                    <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Timeline</p>
                      <p className="text-sm font-semibold text-slate-800">{timeline}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zone deep-dives */}
          {hasQ2 && (
            <div className="px-5 py-5 space-y-4">
              <SectionHeader label="Room Details" />
              <p className="text-xs text-slate-400 italic mt-1">
                "Describe your vision for each space in your own words."
              </p>
              <div className="space-y-4 mt-2">
                {activeRooms.map((room) => (
                  <TranscriptField
                    key={room}
                    label={ROOM_META[room].label}
                    value={q2_followups[room] ?? ''}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Finishes & notes */}
          {q3_additional && (
            <div className="px-5 py-5 space-y-2">
              <SectionHeader label="Finishes & Additional Notes" />
              <p className="text-xs text-slate-400 italic mt-1 mb-2">
                "Any final details — material finishes, site constraints, or unique requirements?"
              </p>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                {q3_additional}
              </p>
            </div>
          )}
        </div>

        {/* Detected spaces */}
        {(ROOM_ORDER as RoomKey[]).some((k) => roomFlags[k]) && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
            <p className="text-xs font-semibold text-indigo-700 mb-2">Detected spaces</p>
            <div className="flex flex-wrap gap-1.5">
              {(ROOM_ORDER as RoomKey[])
                .filter((k) => roomFlags[k])
                .map((k) => (
                  <span key={k} className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium">
                    {ROOM_META[k].label}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Generate gate */}
        <div className="rounded-2xl bg-slate-900 px-6 py-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Ready to generate?</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Review the raw transcript above, then generate the NCC-compliant professional brief. The AI will only process this data after you click the button below.
            </p>
          </div>
          <motion.button
            onClick={onGenerate}
            disabled={isGenerating || !completedAt}
            whileTap={isGenerating ? {} : { scale: 0.97 }}
            animate={isGenerating || !completedAt ? {} : {
              boxShadow: [
                '0 6px 20px rgba(109,40,217,0.35)',
                '0 6px 32px rgba(109,40,217,0.60)',
                '0 6px 20px rgba(109,40,217,0.35)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl
                       font-bold text-sm transition-all
                       ${isGenerating || !completedAt
                         ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                         : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400'
                       }`}
          >
            <Sparkles size={17} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Generating Brief…' : !completedAt ? 'Awaiting client submission…' : '[ Generate Professional Brief ]'}
          </motion.button>
          {!completedAt && (
            <p className="text-xs text-slate-500 text-center">
              The generate button activates once the client submits their chat.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
