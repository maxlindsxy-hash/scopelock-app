import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  FileCheck2,
  Trash2,
  FolderOpen,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { Session, ProjectData } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function sessionTagline(data: ProjectData): string {
  const parts: string[] = [];
  if (data.budgetRange) parts.push(data.budgetRange);
  if (data.architecturalStyles.length > 0)
    parts.push(data.architecturalStyles.slice(0, 2).join(', '));
  if (parts.length === 0 && data.primaryMotivation.length > 0)
    parts.push(data.primaryMotivation.slice(0, 2).join(', '));
  return parts.join(' · ');
}

// ─── Session Card ─────────────────────────────────────────────────────────────

interface CardProps {
  session: Session;
  isCurrent: boolean;
  isConfirmingDelete: boolean;
  onLoad: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function SessionCard({
  session,
  isCurrent,
  isConfirmingDelete,
  onLoad,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: CardProps) {
  const isGenerated = session.status === 'generated';
  const tagline = sessionTagline(session.data);
  const hasSignature = !!session.signatureDataUrl;

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all
        ${isConfirmingDelete
          ? 'border-red-200 bg-red-50'
          : isCurrent
            ? 'border-indigo-200 bg-indigo-50/40'
            : 'border-slate-100 bg-white hover:border-slate-200'
        }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5
          ${isGenerated ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          {isGenerated
            ? <FileCheck2 size={15} className="text-emerald-600" />
            : <FileText size={15} className="text-amber-500" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-slate-800 truncate">
              {session.data.clientName || 'Untitled Project'}
            </p>
            {isCurrent && (
              <span className="text-[10px] font-bold uppercase tracking-wider
                               text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-md">
                Current
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md
              ${isGenerated
                ? 'text-emerald-700 bg-emerald-100'
                : 'text-amber-700 bg-amber-100'
              }`}>
              {isGenerated ? 'Generated' : 'Draft'}
            </span>
          </div>

          {session.data.siteAddress && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{session.data.siteAddress}</p>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-xs text-slate-400">{formatDate(session.updatedAt)}</p>
            {tagline && (
              <>
                <span className="text-slate-300 text-xs">·</span>
                <p className="text-xs text-slate-400 truncate">{tagline}</p>
              </>
            )}
          </div>

          {isGenerated && (
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-slate-400 font-mono">{session.refNumber}</span>
              {hasSignature && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  ✓ Signed
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onLoad}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                       bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800
                       transition-colors"
          >
            <RotateCcw size={11} />
            Load
          </button>
          <button
            onClick={isConfirmingDelete ? onDeleteCancel : onDeleteRequest}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
              ${isConfirmingDelete
                ? 'bg-red-100 text-red-500 hover:bg-red-200'
                : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'
              }`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Delete confirm row */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertTriangle size={12} />
                <span>Permanently delete this session?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onDeleteCancel}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onDeleteConfirm}
                  className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600
                             px-3 py-1.5 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface Props {
  sessions: Session[];
  currentSessionId: string;
  onLoad: (session: Session) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function HistoryPanel({ sessions, currentSessionId, onLoad, onDelete, onClose }: Props) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const generatedCount = sessions.filter(s => s.status === 'generated').length;
  const draftCount = sessions.filter(s => s.status === 'draft').length;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />

      {/* Slide-in from left */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed left-0 inset-y-0 z-50 w-full max-w-md bg-slate-50 shadow-2xl
                   flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-5 py-5 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Session History</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {sessions.length === 0
                  ? 'No saved sessions yet'
                  : `${generatedCount} generated · ${draftCount} draft${draftCount !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center
                         hover:bg-slate-200 active:bg-slate-300 transition-colors"
            >
              <X size={16} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex flex-col items-center justify-center h-full min-h-60 text-center gap-3 py-12"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center">
                <FolderOpen size={24} className="text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">No history yet</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[220px]">
                  Sessions appear here after you generate a brief or start a new project.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
            >
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { type: 'spring', damping: 24, stiffness: 280 } } }}
              >
              <SessionCard
                key={session.id}
                session={session}
                isCurrent={session.id === currentSessionId}
                isConfirmingDelete={confirmingDeleteId === session.id}
                onLoad={() => {
                  setConfirmingDeleteId(null);
                  onLoad(session);
                }}
                onDeleteRequest={() => setConfirmingDeleteId(session.id)}
                onDeleteConfirm={() => {
                  onDelete(session.id);
                  setConfirmingDeleteId(null);
                }}
                onDeleteCancel={() => setConfirmingDeleteId(null)}
              />
              </motion.div>
            ))}
            </motion.div>
          )}
        </div>

        {/* Footer hint */}
        {sessions.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-200 bg-white shrink-0">
            <p className="text-xs text-slate-400 text-center">
              Sessions are stored on this device · up to 40 saved
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
