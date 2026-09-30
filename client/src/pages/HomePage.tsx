import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeroInput } from '../components/HeroInput';
import { AnalyzingState } from '../components/AnalyzingState';
import { MediaPreview } from '../components/MediaPreview';
import { FormatSelector } from '../components/FormatSelector';
import { AdvancedOptionsDrawer } from '../components/AdvancedOptionsDrawer';
import { RecentDownloads } from '../components/RecentDownloads';
import { ErrorCard } from '../components/ErrorCards';
import type { ErrorType } from '../components/ErrorCards';
import { ThreeDScene } from '../components/ThreeDScene';
import { useRouter } from '../router/useRouter';
import {
  Zap,
  Sparkles,
  Layers,
  CheckCircle,
  Music,
  ArrowRight,
  ChevronDown,
  Video,
  Lock,
  Globe,
  Radio,
  Tv,
} from 'lucide-react';
import type {
  MediaMetadata,
  AdvancedOptionsConfig,
  RecentDownloadItem,
  FormatContainer,
} from '../types/media';
import { MOCK_MEDIA_METADATA } from '../mockData';
import {
  analyzeMedia,
  getDirectDownloadUrl,
} from '../services/api';

const STORAGE_KEY = 'truetube_recent_downloads_v1';

interface HomePageProps {
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ addToast }) => {
  const { navigateTo } = useRouter();

  // Navigation & Flow State
  const [url, setUrl] = useState<string>('');
  const [appState, setAppState] = useState<
    | 'IDLE'
    | 'ANALYZING'
    | 'FORMAT_SELECTION'
    | 'RECENT_DOWNLOADS'
    | 'ERROR'
  >('IDLE');

  // Media State
  const [media, setMedia] = useState<MediaMetadata>(MOCK_MEDIA_METADATA);
  const [isDownloadingInChrome, setIsDownloadingInChrome] = useState(false);
  const downloadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // FAQ Accordion State for Homepage Teaser
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Advanced Options State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedOptionsConfig>({
    audio_only: false,
    subtitles_enabled: false,
    subtitle_lang: 'english',
    embed_metadata: true,
    embed_thumbnail: false,
    filename_template: '%(title)s.%(ext)s',
    quality_preference: 'best',
    container: 'mp4',
  });

  // Recent Downloads State (persisted to localStorage — defaults to genuine empty array)
  const [recentDownloads, setRecentDownloads] = useState<RecentDownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const handleRedownloadItem = useCallback(
    (item: RecentDownloadItem) => {
      if (item.file_url) {
        const a = document.createElement('a');
        a.href = item.file_url;
        a.download = item.title || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addToast('info', 'Downloading media in Chrome...', item.title);
      } else {
        addToast('warning', 'Link expired', 'Please re-analyze the video to download again.');
      }
    },
    [addToast]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentDownloads));
    } catch {
      // Ignore localStorage issues
    }
  }, [recentDownloads]);

  // Clean up any active poll interval on unmount
  useEffect(() => {
    return () => {
      if (downloadTimerRef.current) {
        clearInterval(downloadTimerRef.current);
      }
    };
  }, []);

  // Error State
  const [errorType, setErrorType] = useState<ErrorType>('INVALID_URL');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Real API Action Handlers
  const handleAnalyze = async () => {
    if (!url.trim()) {
      addToast('warning', 'Please enter a URL', 'Paste a valid media link from YouTube, Vimeo, TikTok, etc.');
      return;
    }

    setAppState('ANALYZING');

    try {
      const metadata = await analyzeMedia(url.trim());
      setMedia(metadata);
      setAppState('FORMAT_SELECTION');
      addToast('success', 'Media analyzed', metadata.title);
    } catch (err: any) {
      console.warn('Real API analyze error:', err);
      const code = err.code || 'DOWNLOAD_FAILED';
      setErrorType(code as ErrorType);
      setErrorMessage(err.message || 'Could not analyze this media URL.');
      setAppState('ERROR');
      addToast('error', 'Analysis failed', err.message);
    }
  };

  const handleStartDownload = (options: {
    format: FormatContainer;
    qualityId: string;
    audioStreamId: string;
    audioOnly: boolean;
  }) => {
    const token = 'dl_' + Date.now();
    setIsDownloadingInChrome(true);
    addToast('info', 'Fetching Video...', 'Download starting shortly.');

    try {
      const directDownloadUrl = getDirectDownloadUrl({
        url: media.url,
        title: media.title,
        format_id: options.qualityId,
        container: options.audioOnly ? options.format : 'mp4',
        audio_stream_id: options.audioStreamId,
        audio_only: options.audioOnly || advancedConfig.audio_only,
        subtitles: advancedConfig.subtitles_enabled ? advancedConfig.subtitle_lang : undefined,
        embed_metadata: advancedConfig.embed_metadata,
        embed_thumbnail: advancedConfig.embed_thumbnail,
        token: token,
      });

      if (downloadTimerRef.current) {
        clearInterval(downloadTimerRef.current);
      }

      // Trigger external browser download in Chrome
      const link = document.createElement('a');
      link.href = directDownloadUrl;
      link.setAttribute('download', '');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 500);

      const startTime = Date.now();

      // Poll document.cookie to detect exactly when Chrome starts downloading
      downloadTimerRef.current = setInterval(() => {
        const cookies = document.cookie || '';
        const successCookie = `truetube_dl_${token}=1`;
        const errorCookie = `truetube_err_${token}=1`;

        if (cookies.includes(successCookie)) {
          if (downloadTimerRef.current) {
            clearInterval(downloadTimerRef.current);
            downloadTimerRef.current = null;
          }
          document.cookie = `truetube_dl_${token}=; path=/; max-age=0`;
          setIsDownloadingInChrome(false);
          addToast('success', 'Download Started in Chrome!', 'Check your browser downloads tray.');

          // Add to recent downloads history
          const newItem: RecentDownloadItem = {
            id: `rec_${Date.now()}`,
            title: media.title,
            thumbnail: media.thumbnail,
            format: (options.audioOnly ? options.format : 'mp4').toUpperCase(),
            quality: options.audioOnly ? 'Audio' : options.qualityId.toUpperCase(),
            file_size: 'Chrome Download',
            timestamp: 'Just now',
            status: 'Completed',
            file_url: directDownloadUrl,
          };
          setRecentDownloads((prev) => [newItem, ...prev.slice(0, 19)]);
        } else if (cookies.includes(errorCookie)) {
          if (downloadTimerRef.current) {
            clearInterval(downloadTimerRef.current);
            downloadTimerRef.current = null;
          }
          document.cookie = `truetube_err_${token}=; path=/; max-age=0`;
          setIsDownloadingInChrome(false);
          addToast('error', 'Download Failed', 'Could not complete stream download.');
        } else if (Date.now() - startTime > 120000) {
          // Timeout fallback
          if (downloadTimerRef.current) {
            clearInterval(downloadTimerRef.current);
            downloadTimerRef.current = null;
          }
          setIsDownloadingInChrome(false);
        }
      }, 300);

    } catch (err: any) {
      console.warn('Direct download initiation error:', err);
      setIsDownloadingInChrome(false);
      addToast('error', 'Download Failed', err.message || 'Could not start Chrome download.');
    }
  };

  // Supported Platforms List for Chip Strip
  const supportedPlatforms = [
    { name: 'YouTube', icon: Tv, color: 'text-red-400' },
    { name: 'TikTok', icon: Music, color: 'text-cyan-400' },
    { name: 'Vimeo', icon: Video, color: 'text-sky-400' },
    { name: 'Instagram', icon: Sparkles, color: 'text-pink-400' },
    { name: 'X / Twitter', icon: Globe, color: 'text-slate-300' },
    { name: 'Facebook', icon: Globe, color: 'text-blue-400' },
    { name: 'SoundCloud', icon: Radio, color: 'text-amber-400' },
    { name: 'Reddit', icon: Globe, color: 'text-orange-400' },
    { name: 'Twitch', icon: Tv, color: 'text-purple-400' },
    { name: '1000+ More', icon: Zap, color: 'text-indigo-400' },
  ];

  // 6 Features Cards
  const featureList = [
    {
      icon: Globe,
      title: '1,000+ Sites Supported',
      desc: 'Native compatibility with YouTube, TikTok, Vimeo, Twitter, Instagram, and over a thousand streaming platforms via yt-dlp.',
    },
    {
      icon: Sparkles,
      title: 'Authentic 4K / 8K Video',
      desc: 'Grab pristine native video up to 4K Ultra HD and 60fps with zero recompression or quality loss.',
    },
    {
      icon: Music,
      title: 'High-Bitrate MP3 Audio',
      desc: 'Extract crystal-clear audio tracks up to 320kbps MP3 or lossless M4A with metadata embedded.',
    },
    {
      icon: CheckCircle,
      title: 'Zero Watermarks',
      desc: 'Pure, clean media downloads directly from the source server without artificial logos or banners.',
    },
    {
      icon: Layers,
      title: 'Subtitles & Captions',
      desc: 'Automatically package multi-language closed captions and subtitle tracks into your MP4 container.',
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      desc: 'Links are processed strictly in memory and temporary stream files are immediately purged upon delivery.',
    },
  ];

  // FAQ Teaser Questions
  const homepageFaqs = [
    {
      q: 'Is TrueTube free and ad-free?',
      a: 'Yes, TrueTube is completely free and contains zero popups, malicious redirects, or intrusive advertisements.',
    },
    {
      q: 'Why does TrueTube focus on MP4 for video?',
      a: 'MP4 (with H.264 video and AAC audio) is universally compatible across all devices, including iPhones, Android phones, Mac, Windows PCs, and video editing suites.',
    },
    {
      q: 'Does TrueTube store my downloaded files or URLs?',
      a: 'No. Links are processed in memory and temporary file chunks are automatically deleted from server storage the instant they reach your browser.',
    },
    {
      q: 'Can I extract high-quality audio only?',
      a: 'Yes! Switch to the Audio tab on the format selector to download pristine audio up to 320kbps MP3 or lossless M4A.',
    },
  ];

  return (
    <div className="space-y-10">
      {appState === 'IDLE' && (
        <>
          {/* Hero Section */}
          <div className="relative">
            <ThreeDScene />
            <HeroInput
              url={url}
              onChangeUrl={setUrl}
              onAnalyze={handleAnalyze}
              isAnalyzing={false}
            />
          </div>

          {/* Supported Platforms Strip */}
          <section className="max-w-5xl mx-auto px-4 -mt-4">
            <div className="p-4 rounded-2xl bg-[#0D111D]/80 border border-[#1E293B] shadow-xl">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                Supported Media Platforms & Streaming Services
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {supportedPlatforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 hover:border-slate-700 transition-colors"
                    >
                      <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                      <span>{p.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3-Step "How It Works" Strip directly under hero */}
          <section className="max-w-5xl mx-auto px-4 pt-2">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                Fast & Intuitive
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                How TrueTube Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0D111D] border border-[#1E293B] hover:border-indigo-500/30 transition-all shadow-xl group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-sm mb-3.5 group-hover:scale-105 transition-transform">
                  01
                </div>
                <h3 className="text-sm font-bold text-white mb-1">1. Paste Video URL</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Copy any media link from YouTube, TikTok, Vimeo, or 1000+ sites and paste it in the field above.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D111D] border border-[#1E293B] hover:border-indigo-500/30 transition-all shadow-xl group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-sm mb-3.5 group-hover:scale-105 transition-transform">
                  02
                </div>
                <h3 className="text-sm font-bold text-white mb-1">2. Choose Format & Quality</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select your desired MP4 resolution up to 4K or switch to high-bitrate MP3 audio extraction.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D111D] border border-[#1E293B] hover:border-indigo-500/30 transition-all shadow-xl group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-sm mb-3.5 group-hover:scale-105 transition-transform">
                  03
                </div>
                <h3 className="text-sm font-bold text-white mb-1">3. Direct Download</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Streams merge automatically and download straight into Chrome with zero server retention.
                </p>
              </div>
            </div>
          </section>

          {/* 6-Card Features Grid */}
          <section className="max-w-5xl mx-auto px-4 pt-2">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                Engineered for Excellence
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Why Creators Prefer TrueTube
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureList.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="p-5 rounded-2xl bg-[#0D111D] border border-[#1E293B] hover:border-indigo-500/40 hover:bg-[#131B2E] transition-all shadow-xl group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{f.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Downloads (Clean Empty State or Real History) */}
          <RecentDownloads
            items={recentDownloads}
            onClearHistory={() => {
              setRecentDownloads([]);
              addToast('info', 'History cleared');
            }}
            onRedownload={handleRedownloadItem}
            onViewAll={() => setAppState('RECENT_DOWNLOADS')}
          />

          {/* FAQ Teaser Accordion on Homepage */}
          <section className="max-w-4xl mx-auto px-4 pt-4">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                Common Questions
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-2.5">
              {homepageFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl bg-[#0D111D] border border-[#1E293B] overflow-hidden transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                          isOpen ? 'rotate-180 text-indigo-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-[#1E293B]/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => navigateTo('faq')}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-all cursor-pointer"
              >
                <span>View all frequently asked questions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </>
      )}

      {appState === 'ANALYZING' && (
        <AnalyzingState url={url} onCancel={() => setAppState('IDLE')} />
      )}

      {appState === 'FORMAT_SELECTION' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setUrl('');
                setAppState('IDLE');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
            >
              ← Paste another link
            </button>
          </div>

          <MediaPreview media={media} />

          <FormatSelector
            key={media.url}
            media={media}
            isDownloading={isDownloadingInChrome}
            onStartDownload={handleStartDownload}
            onOpenAdvancedOptions={() => setIsAdvancedOpen(true)}
          />

          <RecentDownloads
            items={recentDownloads}
            onClearHistory={() => setRecentDownloads([])}
            onRedownload={handleRedownloadItem}
            onViewAll={() => setAppState('RECENT_DOWNLOADS')}
          />
        </div>
      )}

      {appState === 'RECENT_DOWNLOADS' && (
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Full Download History</h2>
            <button
              type="button"
              onClick={() => setAppState('IDLE')}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              ← Back to Downloader
            </button>
          </div>
          <RecentDownloads
            items={recentDownloads}
            onClearHistory={() => setRecentDownloads([])}
            onRedownload={handleRedownloadItem}
            onViewAll={() => {}}
          />
        </div>
      )}

      {appState === 'ERROR' && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          <ErrorCard
            type={errorType}
            message={errorMessage}
            onAction={() => {
              setAppState('IDLE');
              handleAnalyze();
            }}
          />
        </div>
      )}

      {/* Advanced Options Modal */}
      <AdvancedOptionsDrawer
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        config={advancedConfig}
        onChangeConfig={setAdvancedConfig}
      />
    </div>
  );
};
