import { useState, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { ChatWizard } from '../../components/ChatWizard';
import { ThankYou } from './ThankYou';
import { useTenantBranding } from './useTenantBranding';
import type { ChatTranscript } from '../../types';
import { initialChatTranscript } from '../../types';

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadIntakeTranscript(tenantId: string): ChatTranscript {
  try {
    const raw = localStorage.getItem(`scopelock_intake_${tenantId}`);
    if (raw) return JSON.parse(raw) as ChatTranscript;
  } catch { /* ignore */ }
  return initialChatTranscript;
}

function saveIntakeTranscript(tenantId: string, t: ChatTranscript) {
  try {
    localStorage.setItem(`scopelock_intake_${tenantId}`, JSON.stringify(t));
  } catch { /* ignore */ }
}

function clearIntakeTranscript(tenantId: string) {
  try {
    localStorage.removeItem(`scopelock_intake_${tenantId}`);
  } catch { /* ignore */ }
}

// ─── Route component ──────────────────────────────────────────────────────────

export function TenantIntake() {
  const { tenantId, displayName, tagline } = useTenantBranding();
  const storageKey = tenantId; // passed through to helpers above

  const [transcript, setTranscript] = useState<ChatTranscript>(
    () => loadIntakeTranscript(tenantId)
  );
  const [submitted, setSubmitted] = useState(false);

  const handleUpdate = useCallback((t: ChatTranscript) => {
    setTranscript(t);
    saveIntakeTranscript(storageKey, t);
  }, [storageKey]);

  const handleComplete = useCallback(async (t: ChatTranscript) => {
    setSubmitted(true);
    clearIntakeTranscript(storageKey);

    try {
      await fetch('/api/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, transcript: t }),
      });
    } catch {
      // Submission failure is silent — client UX is unaffected.
      // TODO: queue for retry once Vercel KV is provisioned.
      toast.error('Submission could not be saved to server.', { duration: 4000 });
    }
  }, [tenantId, storageKey]);

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col">
      <Toaster position="top-center" richColors />

      {/* Header — tenant-branded, no ScopeLock chrome */}
      <header className="bg-white border-b border-[rgba(28,27,26,0.08)] px-5 py-3.5 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-2.5">
          <div className="flex items-baseline gap-2 flex-1 min-w-0">
            <span className="font-bold text-[#1c1b1a] text-base tracking-tight truncate">
              {displayName}
            </span>
            <span className="text-[#c5c2bf] hidden sm:inline text-sm">·</span>
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-[#9b9895] hidden sm:inline truncate">
              {tagline}
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
        {submitted ? (
          <div className="flex-1 flex flex-col justify-center px-5 py-12 max-w-2xl mx-auto w-full">
            <ThankYou
              clientName={transcript.clientContact?.name ?? ''}
              tenantDisplayName={displayName}
            />
          </div>
        ) : (
          <ChatWizard
            transcript={transcript}
            onUpdate={handleUpdate}
            onComplete={handleComplete}
          />
        )}
      </main>
    </div>
  );
}
