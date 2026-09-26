import React from 'react';
import { Check, Circle, X, Zap, Gauge, Clock } from 'lucide-react';
import type { MediaMetadata, DownloadProgress } from '../types/media';

interface DownloadingStateProps {
  media: MediaMetadata;
  progress: DownloadProgress;
  onCancel: () => void;
}

export const DownloadingState: React.FC<DownloadingStateProps> = ({
  media,
  progress,
  onCancel,
}) => {
  // Determine timeline step statuses
  const percent = progress.progress_percent || 0;

  const steps = [
    {
      id: 'fetching',
      label: 'Fetching information',
      status: percent >= 5 ? 'done' : 'active',
    },
    {
      id: 'preparing',
      label: 'Preparing media',
      status: percent >= 10 ? 'done' : percent >= 5 ? 'active' : 'pending',
    },
    {
      id: 'downloading',
      label: `Downloading (${Math.round(percent)}%)`,
      status: percent < 95 ? 'active' : 'done',
    },
    {
      id: 'processing',
      label: 'Processing & Merging streams',
      status: percent >= 95 && percent < 100 ? 'active' : percent === 100 ? 'done' : 'pending',
    },
    {
      id: 'finalizing',
      label: 'Finalizing file output',
      status: percent >= 100 ? 'done' : 'pending',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-fadeIn">
      <div className="bg-[#0D111D] border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Media Summary Bar */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#131B2E]/70 border border-[#1E293B] mb-8">
          <img
            src={media.thumbnail}
            alt={media.title}
            className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-lg border border-slate-700/60 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">{media.title}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
              <span>{progress.filename || 'MP4 • 4K • 1.2 GB'}</span>
            </div>
          </div>
        </div>

        {/* Progress Numbers & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                {Math.round(percent)}%
              </span>
              <span className="text-sm sm:text-base font-semibold text-indigo-400">
                {progress.current_stage || 'Downloading...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm font-mono text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Gauge className="w-4 h-4 text-indigo-400" />
              <span>{progress.speed_str || '7.4 MB/s'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-4 h-4 text-violet-400" />
              <span>ETA: {progress.eta_str || '00:32'}</span>
            </div>
          </div>
        </div>

        {/* High-Tech Glowing Progress Bar */}
        <div className="relative w-full h-3 sm:h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-8 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 rounded-full transition-all duration-300 relative shadow-lg shadow-indigo-500/50"
            style={{ width: `${Math.max(percent, 2)}%` }}
          >
            {/* Shimmer light bar */}
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>

        {/* 5-Step Processing Timeline */}
        <div className="space-y-3.5 mb-8 bg-[#131B2E]/40 p-4 sm:p-5 rounded-2xl border border-[#1E293B]">
          {steps.map((st) => (
            <div key={st.id} className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    st.status === 'done'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : st.status === 'active'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  {st.status === 'done' ? (
                    <Check className="w-3 h-3" />
                  ) : st.status === 'active' ? (
                    <Zap className="w-3 h-3" />
                  ) : (
                    <Circle className="w-2.5 h-2.5" />
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
                className={`text-xs font-mono capitalize ${
                  st.status === 'done'
                    ? 'text-emerald-400'
                    : st.status === 'active'
                    ? 'text-indigo-400'
                    : 'text-slate-600'
                }`}
              >
                {st.status === 'done' ? 'Done' : st.status === 'active' ? 'In Progress' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        {/* Cancel Action */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-rose-950/30 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 text-xs sm:text-sm font-medium transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Cancel Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
