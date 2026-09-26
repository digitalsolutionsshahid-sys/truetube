import React, { useState } from 'react';
import { Link2, ArrowRight, Clipboard, X } from 'lucide-react';

interface HeroInputProps {
  url: string;
  onChangeUrl: (val: string) => void;
  onAnalyze: () => void;
  disabled?: boolean;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  url,
  onChangeUrl,
  onAnalyze,
  disabled = false,
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
    if (e.key === 'Enter' && url.trim() && !disabled) {
      onAnalyze();
    }
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/15 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          Download the web.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent glow-text">
            Your way.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Paste a video URL and choose the quality, format, audio and other options.
          Fast, reliable and powered by <span className="text-slate-300 font-mono text-sm font-semibold">yt-dlp</span>.
        </p>

        {/* URL Input Box */}
        <div className="max-w-2xl mx-auto">
          <div
            className={`relative flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-[#0D111D] border transition-all duration-300 shadow-2xl ${
              isFocused
                ? 'border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/20'
                : 'border-[#1E293B] hover:border-slate-700'
            }`}
          >
            {/* Link Icon */}
            <div className="pl-3 text-slate-500 flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>

            {/* Input field */}
            <input
              type="url"
              value={url}
              onChange={(e) => onChangeUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Paste a video URL..."
              aria-label="Video URL input"
              className="flex-1 bg-transparent py-2 px-2 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none disabled:opacity-50"
            />

            {/* Clear Button */}
            {url && (
              <button
                type="button"
                onClick={() => onChangeUrl('')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Paste from clipboard action */}
            {!url && (
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-800/60 transition-colors"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            )}

            {/* Analyze CTA Button */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!url.trim() || disabled}
              className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-95"
            >
              <span>Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Supported platform text */}
          <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-1.5 flex-wrap">
            <span>Supports YouTube, TikTok, Vimeo, Twitter, Instagram and 1000+ more sites.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
