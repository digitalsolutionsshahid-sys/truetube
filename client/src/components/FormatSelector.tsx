import React, { useState } from 'react';
import {
  Video as VideoIcon,
  Music,
  Download,
  Sliders,
  Copy,
  Check,
  Plus,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { MediaMetadata, FormatContainer } from '../types/media';

interface FormatSelectorProps {
  media: MediaMetadata;
  isDownloading?: boolean;
  onStartDownload: (options: {
    format: FormatContainer;
    qualityId: string;
    audioStreamId: string;
    audioOnly: boolean;
  }) => void;
  onOpenAdvancedOptions: () => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  media,
  isDownloading = false,
  onStartDownload,
  onOpenAdvancedOptions,
}) => {
  const [tab, setTab] = useState<'video' | 'audio'>('video');
  const [selectedFormat, setSelectedFormat] = useState<FormatContainer>('mp4');
  const [selectedQualityId, setSelectedQualityId] = useState<string>(
    media.formats.find((f) => f.is_recommended)?.id || media.formats[0]?.id || 'best_4k'
  );
  const [selectedAudioId, setSelectedAudioId] = useState<string>(
    media.audio_streams.find((a) => a.is_default)?.id || media.audio_streams[0]?.id || 'audio_aac'
  );
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string>('mp3');
  const [copiedLink, setCopiedLink] = useState(false);


  const handleCopyLink = () => {
    navigator.clipboard.writeText(media.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    const chosenFormat = media.formats.find((f) => f.id === selectedQualityId);
    const chosenAudio = media.audio_streams.find((a) => a.id === selectedAudioId);
    onStartDownload({
      format: tab === 'video' ? selectedFormat : (selectedAudioFormat as any),
      qualityId: chosenFormat?.format_id || selectedQualityId,
      audioStreamId: chosenAudio?.format_id || selectedAudioId,
      audioOnly: tab === 'audio',
    });
  };

  const formatList: { id: FormatContainer; name: string; desc: string; badge?: string }[] = [
    { id: 'mp4', name: 'MP4', desc: 'Universal Video (H.264/AAC) - Highest Compatibility', badge: 'Standard' },
  ];

  const audioFormats = [
    { id: 'mp3', name: 'MP3', desc: 'Universal audio standard (320kbps)' },
    { id: 'm4a', name: 'M4A', desc: 'Apple AAC audio stream' },
    { id: 'wav', name: 'WAV', desc: 'Lossless uncompressed audio' },
    { id: 'opus', name: 'Opus', desc: 'Modern high-efficiency codec' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 space-y-6">
      {/* Media Header Summary Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0D111D] border border-[#1E293B] shadow-xl">
        <img
          src={media.thumbnail}
          alt={media.title}
          className="w-24 h-14 sm:w-32 sm:h-18 object-cover rounded-xl border border-slate-800 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-white truncate mb-1">
            {media.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">{media.uploader}</span>
            {media.uploader_verified && (
              <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            )}
            <span>•</span>
            <span>{media.view_count_string}</span>
            <span>•</span>
            <span>{media.upload_date}</span>
          </div>
        </div>
      </div>

      {/* Main Options Container */}
      <div className="bg-[#0D111D] border border-[#1E293B] rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 w-fit mb-6">
          <button
            type="button"
            onClick={() => setTab('video')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              tab === 'video'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>Video</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('audio')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              tab === 'audio'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Audio</span>
          </button>
        </div>

        {/* Tab 1: Video Format & Quality Grid */}
        {tab === 'video' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
            {/* Format Column (4 cols) */}
            <div className="md:col-span-4 space-y-2">
              <label id="format-group-label" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                Format
              </label>
              <div role="radiogroup" aria-labelledby="format-group-label" className="space-y-2">
                {formatList.map((f) => {
                  const isSelected = selectedFormat === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedFormat(f.id)}
                      className={`w-full text-left relative flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                          : 'bg-[#131B2E]/60 border-[#1E293B] hover:border-slate-700 hover:bg-[#131B2E]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{f.name}</span>
                          {f.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{f.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality Column (5 cols) */}
            <div className="md:col-span-5 space-y-2">
              <label id="quality-group-label" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                Quality
              </label>
              <div role="radiogroup" aria-labelledby="quality-group-label" className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {media.formats.map((q) => {
                  const isSelected = selectedQualityId === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedQualityId(q.id)}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                          : 'bg-[#131B2E]/60 border-[#1E293B] hover:border-slate-700 hover:bg-[#131B2E]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-600'
                              : 'border-slate-600 bg-transparent'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white">
                              {q.label}
                            </span>
                            {q.is_recommended && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {q.resolution} • {q.fps}fps
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-medium text-slate-300">
                        {q.approx_size_str}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Column (3 cols) */}
            <div className="md:col-span-3 space-y-2">
              <label id="audio-group-label" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                Audio Track
              </label>
              <div role="radiogroup" aria-labelledby="audio-group-label" className="space-y-2">
                {media.audio_streams.map((a) => {
                  const isSelected = selectedAudioId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedAudioId(a.id)}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                          : 'bg-[#131B2E]/60 border-[#1E293B] hover:border-slate-700 hover:bg-[#131B2E]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-white block">
                          {a.format} {a.is_default && '(default)'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{a.bitrate}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Audio Only Mode */
          <div role="radiogroup" aria-label="Audio format selection" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {audioFormats.map((af) => {
              const isSelected = selectedAudioFormat === af.id;
              return (
                <button
                  key={af.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedAudioFormat(af.id)}
                  className={`w-full text-left p-4 rounded-2xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-500/20'
                      : 'bg-[#131B2E]/60 border-[#1E293B] hover:border-slate-700 hover:bg-[#131B2E]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-white">{af.name}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600'
                          : 'border-slate-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{af.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Advanced Options trigger toggle */}
        <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onOpenAdvancedOptions}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Advanced Options</span>
          </button>
          <span className="text-xs text-slate-500">Subtitles, metadata, custom naming</span>
        </div>

        {/* Action Bar (Download CTA, Copy Link, More) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full sm:flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-white font-semibold text-sm sm:text-base shadow-xl transition-all active:scale-[0.98] ${
              isDownloading
                ? 'bg-indigo-700/70 cursor-wait'
                : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30 hover:shadow-indigo-600/50 cursor-pointer'
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Starting Chrome Download...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[#1E293B] bg-slate-900/60 hover:bg-slate-800 text-xs sm:text-sm font-medium text-slate-300 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenAdvancedOptions}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border border-[#1E293B] bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
              aria-label="More options"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>More Options</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
