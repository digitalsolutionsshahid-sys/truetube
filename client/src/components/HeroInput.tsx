import React, { useState } from 'react';
import {
  Link2,
  ArrowRight,
  Clipboard,
  X,
  Loader2,
} from 'lucide-react';

interface HeroInputProps {
  url: string;
  onChangeUrl: (val: string) => void;
  onAnalyze: () => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  url,
  onChangeUrl,
  onAnalyze,
  disabled = false,
  isAnalyzing = false,
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
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* In-field Paste Action */}
            {!url && !isAnalyzing && (
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-colors flex-shrink-0 cursor-pointer"
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
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95 flex-shrink-0 cursor-pointer"
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

          <div className="mt-3 flex items-center justify-center gap-2 px-2 text-xs">
            <span className="text-slate-500 text-center">
              Supports YouTube, TikTok, Vimeo, Twitter, Instagram and 1000+ more sites.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
