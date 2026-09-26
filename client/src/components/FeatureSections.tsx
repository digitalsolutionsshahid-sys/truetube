import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  Layers,
  CheckCircle,
  Video,
  Music,
  Sliders,
  FileText,
  Image,
  Subtitles,
  Cpu,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

interface FeatureSectionsProps {
  onScrollToTop?: () => void;
}

export const FeatureSections: React.FC<FeatureSectionsProps> = ({ onScrollToTop }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const featureCards = [
    {
      icon: Zap,
      title: 'Fast',
      description: 'Blazing fast download speeds with optimized processing pipelines.',
    },
    {
      icon: Sparkles,
      title: 'High Quality',
      description: 'Get the best possible quality up to 4K, 8K, and 60fps beyond.',
    },
    {
      icon: Layers,
      title: 'Flexible Formats',
      description: 'MP4, WebM, MKV, MP3, M4A, WAV, FLAC, Opus and more.',
    },
    {
      icon: CheckCircle,
      title: 'Simple Workflow',
      description: 'Just paste the URL, customize your options and download.',
    },
  ];

  const advancedCapabilities = [
    {
      icon: Sliders,
      title: 'Format Selection',
      description: 'Choose from multiple video and audio streams with detailed resolution and bitrate breakdown.',
    },
    {
      icon: FileText,
      title: 'Metadata',
      description: 'Preserve or embed artist, album, title, chapter information and cover art into your file.',
    },
    {
      icon: Music,
      title: 'Audio Extraction',
      description: 'Extract lossless or compressed audio in high-fidelity formats like MP3, AAC, and Opus.',
    },
    {
      icon: Image,
      title: 'Thumbnail',
      description: 'Fetch and embed high-resolution video thumbnails and cover artwork directly.',
    },
    {
      icon: Subtitles,
      title: 'Subtitles',
      description: 'Download embedded subtitles or select separate SRT/VTT tracks in dozens of languages.',
    },
    {
      icon: Cpu,
      title: 'Media Processing',
      description: 'Automatic FFmpeg optimization, audio/video stream merging, and container remuxing.',
    },
  ];

  const faqs = [
    {
      q: 'What is TrueTube?',
      a: 'TrueTube is a high-performance web platform that extracts, converts, and downloads media from supported sites using yt-dlp and FFmpeg with zero ads or tracking.',
    },
    {
      q: 'Which websites are supported?',
      a: 'TrueTube supports YouTube, TikTok, Vimeo, Twitter/X, Instagram, SoundCloud, Reddit, Twitch, and over 1,000 other sites supported by the underlying yt-dlp engine.',
    },
    {
      q: 'Is this free to use?',
      a: 'Yes, TrueTube is completely open and free to use for personal media backups and downloads.',
    },
    {
      q: 'What formats are supported?',
      a: 'Video containers include MP4 (H.264/AV1), WebM (VP9), and MKV. Audio formats include MP3 (up to 320 kbps), M4A (AAC), WAV, FLAC, and Opus.',
    },
    {
      q: 'Can I download subtitles?',
      a: 'Yes! TrueTube extracts available subtitles in English, Spanish, French, and dozens of other languages as SRT or embedded tracks.',
    },
    {
      q: 'Is it safe to use?',
      a: 'All downloads are processed in an isolated sandbox with automated file expiration. We never store personal data or sell browsing records.',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-20">
      {/* 4 Feature Value Prop Cards */}
      <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Supported Formats Section */}
      <div
        id="supported"
        className="p-6 sm:p-8 rounded-3xl bg-[#0D111D] border border-[#1E293B] shadow-2xl"
      >
        <div className="text-center max-w-lg mx-auto mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Supported Formats</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Download in your preferred format, quality, and container.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Video Formats */}
          <div className="p-4 rounded-2xl bg-[#131B2E]/60 border border-[#1E293B]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              <Video className="w-4 h-4 text-indigo-400" />
              <span>Video</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['MP4', 'WebM', 'MKV', 'AVI', 'MOV'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-3 py-1.5 rounded-xl bg-[#0D111D] border border-slate-700/80 text-xs font-mono font-medium text-slate-200"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {/* Audio Formats */}
          <div className="p-4 rounded-2xl bg-[#131B2E]/60 border border-[#1E293B]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              <Music className="w-4 h-4 text-violet-400" />
              <span>Audio</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['MP3', 'M4A', 'WAV', 'AAC', 'OPUS'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-3 py-1.5 rounded-xl bg-[#0D111D] border border-slate-700/80 text-xs font-mono font-medium text-slate-200"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">How It Works</h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-10">Get your media in 3 simple steps</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-[#1E293B] text-left relative overflow-hidden shadow-xl">
            <div className="text-4xl font-extrabold text-indigo-500/20 font-mono mb-4">01</div>
            <h4 className="text-base font-bold text-white mb-1.5">Paste</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Copy and paste the media URL from any supported social or streaming platform.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111D] border border-[#1E293B] text-left relative overflow-hidden shadow-xl">
            <div className="text-4xl font-extrabold text-indigo-500/20 font-mono mb-4">02</div>
            <h4 className="text-base font-bold text-white mb-1.5">Customize</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose format, resolution, audio stream, subtitles, and post-processing preferences.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D111D] border border-[#1E293B] text-left relative overflow-hidden shadow-xl">
            <div className="text-4xl font-extrabold text-indigo-500/20 font-mono mb-4">03</div>
            <h4 className="text-base font-bold text-white mb-1.5">Download</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start the download and receive your cleanly packaged media file in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Capabilities (6 Grid) */}
      <div>
        <div className="text-center mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Advanced Capabilities</h3>
          <p className="text-xs sm:text-sm text-slate-400">More than just a standard downloader</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="p-5 rounded-2xl bg-[#0D111D] border border-[#1E293B] hover:border-slate-700 transition-all shadow-xl"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{cap.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{cap.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions & Ready to download CTA Banner */}
      <div id="faq" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Accordion (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">Everything you need to know</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-[#0D111D] border border-[#1E293B] overflow-hidden transition-all shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-[#1E293B]/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ready to Download CTA Card (5 cols) matching Stitch */}
        <div className="lg:col-span-5 p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-[#0D111D] to-purple-950/60 border border-indigo-500/30 text-left relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[320px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to download?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
              Join thousands of users who trust TrueTube for their media needs.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={onScrollToTop}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all active:scale-95"
            >
              <span>Start Downloading</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
