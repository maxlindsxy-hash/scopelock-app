import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';
import { pdf } from '@react-pdf/renderer';
import {
  Lock,
  Eye,
  EyeOff,
  X,
  Settings,
  History,
  FilePlus2,
  AlertTriangle,
  MessageSquare,
  Inbox,
} from 'lucide-react';

import type {
  ProjectData,
  ContractorProfile,
  Session,
  ChatTranscript,
} from './types';
import {
  initialProjectData,
  initialContractorProfile,
  initialChatTranscript,
} from './types';
import { refineProjectBrief } from './utils/aiRefiner';
import type { RefinedBriefData } from './utils/aiRefiner';
import { ChatWizard } from './components/ChatWizard';
import { ContractorDashboard } from './components/ContractorDashboard';
import { ProjectBrief } from './components/ProjectBrief';
import { ContractorSetup } from './components/ContractorSetup';
import { HistoryPanel } from './components/HistoryPanel';
import { SubmissionsInbox } from './components/SubmissionsInbox';
import { BriefPDF } from './components/BriefPDF';

// ─── Storage helpers ──────────────────────────────────────────────────────────

const CONTRACTOR_KEY = 'scopelock_contractor_v1';
const SESSIONS_KEY   = 'scopelock_sessions_v1';
const ACTIVE_KEY     = 'scopelock_active_v3';  // bumped: ClientContact + budget + timeline fields
const MAX_SESSIONS   = 40;

function loadContractor(): ContractorProfile {
  try {
    const raw = localStorage.getItem(CONTRACTOR_KEY);
    if (raw) return { ...initialContractorProfile, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return initialContractorProfile;
}

function saveContractor(profile: ContractorProfile) {
  try { localStorage.setItem(CONTRACTOR_KEY, JSON.stringify(profile)); } catch { /* ignore */ }
}

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) return JSON.parse(raw) as Session[];
  } catch { /* ignore */ }
  return [];
}

function saveSessions(sessions: Session[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch { /* ignore */ }
}

type AppView = 'client' | 'contractor';

interface ActiveDraft {
  data: ProjectData;
  transcript: ChatTranscript;
  view: AppView;
  briefGenerated: boolean;
  refinedData: RefinedBriefData | null;
  refNumber: string;
  generatedDate: string;
  currentSessionId: string;
  sessionCreatedAt: string;
}

function loadActive(): ActiveDraft | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (raw) return JSON.parse(raw) as ActiveDraft;
  } catch { /* ignore */ }
  return null;
}

function saveActive(draft: ActiveDraft) {
  try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
}

function clearActive() {
  try { localStorage.removeItem(ACTIVE_KEY); } catch { /* ignore */ }
}

