import React from 'react';
import { History, Download, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { RecentDownloadItem } from '../types/media';

interface RecentDownloadsProps {
  items: RecentDownloadItem[];
  onRedownload?: (item: RecentDownloadItem) => void;
  onClearHistory?: () => void;
  onViewAll?: () => void;
}

export const RecentDownloads: React.FC<RecentDownloadsProps> = ({
  items,
  onRedownload,
  onClearHistory,
  onViewAll,
}) => {
  if (!items || items.length === 0) {
    return (
      <section className="w-full max-w-5xl mx-auto px-4 py-4">
        <div className="bg-[#0D111D] border border-[#1E293B] rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-105 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 flex items-center justify-center gap-2">
            <span>No downloads yet</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Paste any media link above to start downloading. Your completed downloads will safely appear here for one-click re-downloading.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-4">
      <div className="bg-[#0D111D] border border-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Recent Downloads
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {onClearHistory && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                aria-label="Clear download history"
              >
                Clear
              </button>
            )}
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                aria-label="View all recent downloads"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List of Recent Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#131B2E]/60 border border-[#1E293B] hover:border-slate-700/80 hover:bg-[#131B2E] transition-all group"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-xl border border-slate-700/60 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5 flex-wrap">
                    <span className="text-indigo-300 uppercase font-semibold">{item.format}</span>
                    <span>•</span>
                    <span>{item.quality}</span>
                    <span>•</span>
                    <span>{item.file_size}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-slate-500">{item.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Right: Status badge & Action */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{item.status}</span>
                </span>

                <button
                  type="button"
                  onClick={() => onRedownload?.(item)}
                  className="p-2 sm:p-2.5 rounded-xl border border-slate-700/70 bg-slate-900/60 hover:bg-indigo-600 hover:border-indigo-500 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
