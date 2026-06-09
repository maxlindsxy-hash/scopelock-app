import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  clientName: string;
  tenantDisplayName: string;
}

export function ThankYou({ clientName, tenantDisplayName }: Props) {
  const firstName = clientName.split(' ')[0] || 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 16, stiffness: 260, delay: 0.15 }}
        className="w-20 h-20 rounded-full bg-[#f0fdf4] flex items-center justify-center mb-8"
      >
        <CheckCircle2 size={38} className="text-emerald-500" strokeWidth={1.75} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="space-y-4 max-w-md"
      >
        <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-[#9b9895]">
          Submission Complete
        </p>

        <h1 className="text-2xl font-bold text-[#1c1b1a] leading-snug">
          Thank you, {firstName}.
        </h1>

        <p className="text-[#5a5755] leading-relaxed text-sm">
          Project details captured perfectly. The team at{' '}
          <span className="font-semibold text-[#1c1b1a]">{tenantDisplayName}</span> is reviewing
          your compliance requirements and will generate your technical brief shortly.
        </p>

        <div className="pt-4 border-t border-[rgba(28,27,26,0.08)]">
          <p className="text-xs text-[#9b9895] leading-relaxed">
            You'll be contacted directly once your preliminary scope document is ready.
            No further action is needed from you at this stage.
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="mt-16 text-[10px] tracking-[0.2em] uppercase text-[#c5c2bf]"
      >
        Secured by ScopeLock
      </motion.p>
    </motion.div>
  );
}
