import React from 'react';
import {
  Zap,
  Sparkles,
  Layers,
  CheckCircle,
  Sliders,
  FileText,
  Music,
  Image,
  Subtitles,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from '../router/RouterContext';

export const FeaturesPage: React.FC = () => {
  const { navigateTo } = useRouter();

  const featureCards = [
    {
      icon: Zap,
      title: 'Ultra Fast Processing',
      description:
        'Blazing fast media extraction and stream merging pipelines powered by optimized native yt-dlp workers.',
    },
    {
      icon: Sparkles,
      title: 'True High Quality',
      description:
        'Download media in its authentic native resolution up to 4K Ultra HD and fluid 60fps.',
    },
    {
      icon: Layers,
      title: 'Universal MP4 Standard',
      description:
        'Pure MP4 video containers with H.264 video and AAC audio for 100% universal playback on all devices.',
    },
    {
      icon: CheckCircle,
      title: 'Direct Browser Download',
      description:
        'Files save straight into your browser with automatic server storage purge to keep your privacy secure.',
    },
  ];

  const advancedCapabilities = [
    {
      icon: Sliders,
      title: 'Stream Merging',
      description:
        'Combines highest available adaptive video and high-bitrate audio streams cleanly via FFmpeg.',
    },
    {
      icon: FileText,
      title: 'Metadata Embedding',
      description:
        'Embeds artist, album, title, chapter information, and cover art directly into your final file.',
    },
    {
      icon: Music,
      title: 'High-Fidelity Audio',
      description:
        'Extract crystal clear audio tracks in MP3 (320kbps), M4A (AAC), or lossless WAV.',
    },
    {
      icon: Image,
      title: 'Thumbnail Artwork',
      description:
        'Fetches and embeds high-resolution video thumbnails directly for local library organization.',
    },
    {
      icon: Subtitles,
      title: 'Subtitles & Closed Captions',
      description:
        'Extracts embedded subtitles and closed caption tracks in English and dozens of other languages.',
    },
    {
      icon: Cpu,
      title: 'Zero Server Retention',
      description:
        'Temporary stream files are purged immediately upon client download completion, saving server resources.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-16 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Engine Capabilities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Engineered for{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Pure Performance
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          TrueTube is built on a high-throughput processing pipeline that handles high-definition streams with zero quality degradation.
        </p>
      </div>

      {/* 4 Feature Value Prop Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featureCards.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="p-5 rounded-2xl bg-[#0D111D] border border-[#1E293B] hover:border-indigo-500/40 hover:bg-[#131B2E] transition-all group shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center mb-3.5 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">{feat.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          );
        })}
      </div>

      {/* How It Works (3 Steps) */}
      <div className="text-center pt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">How It Works</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-10">Get your media in 3 simple steps</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-[#1E293B] text-left relative overflow-hidden shadow-xl">
            <div className="text-4xl font-extrabold text-indigo-500/20 font-mono mb-4">01</div>
            <h4 className="text-base font-bold text-white mb-1.5">Paste</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Copy and paste the media URL from any supported social or streaming platform into TrueTube.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111D] border border-[#1E293B] text-left relative overflow-hidden shadow-xl">
            <div className="text-4xl font-extrabold text-indigo-500/20 font-mono mb-4">02</div>
            <h4 className="text-base font-bold text-white mb-1.5">Customize</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your MP4 resolution or audio bitrate, with optional subtitle and metadata embedding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111D] border border-[#1E293B] text-left relative overflow-hidden shadow-xl">
            <div className="text-4xl font-extrabold text-indigo-500/20 font-mono mb-4">03</div>
            <h4 className="text-base font-bold text-white mb-1.5">Download</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stream merges automatically and downloads straight into Chrome with zero server file retention.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Capabilities (6 Cards) */}
      <div className="pt-6">
        <div className="text-center max-w-lg mx-auto mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Advanced Capabilities
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Professional media extraction features built into every download.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advancedCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="p-5 rounded-2xl bg-[#0D111D] border border-[#1E293B] hover:border-slate-700 transition-all shadow-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{cap.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{cap.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to action card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#0D111D] border border-indigo-500/30 text-center space-y-4 shadow-2xl">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Ready to download your media?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Head over to the home downloader, paste your media link, and save it in seconds.
        </p>
        <div>
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
          >
            <span>Go to Downloader</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
