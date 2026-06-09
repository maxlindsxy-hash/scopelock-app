import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Inbox, User, MapPin, Calendar, ArrowRight, AlertCircle, Loader2, Settings } from 'lucide-react';
import type { TenantSubmission, ChatTranscript } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function clientName(transcript: ChatTranscript): string {
  return transcript.clientContact?.name || 'Unknown Client';
}

function clientAddress(transcript: ChatTranscript): string {
  return transcript.clientContact?.siteAddress || '';
}

function roomSummary(transcript: ChatTranscript): string {
  const flags = transcript.roomFlags ?? {};
  const labels: Record<string, string> = {
    kitchen: 'Kitchen', bathroom: 'Bathroom', masterBedroom: 'Master Suite',
    livingZone: 'Living', laundry: 'Laundry', study: 'Study',
    outdoor: 'Outdoor', garage: 'Garage',
  };
  const active = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => labels[k] ?? k);
  return active.length > 0 ? active.join(', ') : 'No rooms specified';
}

// ─── Submission Card ──────────────────────────────────────────────────────────

function SubmissionCard({ submission, onLoad }: { submission: TenantSubmission; onLoad: () => void }) {
  const { transcript, submittedAt } = submission;
  return (
    <div className="rounded-2xl border-2 border-[rgba(28,27,26,0.08)] bg-white p-4 hover:border-indigo-200 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#1c1b1a] truncate">
            {clientName(transcript)}
          </p>
          {clientAddress(transcript) && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-[#9b9895] shrink-0" />
              <p className="text-xs text-[#5a5755] truncate">{clientAddress(transcript)}</p>
            </div>
          )}
          <div className="flex items-center gap-1 mt-0.5">
            <Calendar size={10} className="text-[#9b9895] shrink-0" />
            <p className="text-xs text-[#9b9895]">{formatDate(submittedAt)}</p>
          </div>
          <p className="text-xs text-[#9b9895] mt-1 truncate">{roomSummary(transcript)}</p>
        </div>
        <button
          onClick={onLoad}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                     bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0"
        >
          Open <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface Props {
  tenantSlug: string;
  onLoad: (transcript: ChatTranscript) => void;
  onClose: () => void;
  onConfigureSlug: () => void;
}

type Status = 'idle' | 'loading' | 'ok' | 'no-kv' | 'error';

export function SubmissionsInbox({ tenantSlug, onLoad, onClose, onConfigureSlug }: Props) {
  const [submissions, setSubmissions] = useState<TenantSubmission[]>([]);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!tenantSlug) { setStatus('idle'); return; }
    setStatus('loading');
    fetch(`/api/tenant-submissions?tenantId=${encodeURIComponent(tenantSlug)}`)
      .then((r) => r.json())
      .then((data: { submissions?: TenantSubmission[]; error?: string; hint?: string }) => {
        if (data.error === 'Storage not provisioned') { setStatus('no-kv'); return; }
        if (data.error) { setStatus('error'); return; }
        setSubmissions((data.submissions ?? []) as TenantSubmission[]);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [tenantSlug]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed left-0 inset-y-0 z-50 w-full max-w-md bg-[#fcfbf9] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white border-b border-[rgba(28,27,26,0.08)] px-5 py-5 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-[#1c1b1a]">Intake Submissions</h2>
              <p className="text-xs text-[#9b9895] mt-0.5 font-medium tracking-[0.1em] uppercase">
                {tenantSlug ? `/${tenantSlug}/intake` : 'No portal configured'}
              </p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#f7f6f4] flex items-center justify-center hover:bg-[rgba(28,27,26,0.06)] transition-colors">
              <X size={16} className="text-[#5a5755]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">

          {/* No slug configured */}
          {!tenantSlug && (
            <div className="flex flex-col items-center justify-center h-full min-h-60 text-center gap-4 py-12">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[rgba(28,27,26,0.08)] flex items-center justify-center">
                <Inbox size={22} className="text-[#9b9895]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#1c1b1a]">No intake portal configured</p>
                <p className="text-xs text-[#9b9895] leading-relaxed max-w-[240px]">
                  Set your portal slug in Profile to start receiving client submissions.
                </p>
              </div>
              <button onClick={onConfigureSlug}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                <Settings size={13} /> Configure Portal
              </button>
            </div>
          )}

          {/* Loading */}
          {tenantSlug && status === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full min-h-60 gap-3 py-12">
              <Loader2 size={22} className="text-indigo-400 animate-spin" />
              <p className="text-xs text-[#9b9895]">Fetching submissions…</p>
            </div>
          )}

          {/* KV not provisioned */}
          {status === 'no-kv' && (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <p className="text-sm font-semibold text-amber-800">Storage not provisioned</p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Vercel KV needs to be set up once to persist submissions. Takes 2 minutes:
              </p>
              <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Open the Vercel dashboard → your project</li>
                <li>Storage tab → Create Database → KV (Redis)</li>
                <li>Name it <code className="font-mono bg-amber-100 px-1 rounded">scopelock-kv</code>, click Create & Continue</li>
                <li>Connect to your project → Accept → Done</li>
                <li>Redeploy — submissions will start persisting immediately</li>
              </ol>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center h-full min-h-60 text-center gap-3 py-12">
              <AlertCircle size={22} className="text-red-400" />
              <p className="text-sm font-semibold text-[#1c1b1a]">Failed to load submissions</p>
              <p className="text-xs text-[#9b9895]">Check your network and try again.</p>
            </div>
          )}

          {/* Empty */}
          {status === 'ok' && submissions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-60 text-center gap-3 py-12">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[rgba(28,27,26,0.08)] flex items-center justify-center">
                <Inbox size={22} className="text-[#9b9895]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#1c1b1a]">No submissions yet</p>
                <p className="text-xs text-[#9b9895] leading-relaxed max-w-[220px]">
                  Share your intake link with clients to start receiving project briefs.
                </p>
              </div>
              <p className="text-[10px] font-mono text-indigo-400 bg-indigo-50 px-3 py-1.5 rounded-lg">
                /…/{tenantSlug}/intake
              </p>
            </div>
          )}

          {/* Submissions list */}
          {status === 'ok' && submissions.length > 0 && (
            <motion.div className="space-y-3"
              initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            >
              {submissions.map((s) => (
                <motion.div key={s.sessionId}
                  variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { type: 'spring', damping: 24, stiffness: 280 } } }}
                >
                  <SubmissionCard
                    submission={s}
                    onLoad={() => { onLoad(s.transcript); onClose(); }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {status === 'ok' && submissions.length > 0 && (
          <div className="px-5 py-3 border-t border-[rgba(28,27,26,0.08)] bg-white shrink-0">
            <p className="text-xs text-[#9b9895] text-center">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} · most recent first
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
