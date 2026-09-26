import React, { useState, useEffect } from 'react';
import { Check, Loader2, Circle, X } from 'lucide-react';

interface AnalyzingStateProps {
  url: string;
  onCancel: () => void;
}

export const AnalyzingState: React.FC<AnalyzingStateProps> = ({ url, onCancel }) => {
  const [step, setStep] = useState<number>(1);

  // Animate stages for realistic progression feel
  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 600);
    const timer2 = setTimeout(() => setStep(3), 1300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Top summary URL bar with Cancel */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#0D111D] border border-[#1E293B] mb-12 shadow-xl">
        <div className="flex items-center gap-3 overflow-hidden text-sm text-slate-300 font-mono px-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
          <span className="truncate max-w-xs sm:max-w-md md:max-w-xl">{url}</span>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1E293B] bg-slate-800/40 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-xs text-slate-400 transition-all flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Main Analysis Visual Card */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-14 rounded-3xl bg-[#0D111D]/80 border border-[#1E293B] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow backdrop */}
        <div className="absolute w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -top-10 pointer-events-none" />

        {/* Circular Glowing Spinner */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/80" />
            </div>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight text-center">
          Analyzing your media...
        </h3>
        <p className="text-sm text-slate-400 mb-10 text-center">
          Fetching video information and available formats, please wait.
        </p>

        {/* 3-Step Checklist */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full max-w-lg justify-center text-xs sm:text-sm">
          {/* Step 1: Validating URL */}
          <div className="flex items-center gap-2.5 text-slate-300">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                step >= 1
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className={step >= 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
              Validating URL
            </span>
          </div>

          {/* Step 2: Fetching metadata */}
          <div className="flex items-center gap-2.5 text-slate-300">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                step >= 2
                  ? step === 2
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-spin'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {step > 2 ? (
                <Check className="w-3.5 h-3.5" />
              ) : step === 2 ? (
                <Loader2 className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3 h-3 text-slate-600" />
              )}
            </div>
            <span className={step >= 2 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
              Fetching metadata
            </span>
          </div>

          {/* Step 3: Checking formats */}
          <div className="flex items-center gap-2.5 text-slate-300">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                step >= 3
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-spin'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {step >= 3 ? (
                <Loader2 className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3 h-3 text-slate-600" />
              )}
            </div>
            <span className={step >= 3 ? 'text-slate-200 font-medium' : 'text-slate-500'}>
              Checking formats
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
