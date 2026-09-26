import React from 'react';
import { Check, Download, RefreshCw } from 'lucide-react';
import type { MediaMetadata, DownloadProgress } from '../types/media';

interface CompletedStateProps {
  media: MediaMetadata;
  progress: DownloadProgress;
  onDownloadFile: () => void;
  onDownloadAnother: () => void;
}

export const CompletedState: React.FC<CompletedStateProps> = ({
  media,
  progress,
  onDownloadFile,
  onDownloadAnother,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="bg-[#0D111D] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
        {/* Emerald glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Big Green Checkmark Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
          <Check className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 stroke-[2.5]" />
        </div>

        {/* Heading & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Download Complete!
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-md mx-auto">
          Your file has been downloaded successfully.
        </p>

        {/* Media Spec Summary Card */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#131B2E] border border-[#1E293B] text-left mb-8 max-w-xl mx-auto shadow-inner">
          <img
            src={media.thumbnail}
            alt={media.title}
            className="w-full sm:w-36 h-20 object-cover rounded-xl border border-slate-700/60 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold text-white truncate mb-2">
              {media.title}
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Format</span>
                <span className="text-slate-200 font-semibold uppercase">
                  {progress.filename?.split('.').pop() || 'MP4'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Quality</span>
                <span className="text-slate-200 font-semibold">4K (3840x2160)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Size</span>
                <span className="text-emerald-400 font-semibold">
                  {progress.file_size_str || '1.2 GB'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={onDownloadFile}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>Download File</span>
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={onDownloadAnother}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-[#1E293B] bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Download Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};
