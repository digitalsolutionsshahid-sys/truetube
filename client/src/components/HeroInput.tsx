import React, { useState } from 'react';
import {
  Link2,
  ArrowRight,
  Clipboard,
  X,
  Video,
  Music,
  ShieldCheck,
  Loader2,
  Check,
} from 'lucide-react';

export type FormatPreset = 'mp4' | 'mp3';
export type QualityPreset = 'best' | '1080p' | '720p' | 'audio_320';

interface HeroInputProps {
  url: string;
  onChangeUrl: (val: string) => void;
  onAnalyze: () => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
  selectedFormat?: FormatPreset;
  onSelectFormat?: (format: FormatPreset) => void;
  selectedQuality?: QualityPreset;
  onSelectQuality?: (quality: QualityPreset) => void;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  url,
  onChangeUrl,
  onAnalyze,
  disabled = false,
  isAnalyzing = false,
  selectedFormat = 'mp4',
  onSelectFormat,
  selectedQuality = 'best',
  onSelectQuality,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeUrl(text.trim());
      }
    } catch {
      // Fallback or permission denied
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && url.trim() && !disabled && !isAnalyzing) {
      onAnalyze();
    }
  };

  return (
    <section className="relative pt-10 pb-12 md:pt-16 md:pb-20 overflow-hidden">
      {/* Background radial glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/15 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 leading-[1.15]">
          Download the web.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Your way.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Paste a video URL and choose the quality, format, audio and other options.
          Fast, reliable and powered by{' '}
          <span className="text-slate-300 font-mono text-xs sm:text-sm font-semibold">yt-dlp</span>.
        </p>

        {/* Main URL Input Card */}
        <div className="max-w-2xl mx-auto">
          <div
            className={`relative flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-[#0D111D] border transition-all duration-300 shadow-2xl ${
              isFocused
                ? 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/20'
                : 'border-[#1E293B] hover:border-slate-700'
            }`}
          >
            {/* Link Icon */}
            <div className="pl-2 sm:pl-3 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Link2 className="w-5 h-5 text-indigo-400/80" />
            </div>

            {/* Input field */}
            <input
              type="url"
              autoComplete="off"
              name="video_url_input"
              value={url}
              onChange={(e) => onChangeUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={disabled || isAnalyzing}
              placeholder="Paste a video URL..."
              aria-label="Video URL input"
              className="flex-1 min-w-0 bg-transparent py-2 px-2 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none disabled:opacity-50"
            />

            {/* Clear Button */}
            {url && !isAnalyzing && (
              <button
                type="button"
                onClick={() => onChangeUrl('')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* In-field Paste Action (ONLY ONE paste button on the card) */}
            {!url && !isAnalyzing && (
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-colors flex-shrink-0"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paste</span>
              </button>
            )}

            {/* Get Download Options CTA Button */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!url.trim() || disabled || isAnalyzing}
              aria-label="Get download options"
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95 flex-shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Get download options</span>
                  <span className="sm:hidden">Get options</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Upfront Format & Quality Selectors (Visible on first load before URL entry) */}
          <div className="mt-4 p-3 rounded-xl bg-[#0D111D]/90 border border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Format Selector Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider mr-1">
                Format:
              </span>
              <button
                type="button"
                onClick={() => onSelectFormat?.('mp4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedFormat === 'mp4'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video (MP4)</span>
                {selectedFormat === 'mp4' && <Check className="w-3 h-3 text-indigo-200" />}
              </button>

              <button
                type="button"
                onClick={() => onSelectFormat?.('mp3')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedFormat === 'mp3'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio (MP3)</span>
                {selectedFormat === 'mp3' && <Check className="w-3 h-3 text-indigo-200" />}
              </button>
            </div>

            {/* Quality Preset Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-0.5">
              <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider mr-1">
                Quality:
              </span>
              {selectedFormat === 'mp4' ? (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectQuality?.('best')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                      selectedQuality === 'best'
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Best (Auto)
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectQuality?.('1080p')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                      selectedQuality === '1080p'
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    1080p
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectQuality?.('720p')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                      selectedQuality === '720p'
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    720p
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectQuality?.('audio_320')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                      selectedQuality === 'audio_320'
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    320 kbps (HQ)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Privacy & Trust Microcopy */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Links are processed securely in memory and never stored.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
