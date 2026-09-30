import React, { useState } from 'react';
import { Play, CheckCircle2, Copy, Check, Clock, HardDrive, Video, Music, Subtitles } from 'lucide-react';
import type { MediaMetadata } from '../types/media';

interface MediaPreviewProps {
  media: MediaMetadata;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ media }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-5xl mx-auto px-4">
      {/* Left Card: Cinematic Media Thumbnail & Details (7 cols on lg) */}
      <div className="lg:col-span-7 bg-[#0D111D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
        <div>
          {/* Thumbnail with 16:9 aspect ratio */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-4 group border border-slate-800">
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 backdrop-blur-sm transition-transform active:scale-90">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-mono font-medium border border-white/10">
              {media.duration_string}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug line-clamp-2">
            {media.title}
          </h2>

          {/* Channel info and views */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-4 flex-wrap">
            <div className="flex items-center gap-1 font-medium text-slate-200">
              <span>{media.uploader}</span>
              {media.uploader_verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
              )}
            </div>
            <span>•</span>
            <span>{media.view_count_string}</span>
            <span>•</span>
            <span>{media.upload_date}</span>
          </div>
        </div>

        {/* URL Link pill */}
        <div className="pt-3 border-t border-[#1E293B]">
          <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-900/80 border border-[#1E293B] text-xs font-mono text-slate-300">
            <span className="truncate px-2 text-slate-400">{media.url}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors flex-shrink-0"
              title="Copy URL"
              aria-label="Copy URL"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Card: Media Information Specs (5 cols on lg) */}
      <div className="lg:col-span-5 bg-[#0D111D] border border-[#1E293B] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            Media Information
          </h3>

          <div className="space-y-4">
            {/* Duration */}
            <div className="flex items-center justify-between py-2 border-b border-[#1E293B]/70">
              <div className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Duration</span>
              </div>
              <span className="text-white font-mono text-sm font-medium">
                {media.duration_string}
              </span>
            </div>

            {/* Size (approx) */}
            <div className="flex items-center justify-between py-2 border-b border-[#1E293B]/70">
              <div className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-sm">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span>Size (approx)</span>
              </div>
              <span className="text-white font-mono text-sm font-medium">
                {media.approx_size_str}
              </span>
            </div>

            {/* Available Formats */}
            {media.available_video_formats && media.available_video_formats.length > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-[#1E293B]/70">
                <div className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-sm">
                  <Video className="w-4 h-4 text-indigo-400" />
                  <span>Available Formats</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {media.available_video_formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xs font-mono font-medium border border-slate-700/60"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Formats */}
            <div className="flex items-center justify-between py-2 border-b border-[#1E293B]/70">
              <div className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-sm">
                <Music className="w-4 h-4 text-indigo-400" />
                <span>Audio Formats</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {media.available_audio_formats.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xs font-mono font-medium border border-slate-700/60"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Subtitles */}
            {media.subtitles && media.subtitles.length > 0 && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-sm">
                  <Subtitles className="w-4 h-4 text-indigo-400" />
                  <span>Subtitles</span>
                </div>
                <span className="text-slate-300 text-xs sm:text-sm text-right">
                  {media.subtitles.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Small security assurance */}
        <div className="mt-6 pt-4 border-t border-[#1E293B]/70 text-[11px] text-slate-500 text-center">
          Verified source stream • Safe & direct extraction
        </div>
      </div>
    </div>
  );
};
