import React from 'react';
import {
  Check,
  Circle,
  X,
  Zap,
  Gauge,
  Clock,
  CheckCircle2,
  Loader2,
  HardDrive,
} from 'lucide-react';
import type { MediaMetadata, DownloadProgress } from '../types/media';

interface DownloadPreparingModalProps {
  isOpen: boolean;
  media: MediaMetadata;
  progress: DownloadProgress;
  onCancel: () => void;
}

export const DownloadPreparingModal: React.FC<DownloadPreparingModalProps> = ({
  isOpen,
  media,
  progress,
  onCancel,
}) => {
  if (!isOpen) return null;

  const percent = progress.progress_percent || 0;
  const isCompleted = progress.status === 'COMPLETED' || percent >= 100;

  const steps = [
    {
      id: 'resolving',
      label: 'Connecting & resolving stream',
      status: percent >= 5 ? 'done' : 'active',
    },
    {
      id: 'downloading',
      label: `Downloading multi-thread fragments (${Math.round(percent)}%)`,
      status: percent >= 95 ? 'done' : percent >= 5 ? 'active' : 'pending',
    },
    {
      id: 'packaging',
      label: 'Packaging MP4 with FFmpeg',
      status: isCompleted ? 'done' : percent >= 95 ? 'active' : 'pending',
    },
    {
      id: 'chrome',
      label: 'Transferring to Chrome browser',
      status: isCompleted ? 'done' : 'pending',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preparing-download-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-[#0D111D] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow ambient accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-5 h-5 animate-pulse text-indigo-400" />
            </div>
            <div>
              <h3 id="preparing-download-title" className="text-base sm:text-lg font-bold text-white">
                {isCompleted ? 'Download Ready!' : 'Preparing High-Speed Download'}
              </h3>
              <p className="text-xs text-slate-400">
                {isCompleted
                  ? 'Your file has started saving directly in Chrome'
                  : 'Fast multi-threaded stream processing'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Summary Bar */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#131B2E]/70 border border-[#1E293B]">
          <img
            src={media.thumbnail}
            alt={media.title}
            className="w-16 h-10 object-cover rounded-lg border border-slate-700/60 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">{media.title}</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
              <span>{progress.filename || 'High Quality MP4'}</span>
              {progress.file_size_str && (
                <>
                  <span>•</span>
                  <span>{progress.file_size_str}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress & Speed Metrics */}
        {!isCompleted ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {Math.round(percent)}%
                </span>
                <span className="text-xs font-semibold text-indigo-400">
                  {progress.current_stage || 'Processing stream...'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{progress.speed_str || 'Accelerating...'}</span>
                </div>
                {progress.eta_str && progress.eta_str !== '--:--' && (
                  <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <span>{progress.eta_str}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Glowing progress bar */}
            <div
              role="progressbar"
              aria-valuenow={Math.round(percent)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5"
            >
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 rounded-full transition-all duration-200 relative shadow-md shadow-indigo-500/50"
                style={{ width: `${Math.max(percent, 3)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm text-emerald-200">
                Download Started in Chrome!
              </div>
              <div className="text-xs text-emerald-400/80">
                The file is saving directly to your computer.
              </div>
            </div>
          </div>
        )}

        {/* 4-Step Checklist */}
        <div className="space-y-2.5 bg-[#131B2E]/40 p-3.5 rounded-2xl border border-[#1E293B]">
          {steps.map((st) => (
            <div key={st.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    st.status === 'done'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : st.status === 'active'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  {st.status === 'done' ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : st.status === 'active' ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <Circle className="w-2 h-2" />
                  )}
                </div>
                <span
                  className={
                    st.status === 'done'
                      ? 'text-slate-300'
                      : st.status === 'active'
                      ? 'text-white font-semibold'
                      : 'text-slate-500'
                  }
                >
                  {st.label}
                </span>
              </div>

              <span
                className={`text-[10px] font-mono capitalize ${
                  st.status === 'done'
                    ? 'text-emerald-400'
                    : st.status === 'active'
                    ? 'text-indigo-400 font-bold'
                    : 'text-slate-600'
                }`}
              >
                {st.status === 'done' ? 'Done' : st.status === 'active' ? 'Active' : 'Queued'}
              </span>
            </div>
          ))}
        </div>

        {/* Footer & Actions */}
        <div className="pt-2 flex flex-col items-center gap-2">
          {!isCompleted ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-rose-950/30 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              Cancel Preparation
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              Done
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Zero server disk retention • Streamed directly into Chrome</span>
          </div>
        </div>
      </div>
    </div>
  );
};
