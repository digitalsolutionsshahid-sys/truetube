import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { AnalyzingState } from './components/AnalyzingState';
import { MediaPreview } from './components/MediaPreview';
import { FormatSelector } from './components/FormatSelector';
import { DownloadingState } from './components/DownloadingState';
import { CompletedState } from './components/CompletedState';
import { AdvancedOptionsDrawer } from './components/AdvancedOptionsDrawer';
import { RecentDownloads } from './components/RecentDownloads';
import { ErrorCard, ErrorStatesGallery } from './components/ErrorCards';
import type { ErrorType } from './components/ErrorCards';
import { FeatureSections } from './components/FeatureSections';
import { Footer } from './components/Footer';
import { ArrowRight } from 'lucide-react';
import type {
  MediaMetadata,
  DownloadProgress,
  AdvancedOptionsConfig,
  RecentDownloadItem,
  FormatContainer,
} from './types/media';
import { MOCK_MEDIA_METADATA, MOCK_RECENT_DOWNLOADS } from './mockData';

export const App: React.FC = () => {
  // Navigation & Flow State
  const [url, setUrl] = useState<string>('https://www.youtube.com/watch?v=32w4nwff9gk-O');
  const [appState, setAppState] = useState<
    'IDLE' | 'ANALYZING' | 'MEDIA_PREVIEW' | 'FORMAT_SELECTION' | 'DOWNLOADING' | 'COMPLETED' | 'RECENT_DOWNLOADS' | 'ERROR'
  >('IDLE');

  // Media & Job State
  const [media, setMedia] = useState<MediaMetadata>(MOCK_MEDIA_METADATA);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'DOWNLOADING',
    progress_percent: 62,
    speed_str: '7.4 MB/s',
    eta_str: '00:32',
    downloaded_bytes: 760000000,
    total_bytes: 1200000000,
    current_stage: 'Downloading...',
    filename: 'The_Most_Beautiful_Places_on_Earth_4K.mp4',
    file_size_str: '1.2 GB',
  });

  // Advanced Options State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedOptionsConfig>({
    audio_only: false,
    subtitle_lang: 'english',
    embed_metadata: true,
    embed_thumbnail: true,
    filename_template: '%(title)s.%(ext)s',
    quality_preference: 'best',
    container: 'mp4',
  });

  // Recent Downloads State
  const [recentDownloads, setRecentDownloads] = useState<RecentDownloadItem[]>(MOCK_RECENT_DOWNLOADS);

  // Error State
  const [errorType, setErrorType] = useState<ErrorType>('INVALID_URL');
  const [errorMessage] = useState<string>('');

  // Handlers for state progression
  const handleAnalyze = () => {
    if (!url.trim()) return;
    setAppState('ANALYZING');

    // Simulate analysis completion for Task 1 visual flow
    setTimeout(() => {
      setMedia(MOCK_MEDIA_METADATA);
      setAppState('FORMAT_SELECTION');
    }, 2000);
  };

  const handleStartDownload = (_options: {
    format: FormatContainer;
    qualityId: string;
    audioStreamId: string;
    audioOnly: boolean;
  }) => {
    setAppState('DOWNLOADING');
    setDownloadProgress({
      status: 'DOWNLOADING',
      progress_percent: 25,
      speed_str: '8.2 MB/s',
      eta_str: '00:45',
      downloaded_bytes: 300000000,
      total_bytes: 1200000000,
      current_stage: 'Downloading stream chunks...',
      filename: `${media.title.replace(/[\s/]/g, '_')}.mp4`,
      file_size_str: '1.2 GB',
    });

    // Simulate progress animation for Task 1 demonstration
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev.progress_percent >= 98) {
          clearInterval(interval);
          setAppState('COMPLETED');
          return {
            ...prev,
            status: 'COMPLETED',
            progress_percent: 100,
            current_stage: 'Completed',
          };
        }
        const nextPct = prev.progress_percent + 18;
        return {
          ...prev,
          progress_percent: Math.min(nextPct, 100),
          speed_str: `${(7.0 + Math.random()).toFixed(1)} MB/s`,
          eta_str: nextPct > 80 ? '00:08' : '00:24',
        };
      });
    }, 1200);
  };

  const handleCancelDownload = () => {
    setAppState('FORMAT_SELECTION');
  };

  const handleDownloadFile = () => {
    alert('Simulated file download for Task 1: "The_Most_Beautiful_Places_on_Earth_4K.mp4"');
  };

  const handleDownloadAnother = () => {
    setAppState('IDLE');
  };

  const handleResetToHome = () => {
    setAppState('IDLE');
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Visual State Showcase Bar for immediate UI inspection */}
      <div className="bg-[#0D111D] border-b border-[#1E293B] px-4 py-2 text-xs flex items-center justify-between overflow-x-auto text-slate-400 gap-2">
        <span className="font-semibold text-slate-300 font-mono flex-shrink-0">
          UI State Showcase:
        </span>
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            type="button"
            onClick={() => setAppState('IDLE')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'IDLE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            0. Hero / Idle
          </button>
          <button
            type="button"
            onClick={() => setAppState('ANALYZING')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'ANALYZING'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            1. Analyzing
          </button>
          <button
            type="button"
            onClick={() => setAppState('MEDIA_PREVIEW')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'MEDIA_PREVIEW'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            2. Media Info
          </button>
          <button
            type="button"
            onClick={() => setAppState('FORMAT_SELECTION')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'FORMAT_SELECTION'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            3. Formats
          </button>
          <button
            type="button"
            onClick={() => setAppState('DOWNLOADING')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'DOWNLOADING'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            4. Downloading
          </button>
          <button
            type="button"
            onClick={() => setAppState('COMPLETED')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'COMPLETED'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            5. Completed
          </button>
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(true)}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-indigo-400 hover:text-white hover:bg-slate-700"
          >
            6. Drawer
          </button>
          <button
            type="button"
            onClick={() => setAppState('RECENT_DOWNLOADS')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'RECENT_DOWNLOADS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            7. Recent
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorType('INVALID_URL');
              setAppState('ERROR');
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'ERROR'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Error States
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar onNavClick={scrollToSection} onReset={handleResetToHome} />

      {/* Body Content by State */}
      <main className="flex-1 py-4 sm:py-8 space-y-12">
        {appState === 'IDLE' && (
          <>
            <HeroInput
              url={url}
              onChangeUrl={setUrl}
              onAnalyze={handleAnalyze}
            />
            <RecentDownloads
              items={recentDownloads}
              onClearHistory={() => setRecentDownloads([])}
              onViewAll={() => setAppState('RECENT_DOWNLOADS')}
            />
            <FeatureSections onScrollToTop={() => scrollToSection('home')} />
          </>
        )}

        {appState === 'ANALYZING' && (
          <AnalyzingState url={url} onCancel={() => setAppState('IDLE')} />
        )}

        {appState === 'MEDIA_PREVIEW' && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto px-4">
            {/* State 2: Media Information */}
            <MediaPreview media={media} />

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0D111D] border border-[#1E293B]">
              <span className="text-xs sm:text-sm text-slate-400">
                Ready to configure format and start download?
              </span>
              <button
                type="button"
                onClick={() => setAppState('FORMAT_SELECTION')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
              >
                <span>Format Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <RecentDownloads
              items={recentDownloads}
              onClearHistory={() => setRecentDownloads([])}
              onViewAll={() => setAppState('RECENT_DOWNLOADS')}
            />
          </div>
        )}

        {appState === 'FORMAT_SELECTION' && (
          <div className="space-y-8 animate-fadeIn">
            {/* State 3: Format Selection */}
            <FormatSelector
              media={media}
              onStartDownload={handleStartDownload}
              onOpenAdvancedOptions={() => setIsAdvancedOpen(true)}
            />

            <RecentDownloads
              items={recentDownloads}
              onClearHistory={() => setRecentDownloads([])}
              onViewAll={() => setAppState('RECENT_DOWNLOADS')}
            />
          </div>
        )}

        {appState === 'DOWNLOADING' && (
          <DownloadingState
            media={media}
            progress={downloadProgress}
            onCancel={handleCancelDownload}
          />
        )}

        {appState === 'COMPLETED' && (
          <CompletedState
            media={media}
            progress={downloadProgress}
            onDownloadFile={handleDownloadFile}
            onDownloadAnother={handleDownloadAnother}
          />
        )}

        {appState === 'RECENT_DOWNLOADS' && (
          <div className="space-y-6 animate-fadeIn">
            <RecentDownloads
              items={recentDownloads}
              onClearHistory={() => setRecentDownloads([])}
            />
            <div className="text-center">
              <button
                type="button"
                onClick={() => setAppState('IDLE')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium py-2 px-4 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        )}

        {appState === 'ERROR' && (
          <div className="space-y-8 py-8">
            {/* Quick Switcher for individual error types */}
            <div className="flex items-center justify-center gap-2 flex-wrap px-4">
              <span className="text-xs text-slate-400 font-medium mr-1">Preview Type:</span>
              {(['INVALID_URL', 'UNSUPPORTED_SOURCE', 'NETWORK_ERROR', 'DOWNLOAD_FAILED'] as ErrorType[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setErrorType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                      errorType === t
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>

            <ErrorCard
              type={errorType}
              message={errorMessage}
              onAction={() => setAppState('IDLE')}
            />

            {/* Showcase all 4 error cards together */}
            <div className="max-w-6xl mx-auto px-4 pt-4 border-t border-[#1E293B]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-4">
                All 4 Error States Gallery:
              </h4>
              <ErrorStatesGallery onRetry={() => setAppState('IDLE')} />
            </div>
          </div>
        )}
      </main>

      {/* State 6: Advanced Options Drawer */}
      <AdvancedOptionsDrawer
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        config={advancedConfig}
        onChangeConfig={setAdvancedConfig}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
