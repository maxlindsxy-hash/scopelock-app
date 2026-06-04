import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';
import { pdf } from '@react-pdf/renderer';
import {
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Settings,
  History,
  FilePlus2,
  AlertTriangle,
} from 'lucide-react';

import type { ProjectData, ContractorProfile, Session } from './types';
import { initialProjectData, initialContractorProfile } from './types';
import { refineProjectBrief } from './utils/aiRefiner';
import type { RefinedBriefData } from './utils/aiRefiner';
import { StageProgress } from './components/StageProgress';
import { Stage1 } from './components/stages/Stage1';
import { Stage2 } from './components/stages/Stage2';
import { Stage3 } from './components/stages/Stage3';
import { Stage4 } from './components/stages/Stage4';
import { ProjectBrief } from './components/ProjectBrief';
import { ContractorSetup } from './components/ContractorSetup';
import { HistoryPanel } from './components/HistoryPanel';
import { BriefPDF } from './components/BriefPDF';

// ─── Stage metadata ───────────────────────────────────────────────────────────

const STAGE_TITLES = [
  'Project Identity & Overview',
  'Design & Aesthetic',
  'Room Requirements',
  'Final Notes',
];

const STAGE_SUBTITLES = [
  "Client info, site details, and what's driving this project",
  'Visual direction, architectural style, and lifestyle priorities',
  'Functional intent and design requirements for key spaces',
  'Any additional requirements, constraints, or custom notes',
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

const CONTRACTOR_KEY = 'scopelock_contractor_v1';
const SESSIONS_KEY = 'scopelock_sessions_v1';
const MAX_SESSIONS = 40;

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

function hasAnyData(d: ProjectData): boolean {
  return !!(
    d.clientName || d.siteAddress || d.budgetRange ||
    d.primaryMotivation.length || d.architecturalStyles.length ||
    d.lifestyleGoals.length || d.kitchenNotes ||
    d.masterBedroomNotes || d.livingZoneNotes || d.additionalNotes
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

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [data, setData] = useState<ProjectData>(initialProjectData);
  const [stage, setStage] = useState(1);
  const [direction, setDirection] = useState(1);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinedData, setRefinedData] = useState<RefinedBriefData | null>(null);

  // ── Session identity ─────────────────────────────────────────────────────────
  const [currentSessionId, setCurrentSessionId] = useState(generateId);
  const [sessionCreatedAt, setSessionCreatedAt] = useState(() => new Date().toISOString());
  const [refNumber, setRefNumber] = useState(makeRef);
  const [generatedDate, setGeneratedDate] = useState(makeDate);

  // ── Persistent state ─────────────────────────────────────────────────────────
  const [contractor, setContractor] = useState<ContractorProfile>(loadContractor);
  const [sessions, setSessions] = useState<Session[]>(loadSessions);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);

  // ── Persist signature changes back to the in-history session ──────────────
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
  const updateData = (updates: Partial<ProjectData>) =>
    setData((prev) => ({ ...prev, ...updates }));

  const goToStage = (newStage: number) => {
    if (newStage < 1 || newStage > 4) return;
    setDirection(newStage > stage ? 1 : -1);
    setStage(newStage);
  };

  const persistSession = (session: Session) => {
    setSessions((prev) => {
      const updated = upsertSession(prev, session);
      saveSessions(updated);
      return updated;
    });
  };

  const resetSession = () => {
    setData(initialProjectData);
    setStage(1);
    setDirection(1);
    setBriefGenerated(false);
    setSignatureDataUrl('');
    setShowMobilePreview(false);
    setRefinedData(null);
    setIsRefining(false);
    const newId = generateId();
    const newRef = makeRef();
    const newDate = makeDate();
    setCurrentSessionId(newId);
    setSessionCreatedAt(new Date().toISOString());
    setRefNumber(newRef);
    setGeneratedDate(newDate);
  };

  // ── Generate ─────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsRefining(true);
    setShowMobilePreview(true);

    try {
      let refined: RefinedBriefData;
      let usedFallback = false;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20_000);
        let response: Response;
        try {
          response = await fetch('/api/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
        if (!response!.ok) throw new Error(`API ${response!.status}`);
        const raw: unknown = await response!.json();
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
          description: 'AI was unavailable — your brief was built from our offline pattern library.',
          duration: 6000,
        });
      }

      // Save to history
      const session: Session = {
        id: currentSessionId,
        createdAt: sessionCreatedAt,
        updatedAt: new Date().toISOString(),
        data,
        refNumber,
        generatedDate,
        signatureDataUrl,
        status: 'generated',
      };
      persistSession(session);

      toast.success('Project Brief Generated!', {
        description: `${data.clientName ? `${data.clientName}'s brief` : 'Brief'} is ready — add signature and download PDF.`,
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
      a.download = `ScopeLock-Brief-${(data.clientName || 'Project').replace(/\s+/g, '-')}-${refNumber}.pdf`;
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
    // If the form is blank and no brief was generated, just reset with no prompt
    if (!hasAnyData(data) && !briefGenerated) {
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

  // ── History ───────────────────────────────────────────────────────────────────
  const handleContractorSave = (profile: ContractorProfile) => {
    setContractor(profile);
    saveContractor(profile);
    setShowSettings(false);
  };

  const handleLoadSession = (session: Session) => {
    // Quietly save current session first if it has content
    if (hasAnyData(data) || briefGenerated) {
      const current: Session = {
        id: currentSessionId,
        createdAt: sessionCreatedAt,
        updatedAt: new Date().toISOString(),
        data,
        refNumber,
        generatedDate,
        signatureDataUrl,
        status: briefGenerated ? 'generated' : 'draft',
      };
      persistSession(current);
    }
    // Load
    setData(session.data);
    setBriefGenerated(session.status === 'generated');
    setSignatureDataUrl(session.signatureDataUrl);
    setCurrentSessionId(session.id);
    setSessionCreatedAt(session.createdAt);
    setRefNumber(session.refNumber);
    setGeneratedDate(session.generatedDate);
    setRefinedData(session.status === 'generated' ? refineProjectBrief(session.data) : null);
    setIsRefining(false);
    setStage(1);
    setDirection(1);
    setShowHistory(false);
    setShowMobilePreview(false);
    toast.info(`Loaded: ${session.data.clientName || 'Untitled Project'}`);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const stageComponents = [
    <Stage1 key="s1" data={data} onChange={updateData} direction={direction} />,
    <Stage2 key="s2" data={data} onChange={updateData} direction={direction} />,
    <Stage3 key="s3" data={data} onChange={updateData} direction={direction} />,
    <Stage4 key="s4" data={data} onChange={updateData} direction={direction} />,
  ];

  const briefProps = {
    data, contractor, generated: briefGenerated,
    refNumber, generatedDate, signatureDataUrl,
    onSignatureChange: setSignatureDataUrl,
    onDownloadPDF: handleDownloadPDF,
    isGeneratingPDF,
    isRefining,
    refinedData,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors expand={false} />

      {/* ── Contractor Settings ──────────────────────────────────────── */}
      {showSettings && (
        <ContractorSetup
          profile={contractor}
          onChange={setContractor}
          onClose={() => handleContractorSave(contractor)}
        />
      )}

      {/* ── History Panel ────────────────────────────────────────────── */}
      {showHistory && (
        <HistoryPanel
          sessions={sessions}
          currentSessionId={currentSessionId}
          onLoad={handleLoadSession}
          onDelete={handleDeleteSession}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* ── New Project Confirm Dialog ───────────────────────────────── */}
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
                  <h3 className="font-bold text-slate-900">Start a new project?</h3>
                  {briefGenerated ? (
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Your generated brief for{' '}
                      <span className="font-medium text-slate-700">
                        {data.clientName || 'this project'}
                      </span>{' '}
                      is already saved in History.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {data.clientName
                        ? <>Save <span className="font-medium text-slate-700">{data.clientName}'s</span> details as a draft before starting fresh?</>
                        : 'Save your current progress as a draft before starting fresh?'
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewProjectConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600
                             font-semibold text-sm hover:bg-slate-50 transition-colors"
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
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {briefGenerated ? 'Start New' : 'Discard'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Brief Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showMobilePreview && (
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
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Lock size={13} className="text-white" />
                  </div>
                  <span className="font-semibold text-slate-800">Brief Preview</span>
                </div>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center
                             active:bg-slate-200 transition-colors"
                >
                  <X size={15} className="text-slate-500" />
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
      <div className="lg:flex lg:h-screen lg:overflow-hidden">

        {/* Left panel — Wizard */}
        <div className="lg:w-[60%] lg:h-screen lg:overflow-y-auto">

          {/* App header */}
          <div className="bg-white border-b border-slate-100 px-4 py-3.5 sticky top-0 z-10 no-print">
            <div className="max-w-2xl mx-auto flex items-center gap-2">

              {/* Brand */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                  <Lock size={15} className="text-white" />
                </div>
                <span className="font-bold text-slate-900 text-base tracking-tight">ScopeLock</span>
                <span className="text-slate-300 hidden md:inline">·</span>
                <span className="text-xs text-slate-400 hidden md:inline font-medium truncate">
                  Project Brief Generator
                </span>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-1.5 shrink-0">

                {/* History */}
                <button
                  onClick={() => setShowHistory(true)}
                  title="Session history"
                  className="relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl
                             border-2 border-slate-200 text-slate-500 text-xs font-semibold
                             hover:border-slate-300 hover:bg-slate-50 transition-all"
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

                {/* New Project */}
                <button
                  onClick={handleNewProject}
                  title="New project"
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl
                             bg-slate-100 text-slate-600 text-xs font-semibold
                             hover:bg-slate-200 transition-all"
                >
                  <FilePlus2 size={14} />
                  <span className="hidden sm:inline">New</span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => setShowSettings(true)}
                  title="Contractor profile"
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2
                             border-slate-200 text-slate-500 text-xs font-semibold
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

          {/* Wizard body */}
          <div className="max-w-2xl mx-auto px-5 py-7 pb-28 lg:pb-12">

            <div className="mb-8 no-print">
              <StageProgress currentStage={stage} onStageClick={goToStage} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="mb-6 no-print"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                  Stage {stage} of 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {STAGE_TITLES[stage - 1]}
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {STAGE_SUBTITLES[stage - 1]}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                {stageComponents[stage - 1]}
              </AnimatePresence>
            </div>

            {/* Nav buttons */}
            <div className="mt-8 flex items-center justify-between no-print">
              <button
                type="button"
                onClick={() => goToStage(stage - 1)}
                disabled={stage === 1}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
                            transition-all duration-150 touch-manipulation min-h-[48px]
                            ${stage === 1
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100'
                            }`}
              >
                <ChevronLeft size={18} />
                Back
              </button>

              {stage < 4 ? (
                <button
                  type="button"
                  onClick={() => goToStage(stage + 1)}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm
                             bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800
                             transition-all duration-150 touch-manipulation min-h-[48px]
                             shadow-md shadow-indigo-100"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isRefining}
                  animate={isRefining ? {} : {
                    boxShadow: [
                      '0 8px 20px rgba(79,70,229,0.25)',
                      '0 8px 32px rgba(109,40,217,0.50)',
                      '0 8px 20px rgba(79,70,229,0.25)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                  whileTap={isRefining ? {} : { scale: 0.96 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
                             transition-colors touch-manipulation min-h-[48px]
                             ${isRefining
                               ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                               : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500'
                             }`}
                >
                  <Sparkles size={17} className={isRefining ? 'animate-spin' : ''} />
                  {isRefining ? 'Analysing…' : 'Generate Project Brief'}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Right panel — Brief Preview (desktop only) */}
        <div className="hidden lg:flex lg:flex-col lg:w-[40%] lg:h-screen border-l border-slate-200">
          <ProjectBrief {...briefProps} />
        </div>
      </div>

      {/* ── Mobile FAB ── */}
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
    </div>
  );
}