function upsertSession(list: Session[], session: Session): Session[] {
  const idx = list.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    const copy = [...list];
    copy[idx] = session;
    return copy;
  }
  return [session, ...list];
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeRef(): string {
  return `SL-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
}

function makeDate(): string {
  return new Date().toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function hasAnyTranscript(t: ChatTranscript): boolean {
  return !!(
    t.clientContact?.name ||
    t.q1_spaces ||
    t.q3_additional ||
    Object.values(t.q2_followups).some((v) => v?.trim())
  );
}

// ─── Response validator ───────────────────────────────────────────────────────

function isValidRefinedData(obj: unknown): obj is RefinedBriefData {
  if (!obj || typeof obj !== 'object') return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.projectNarrative === 'string' &&
    typeof r.motivationStatement === 'string' &&
    typeof r.designPhilosophy === 'string' &&
    Array.isArray(r.lifestyleScopeItems) &&
    typeof r.kitchenScope === 'string' &&
    typeof r.masterBedroomScope === 'string' &&
    typeof r.livingZoneScope === 'string' &&
    typeof r.additionalScope === 'string'
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const saved = loadActive();

  // ── Core state ───────────────────────────────────────────────────────────────
  const [transcript, setTranscript] = useState<ChatTranscript>(
    () => saved?.transcript ?? initialChatTranscript
  );
  const [data, setData] = useState<ProjectData>(() => saved?.data ?? initialProjectData);
  const [view, setView] = useState<AppView>(() => saved?.view ?? 'client');
  const [briefGenerated, setBriefGenerated] = useState<boolean>(() => saved?.briefGenerated ?? false);
  const [refinedData, setRefinedData] = useState<RefinedBriefData | null>(() => saved?.refinedData ?? null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // ── Session identity ─────────────────────────────────────────────────────────
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    () => saved?.currentSessionId ?? generateId()
  );
  const [sessionCreatedAt, setSessionCreatedAt] = useState<string>(
    () => saved?.sessionCreatedAt ?? new Date().toISOString()
  );
  const [refNumber, setRefNumber] = useState<string>(() => saved?.refNumber ?? makeRef());
  const [generatedDate, setGeneratedDate] = useState<string>(() => saved?.generatedDate ?? makeDate());

  // ── Persistent state ─────────────────────────────────────────────────────────
  const [contractor, setContractor] = useState<ContractorProfile>(loadContractor);
  const [sessions, setSessions] = useState<Session[]>(loadSessions);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);

  // ── Persist active draft ─────────────────────────────────────────────────────
  useEffect(() => {
    saveActive({
      data, transcript, view, briefGenerated, refinedData,
      refNumber, generatedDate, currentSessionId, sessionCreatedAt,
    });
  }, [data, transcript, view, briefGenerated, refinedData, refNumber, generatedDate, currentSessionId, sessionCreatedAt]);

  // ── Persist signature to history ─────────────────────────────────────────────
  useEffect(() => {
    if (!briefGenerated) return;
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, signatureDataUrl, updatedAt: new Date().toISOString() }
          : s
      );
      saveSessions(updated);
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureDataUrl]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const persistSession = (session: Session) => {
    setSessions((prev) => {
      const updated = upsertSession(prev, session);
      saveSessions(updated);
      return updated;
    });
  };

  const resetSession = () => {
    clearActive();
    setTranscript(initialChatTranscript);
    setData(initialProjectData);
    setView('client');
    setBriefGenerated(false);
    setSignatureDataUrl('');
    setShowMobilePreview(false);
    setRefinedData(null);
    setIsRefining(false);
    setCurrentSessionId(generateId());
    setSessionCreatedAt(new Date().toISOString());
    setRefNumber(makeRef());
    setGeneratedDate(makeDate());
  };

  // ── Generate brief (contractor-triggered) ────────────────────────────────────
  const handleGenerate = async () => {
    // Bridge transcript → data so ProjectBrief renders correct metadata immediately,
    // before the AI response arrives. Only overwrites fields that are blank in data.
    setData((prev) => ({
      ...prev,
      clientName:  transcript.clientContact?.name        || prev.clientName,
      siteAddress: transcript.clientContact?.siteAddress || prev.siteAddress,
      budgetRange: transcript.budget                     || prev.budgetRange,
    }));

    setIsRefining(true);
    setShowMobilePreview(true);

    try {
      let refined: RefinedBriefData;
      let usedFallback = false;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50_000);
        let response: Response;
        try {
          response = await fetch('/api/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transcript),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
        if (!response!.ok) throw new Error(`API ${response!.status}`);
        const reader = response!.body?.getReader();
        if (!reader) throw new Error('No response body');
        const dec = new TextDecoder();
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += dec.decode(value, { stream: true });
        }
        text += dec.decode();
        const jsonText = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        const raw: unknown = JSON.parse(jsonMatch ? jsonMatch[0] : jsonText);
        if (!isValidRefinedData(raw)) throw new Error('Unexpected response shape from AI');
        refined = raw;
      } catch {
        refined = refineProjectBrief(data);
        usedFallback = true;
      }

      setRefinedData(refined);
      setBriefGenerated(true);

      if (usedFallback) {
        toast.info('Brief generated using local engine', {
          description: 'AI was unavailable — built from offline pattern library.',
          duration: 6000,
        });
      }

      const session: Session = {
        id: currentSessionId,
        createdAt: sessionCreatedAt,
        updatedAt: new Date().toISOString(),
        data,
        transcript,
        refNumber,
        generatedDate,
        signatureDataUrl,
        status: 'generated',
      };
      persistSession(session);

      toast.success('Project Brief Generated!', {
        description: `Brief is ready — add signature and download PDF.`,
        duration: 5000,
      });

      const fire = (ratio: number, opts: confetti.Options) =>
        confetti({
          origin: { y: 0.65 },
          colors: ['#4f46e5', '#7c3aed', '#a78bfa', '#c4b5fd', '#e0e7ff'],
          ...opts,
          particleCount: Math.floor(220 * ratio),
        });

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2,  { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1,  { spread: 120, startVelocity: 45 });
    } finally {
      setIsRefining(false);
    }
  };

  // ── PDF download ─────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await pdf(
        <BriefPDF
          data={data}
          contractor={contractor}
          signatureDataUrl={signatureDataUrl}
          refNumber={refNumber}
          generatedDate={generatedDate}
          refinedData={refinedData}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ScopeLock-Brief-${refNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('PDF generation failed — try Print instead.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ── New project ───────────────────────────────────────────────────────────────
  const handleNewProject = () => {
    if (!hasAnyTranscript(transcript) && !briefGenerated) {
      resetSession();
      return;
    }
    setShowNewProjectConfirm(true);
  };

  const handleConfirmNewProject = (saveDraft: boolean) => {
    if (saveDraft) {
      const session: Session = {
        id: currentSessionId,
        createdAt: sessionCreatedAt,
        updatedAt: new Date().toISOString(),
        data,
        transcript,
        refNumber,
        generatedDate,
        signatureDataUrl,
        status: briefGenerated ? 'generated' : 'draft',
      };
      persistSession(session);
    }
    setShowNewProjectConfirm(false);
    resetSession();
  };

  // ── Contractor profile & history ──────────────────────────────────────────────
  const handleContractorSave = (profile: ContractorProfile) => {
    setContractor(profile);
    saveContractor(profile);
    setShowSettings(false);
  };

  const handleLoadSession = (session: Session) => {
    if (hasAnyTranscript(transcript) || briefGenerated) {
      const current: Session = {
        id: currentSessionId,
        createdAt: sessionCreatedAt,
        updatedAt: new Date().toISOString(),
        data,
        transcript,
        refNumber,
        generatedDate,
        signatureDataUrl,
        status: briefGenerated ? 'generated' : 'draft',
      };
      persistSession(current);
    }
    setTranscript(session.transcript ?? initialChatTranscript);
    setData(session.data);
    setBriefGenerated(session.status === 'generated');
    setSignatureDataUrl(session.signatureDataUrl);
    setCurrentSessionId(session.id);
    setSessionCreatedAt(session.createdAt);
    setRefNumber(session.refNumber);
    setGeneratedDate(session.generatedDate);
    setRefinedData(session.status === 'generated' ? refineProjectBrief(session.data) : null);
    setIsRefining(false);
    setView(session.status === 'generated' ? 'contractor' : 'client');
    setShowHistory(false);
    setShowMobilePreview(false);
    toast.info(`Loaded session ${session.refNumber}`);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
  };

  // ── Brief props (shared) ──────────────────────────────────────────────────────
  const briefProps = {
    data, contractor, generated: briefGenerated,
    refNumber, generatedDate, signatureDataUrl,
    onSignatureChange: setSignatureDataUrl,
    onDownloadPDF: handleDownloadPDF,
    isGeneratingPDF,
    isRefining,
    refinedData,
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fcfbf9]">
      <Toaster position="top-center" richColors expand={false} />

      {/* Contractor settings overlay */}
      {showSettings && (
        <ContractorSetup
          profile={contractor}
          onChange={setContractor}
          onClose={() => handleContractorSave(contractor)}
        />
      )}

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          sessions={sessions}
          currentSessionId={currentSessionId}
          onLoad={handleLoadSession}
          onDelete={handleDeleteSession}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Submissions inbox */}
      {showSubmissions && (
        <SubmissionsInbox
          tenantSlug={contractor.tenantSlug}
          onLoad={(incoming) => {
            setTranscript(incoming);
            setView('contractor');
            setBriefGenerated(false);
            setRefinedData(null);
            setCurrentSessionId(generateId());
            setSessionCreatedAt(new Date().toISOString());
            setRefNumber(makeRef());
            setGeneratedDate(makeDate());
          }}
          onClose={() => setShowSubmissions(false)}
          onConfigureSlug={() => { setShowSubmissions(false); setShowSettings(true); }}
        />
      )}

      {/* New project confirm dialog */}
      <AnimatePresence>
        {showNewProjectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            onClick={() => setShowNewProjectConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1c1b1a]">Start a new project?</h3>
                  {briefGenerated ? (
                    <p className="text-sm text-[#5a5755] mt-1 leading-relaxed">
                      Your generated brief is already saved in History.
                    </p>
                  ) : (
                    <p className="text-sm text-[#5a5755] mt-1 leading-relaxed">
                      Save your current progress as a draft before starting fresh?
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewProjectConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[rgba(28,27,26,0.08)] text-[#5a5755]
                             font-semibold text-sm hover:bg-[#f7f6f4] transition-colors"
                >
                  Cancel
                </button>
                {!briefGenerated && (
                  <button
                    onClick={() => handleConfirmNewProject(true)}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold
                               text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Save Draft
                  </button>
                )}
                <button
                  onClick={() => handleConfirmNewProject(false)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors
                    ${briefGenerated
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-[#f7f6f4] text-[#5a5755] hover:bg-[rgba(28,27,26,0.06)]'
                    }`}
                >
                  {briefGenerated ? 'Start New' : 'Discard'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile brief modal (contractor view only) */}
      <AnimatePresence>
        {showMobilePreview && view === 'contractor' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setShowMobilePreview(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl
                         max-h-[92vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(28,27,26,0.08)] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Lock size={13} className="text-white" />
                  </div>
                  <span className="font-semibold text-[#1c1b1a]">Brief Preview</span>
                </div>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="w-8 h-8 rounded-full bg-[#f7f6f4] flex items-center justify-center
                             active:bg-[rgba(28,27,26,0.06)] transition-colors"
                >
                  <X size={15} className="text-[#5a5755]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ProjectBrief {...briefProps} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main layout ──────────────────────────────────────────────── */}
      <div className={view === 'contractor' ? 'lg:flex lg:h-screen lg:overflow-hidden' : 'flex flex-col min-h-screen'}>

        {/* Left panel */}
        <div className={view === 'contractor' ? 'lg:w-[60%] lg:h-screen lg:overflow-y-auto' : 'flex-1 flex flex-col'}>

          {/* Header */}
          <div className="bg-white border-b border-[rgba(28,27,26,0.08)] px-4 py-3.5 sticky top-0 z-10 no-print">
            <div className="max-w-2xl mx-auto flex items-center gap-2">

              {/* Brand */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <Lock size={15} className="text-white" />
                </div>
                <span className="font-bold text-[#1c1b1a] text-base tracking-tight">ScopeLock</span>
                <span className="text-[#9b9895] hidden md:inline">·</span>
                <span className="text-xs text-[#9b9895] hidden md:inline font-medium truncate">
                  {view === 'contractor' ? 'Contractor Dashboard' : 'Client Intake'}
                </span>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-1.5 shrink-0">

                {/* View toggle — only visible to contractor (never shown in client-facing view) */}
                {view === 'contractor' && (
                  <button
                    onClick={() => setView('client')}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2 text-xs font-semibold
                               transition-all touch-manipulation border-indigo-200 bg-indigo-50
                               text-indigo-600 hover:bg-indigo-100"
                    title="Back to client chat"
                  >
                    <MessageSquare size={14} />
                    <span className="hidden sm:inline">Client Chat</span>
                  </button>
                )}

                {/* Submissions inbox */}
                <button
                  onClick={() => setShowSubmissions(true)}
                  title="Client intake submissions"
                  className="relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl
                             border-2 border-[rgba(28,27,26,0.08)] text-[#5a5755] text-xs font-semibold
                             hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                  <Inbox size={14} />
                  <span className="hidden sm:inline">Inbox</span>
                </button>

                {/* History */}
                <button
                  onClick={() => setShowHistory(true)}
                  title="Session history"
                  className="relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl
                             border-2 border-[rgba(28,27,26,0.08)] text-[#5a5755] text-xs font-semibold
                             hover:border-[rgba(28,27,26,0.14)] hover:bg-[#f7f6f4] transition-all"
                >
                  <History size={14} />
                  <span className="hidden sm:inline">History</span>
                  {sessions.length > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-100
                                     text-indigo-600 text-[10px] font-bold flex items-center justify-center">
                      {sessions.length > 99 ? '99+' : sessions.length}
                    </span>
                  )}
                </button>

                {/* New project */}
                <button
                  onClick={handleNewProject}
                  title="New project"
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl
                             bg-[#f7f6f4] text-[#5a5755] text-xs font-semibold
                             hover:bg-[rgba(28,27,26,0.06)] transition-all"
                >
                  <FilePlus2 size={14} />
                  <span className="hidden sm:inline">New</span>
                </button>

                {/* Contractor settings */}
                <button
                  onClick={() => setShowSettings(true)}
                  title="Contractor profile"
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2
                             border-[rgba(28,27,26,0.08)] text-[#5a5755] text-xs font-semibold
                             hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50
                             transition-all max-w-[120px]"
                >
                  <Settings size={14} className="shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {contractor.companyName || 'Profile'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Panel body */}
          {view === 'client' ? (
            <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
              <ChatWizard
                transcript={transcript}
                onUpdate={setTranscript}
                onComplete={(completed) => {
                  setTranscript(completed);
                  toast.success('Client intake complete!', {
                    description: 'Switch to Contractor Dashboard to review and generate the brief.',
                    duration: 6000,
                    action: {
                      label: 'Go to Dashboard',
                      onClick: () => setView('contractor'),
                    },
                  });
                }}
              />
            </div>
          ) : (
            <ContractorDashboard
              transcript={transcript}
              refNumber={refNumber}
              isGenerating={isRefining}
              onGenerate={handleGenerate}
            />
          )}
        </div>

        {/* Right panel — Brief preview (contractor view, desktop only) */}
        {view === 'contractor' && (
          <div className="hidden lg:flex lg:flex-col lg:w-[40%] lg:h-screen border-l border-[rgba(28,27,26,0.08)]">
            <ProjectBrief {...briefProps} />
          </div>
        )}
      </div>

      {/* Mobile FAB — brief preview (contractor view only) */}
      {view === 'contractor' && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 16, stiffness: 280, delay: 0.4 }}
          className="lg:hidden fixed bottom-6 right-5 z-30 no-print"
        >
          <button
            type="button"
            onClick={() => setShowMobilePreview((v) => !v)}
            className="flex items-center gap-2 pl-4 pr-5 py-3 rounded-2xl font-semibold text-sm
                       bg-indigo-600 text-white shadow-xl shadow-indigo-300/50
                       active:scale-95 transition-all duration-150"
          >
            {showMobilePreview ? <EyeOff size={16} /> : <Eye size={16} />}
            Brief Preview
            {briefGenerated && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>
        </motion.div>
      )}

    </div>
  );
}
