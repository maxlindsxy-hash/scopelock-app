import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const STEP_LABELS = ['Spaces & Goals', 'Room Details', 'Final Notes'];

interface ChatStepIndicatorProps {
  currentStep: number;
}

export function StageProgress({ currentStep }: ChatStepIndicatorProps) {
  return (
    <div className="flex items-start">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isComplete = step < currentStep;
        const isCurrent = step === currentStep;
        const isLast = index === STEP_LABELS.length - 1;

        return (
          <div key={step} className={`flex items-start ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                  transition-colors duration-300
                  ${isComplete ? 'bg-indigo-600 text-white' : ''}
                  ${isCurrent ? 'bg-white border-2 border-indigo-600 text-indigo-600 shadow-sm shadow-indigo-100' : ''}
                  ${!isComplete && !isCurrent ? 'bg-slate-100 text-slate-400' : ''}
                `}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', damping: 14, stiffness: 400 }}
                      className="flex items-center justify-center"
                    >
                      <Check size={15} strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key={`num-${step}`}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                    >
                      {step}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span
                className={`text-xs font-medium hidden sm:block whitespace-nowrap transition-colors ${
                  isCurrent ? 'text-indigo-600' : isComplete ? 'text-indigo-400' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <div className="flex-1 flex items-center pt-[18px] px-2">
                <div className="h-0.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isComplete ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
