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
import { useRouter } from '../router/useRouter';

export const FeaturesPage: React.FC = () => {
  const { navigateTo } = useRouter();

  const featureCards = [
    {
      icon: Zap,
      title: 'High-Throughput Processing',
      description:
        'Fast media extraction and stream merging pipelines powered by optimized native yt-dlp workers.',
    },
    {
      icon: Sparkles,
      title: 'Native Resolution',
      description:
        'Download media in its authentic native resolution up to 4K Ultra HD and fluid 60fps.',
    },
    {
      icon: Layers,
      title: 'Universal MP4 Container',
      description:
        'Standard MP4 video containers with H.264 video and AAC audio for broad compatibility across devices.',
    },
    {
      icon: CheckCircle,
      title: 'Direct Browser Transfer',
      description:
        'Files save straight into your browser with automatic server storage purge upon stream completion.',
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
        'Extract clean audio tracks in MP3 (up to 320kbps), M4A (AAC), or lossless WAV.',
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-well border border-subtle text-xs font-medium text-muted">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span>Engine Capabilities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight">
          Engineered for Performance
        </h1>
        <p className="text-sm sm:text-base text-muted">
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
              className="p-5 rounded-2xl bg-surface-card border border-subtle hover:border-hover transition-colors shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-well text-accent flex items-center justify-center mb-3.5 border border-subtle">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-primary mb-1.5">{feat.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{feat.description}</p>
            </div>
          );
        })}
      </div>

      {/* How It Works (3 Steps) */}
      <div className="text-center pt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">How It Works</h2>
        <p className="text-xs sm:text-sm text-muted mb-10">Get your media in 3 simple steps</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-subtle text-left relative overflow-hidden shadow-sm">
            <div className="text-3xl font-bold text-accent font-mono mb-4">01</div>
            <h4 className="text-base font-semibold text-primary mb-1.5">Paste</h4>
            <p className="text-xs text-muted leading-relaxed">
              Copy and paste the media URL from any supported social or streaming platform into TrueTube.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-subtle text-left relative overflow-hidden shadow-sm">
            <div className="text-3xl font-bold text-accent font-mono mb-4">02</div>
            <h4 className="text-base font-semibold text-primary mb-1.5">Customize</h4>
            <p className="text-xs text-muted leading-relaxed">
              Choose your MP4 resolution or audio bitrate, with optional subtitle and metadata embedding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-subtle text-left relative overflow-hidden shadow-sm">
            <div className="text-3xl font-bold text-accent font-mono mb-4">03</div>
            <h4 className="text-base font-semibold text-primary mb-1.5">Download</h4>
            <p className="text-xs text-muted leading-relaxed">
              Stream merges automatically and downloads straight into Chrome with zero server file retention.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Capabilities (6 Cards) */}
      <div className="pt-6">
        <div className="text-center max-w-lg mx-auto mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
            Advanced Capabilities
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            Professional media extraction features built into every download.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advancedCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="p-5 rounded-2xl bg-surface-card border border-subtle hover:border-hover transition-colors shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-well border border-subtle text-accent flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-primary mb-1">{cap.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{cap.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to action card */}
      <div className="p-8 sm:p-10 rounded-2xl bg-surface-card border border-subtle text-center space-y-4 shadow-sm">
        <h3 className="text-2xl sm:text-3xl font-bold text-primary">
          Ready to download your media?
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
          Paste your media link into the downloader and save in high definition with universal codec support.
        </p>
        <div>
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <span>Go to Downloader</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
