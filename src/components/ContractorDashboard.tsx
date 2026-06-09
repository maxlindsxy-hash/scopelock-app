import { motion } from 'framer-motion';
import { Sparkles, ClipboardList, MessageSquare, AlertCircle } from 'lucide-react';
import type { ChatTranscript, RoomKey } from '../types';
import { ROOM_ORDER, ROOM_META } from './ChatWizard';

interface Props {
  transcript: ChatTranscript | null;
  refNumber: string;
  sessionCreatedAt: string;
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

export function ContractorDashboard({ transcript, refNumber, sessionCreatedAt, isGenerating, onGenerate }: Props) {
  if (!transcript?.q1_spaces) return <EmptyState />;

  const hasQ2 = Object.values(transcript.q2_followups).some((v) => v?.trim());
  const activeRooms = (ROOM_ORDER as RoomKey[]).filter((k) => transcript.q2_followups[k]?.trim());
  const submittedAt = transcript.completedAt
    ? new Date(transcript.completedAt).toLocaleString('en-AU', {
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
          <h2 className="text-xl font-bold text-slate-900">Client Intake Responses</h2>
          <p className="text-sm text-slate-500">
            Exactly as typed — no AI modification. Review before generating the brief.
          </p>
        </div>

        {/* Ref + timestamp */}
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
          <span>Ref: <span className="text-slate-600 font-semibold">{refNumber}</span></span>
          {submittedAt && <span>Submitted: <span className="text-slate-600">{submittedAt}</span></span>}
          {!transcript.completedAt && (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertCircle size={12} />
              In progress
            </span>
          )}
        </div>

        {/* Transcript card */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">

          {/* Q1 */}
          <div className="px-5 py-5 border-b border-slate-100 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Q1 · Spaces & Goals
              </span>
            </div>
            <p className="text-xs text-slate-400 italic mb-2">
              "Which spaces are you looking to renovate or build, and what's the main goal?"
            </p>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              {transcript.q1_spaces}
            </p>
          </div>

          {/* Q2 — per-room follow-ups */}
          {hasQ2 && (
            <div className="px-5 py-5 border-b border-slate-100 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Q2 · Room Details
                </span>
              </div>
              <p className="text-xs text-slate-400 italic mb-3">
                "Describe your vision for each space in your own words."
              </p>
              <div className="space-y-4">
                {activeRooms.map((room) => (
                  <TranscriptField
                    key={room}
                    label={ROOM_META[room].label}
                    value={transcript.q2_followups[room] ?? ''}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Q3 */}
          {transcript.q3_additional && (
            <div className="px-5 py-5 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Q3 · Additional Notes
                </span>
              </div>
              <p className="text-xs text-slate-400 italic mb-2">
                "Any other requirements, material preferences, or unique details?"
              </p>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                {transcript.q3_additional}
              </p>
            </div>
          )}
        </div>

        {/* Room flags summary */}
        {(ROOM_ORDER as RoomKey[]).some((k) => transcript.roomFlags[k]) && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
            <p className="text-xs font-semibold text-indigo-700 mb-2">Detected spaces</p>
            <div className="flex flex-wrap gap-1.5">
              {(ROOM_ORDER as RoomKey[])
                .filter((k) => transcript.roomFlags[k])
                .map((k) => (
                  <span
                    key={k}
                    className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium"
                  >
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
            disabled={isGenerating || !transcript.completedAt}
            whileTap={isGenerating ? {} : { scale: 0.97 }}
            animate={isGenerating || !transcript.completedAt ? {} : {
              boxShadow: [
                '0 6px 20px rgba(109,40,217,0.35)',
                '0 6px 32px rgba(109,40,217,0.60)',
                '0 6px 20px rgba(109,40,217,0.35)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl
                       font-bold text-sm transition-all
                       ${isGenerating || !transcript.completedAt
                         ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                         : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400'
                       }`}
          >
            <Sparkles size={17} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating
              ? 'Generating Brief…'
              : !transcript.completedAt
                ? 'Awaiting client submission…'
                : '[ Generate Professional Brief ]'
            }
          </motion.button>
          {!transcript.completedAt && (
            <p className="text-xs text-slate-500 text-center">
              The generate button activates once the client submits their chat.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
