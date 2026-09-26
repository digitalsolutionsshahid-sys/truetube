import React, { useState, useEffect, useRef } from 'react';
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
import type {
  MediaMetadata,
  DownloadProgress,
  AdvancedOptionsConfig,
  RecentDownloadItem,
  FormatContainer,
} from './types/media';
import { MOCK_MEDIA_METADATA, MOCK_RECENT_DOWNLOADS } from './mockData';
import {
  analyzeMedia,
  createDownloadJob,
  cancelDownloadJob,
  getDownloadFileUrl,
  subscribeJobProgress,
} from './services/api';

const STORAGE_KEY = 'truetube_recent_downloads_v1';

export const App: React.FC = () => {
  // Navigation & Flow State
  const [url, setUrl] = useState<string>('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
  const [appState, setAppState] = useState<
    | 'IDLE'
    | 'ANALYZING'
    | 'MEDIA_PREVIEW'
    | 'FORMAT_SELECTION'
    | 'DOWNLOADING'
    | 'COMPLETED'
    | 'RECENT_DOWNLOADS'
    | 'ERROR'
  >('IDLE');

  // Media & Job State
  const [media, setMedia] = useState<MediaMetadata>(MOCK_MEDIA_METADATA);
  const [currentJobId, setCurrentJobId] = useState<string>('');
  const [completedQualityLabel, setCompletedQualityLabel] = useState<string>('4K (3840x2160)');
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'DOWNLOADING',
    progress_percent: 62,
    speed_str: '7.4 MB/s',
    eta_str: '00:32',
    downloaded_bytes: 760000000,
    total_bytes: 1200000000,
    current_stage: 'Downloading...',
    filename: 'Big_Buck_Bunny_60fps_4K.mp4',
    file_size_str: '1.2 GB',
  });

  const sseUnsubscribeRef = useRef<(() => void) | null>(null);

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

  // Recent Downloads State (persisted to localStorage)
  const [recentDownloads, setRecentDownloads] = useState<RecentDownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : MOCK_RECENT_DOWNLOADS;
    } catch {
      return MOCK_RECENT_DOWNLOADS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentDownloads));
    } catch {
      // Ignore localStorage issues
    }
  }, [recentDownloads]);

  // Clean up any active SSE on unmount
  useEffect(() => {
    return () => {
      if (sseUnsubscribeRef.current) {
        sseUnsubscribeRef.current();
      }
    };
  }, []);

  // Error State
  const [errorType, setErrorType] = useState<ErrorType>('INVALID_URL');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ----------------------------------------------------------------
  // Real API Action Handlers
  // ----------------------------------------------------------------

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAppState('ANALYZING');

    try {
      const metadata = await analyzeMedia(url.trim());
      setMedia(metadata);
      setAppState('FORMAT_SELECTION');
    } catch (err: any) {
      console.warn('Real API analyze error:', err);
      const code = err.code || 'DOWNLOAD_FAILED';
      setErrorType(code as ErrorType);
      setErrorMessage(err.message || 'Could not analyze this media URL.');
      setAppState('ERROR');
    }
  };

  const handleStartDownload = async (options: {
    format: FormatContainer;
    qualityId: string;
    audioStreamId: string;
    audioOnly: boolean;
  }) => {
    setAppState('DOWNLOADING');

    // Initial state setup
    setDownloadProgress({
      status: 'QUEUED',
      progress_percent: 2.0,
      speed_str: 'Starting...',
      eta_str: '--:--',
      downloaded_bytes: 0,
      total_bytes: 0,
      current_stage: 'Queuing job and connecting to media stream...',
      filename: `${media.title.replace(/[\s/]/g, '_')}.${options.format}`,
      file_size_str: 'Calculating...',
    });

    try {
      // Clean up previous listener if any
      if (sseUnsubscribeRef.current) {
        sseUnsubscribeRef.current();
      }

      // 1. Submit download job to real backend
      const jobResp = await createDownloadJob({
        url: media.url,
        format_id: options.qualityId,
        container: options.format,
        audio_stream_id: options.audioStreamId,
        audio_only: options.audioOnly || advancedConfig.audio_only,
        subtitles: advancedConfig.subtitles_enabled ? advancedConfig.subtitle_lang : undefined,
        embed_metadata: advancedConfig.embed_metadata,
        embed_thumbnail: advancedConfig.embed_thumbnail,
        filename_template: advancedConfig.filename_template,
        quality_preference: advancedConfig.quality_preference,
      });

      const jobId = jobResp.job_id || (jobResp as any).id;
      setCurrentJobId(jobId);

      // 2. Subscribe to real-time Server-Sent Events stream
      const unsubscribe = subscribeJobProgress(
        jobId,
        (progress) => {
          setDownloadProgress((prev) => ({
            ...prev,
            ...progress,
            progress_percent: progress.progress_percent ?? prev.progress_percent,
          }));
        },
        (finalProgress) => {
          // Resolve quality label
          const chosenFmt = media.formats.find(
            (f) => f.id === options.qualityId || f.format_id === options.qualityId
          );
          const qualityText = options.audioOnly
            ? 'Audio'
            : chosenFmt
            ? chosenFmt.label
            : options.qualityId.toUpperCase();

          setCompletedQualityLabel(qualityText);

          // Add to recent downloads
          const newItem: RecentDownloadItem = {
            id: `rec_${Date.now()}`,
            title: media.title,
            thumbnail: media.thumbnail,
            format: options.format.toUpperCase(),
            quality: qualityText,
            file_size: finalProgress.file_size_str || 'Downloaded',
            timestamp: 'Just now',
            status: 'Completed',
            file_url: getDownloadFileUrl(jobId),
          };

          setRecentDownloads((prev) => [newItem, ...prev.slice(0, 19)]);
          setDownloadProgress((prev) => ({
            ...prev,
            ...finalProgress,
            status: 'COMPLETED',
            progress_percent: 100,
          }));
          setAppState('COMPLETED');
        },
        (errorMsg) => {
          setErrorType('DOWNLOAD_FAILED');
          setErrorMessage(errorMsg || 'Download interrupted or failed.');
          setAppState('ERROR');
        }
      );

      sseUnsubscribeRef.current = unsubscribe;
    } catch (err: any) {
      console.warn('Real API job creation failed:', err);
      // Fallback to simulated progression if backend was temporarily unreachable
      setErrorType(err.code || 'DOWNLOAD_FAILED');
      setErrorMessage(err.message || 'Failed to submit download job to server.');
      setAppState('ERROR');
    }
  };

  const handleCancelDownload = async () => {
    if (currentJobId) {
      await cancelDownloadJob(currentJobId);
    }
    if (sseUnsubscribeRef.current) {
      sseUnsubscribeRef.current();
      sseUnsubscribeRef.current = null;
    }
    setAppState('FORMAT_SELECTION');
  };

  const handleDownloadFile = () => {
    if (currentJobId) {
      const fileUrl = getDownloadFileUrl(currentJobId);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = downloadProgress.filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('File ready for download.');
    }
  };

  const handleRedownload = (item: RecentDownloadItem) => {
    if (item.file_url) {
      const a = document.createElement('a');
      a.href = item.file_url;
      a.download = item.title || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
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
      {/* Visual State Showcase Bar for immediate UI inspection & testing */}
      <div className="bg-[#0D111D] border-b border-[#1E293B] px-4 py-2 text-xs flex items-center justify-between overflow-x-auto text-slate-400 gap-2">
        <span className="font-semibold text-slate-300 font-mono flex-shrink-0">
          State View:
        </span>
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            onClick={() => setAppState('IDLE')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'IDLE'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            0. Hero / Idle
          </button>
          <button
            onClick={() => setAppState('ANALYZING')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'ANALYZING'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            1. Analyzing
          </button>
          <button
            onClick={() => setAppState('MEDIA_PREVIEW')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'MEDIA_PREVIEW'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            2. Media Preview
          </button>
          <button
            onClick={() => setAppState('FORMAT_SELECTION')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'FORMAT_SELECTION'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            3. Format Selection
          </button>
          <button
            onClick={() => setAppState('DOWNLOADING')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'DOWNLOADING'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            4. Downloading
          </button>
          <button
            onClick={() => setAppState('COMPLETED')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'COMPLETED'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            5. Completed
          </button>
          <button
            onClick={() => setIsAdvancedOpen(true)}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-indigo-400 hover:text-white"
          >
            6. Drawer
          </button>
          <button
            onClick={() => setAppState('RECENT_DOWNLOADS')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'RECENT_DOWNLOADS'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            7. Recents
          </button>
          <button
            onClick={() => {
              setErrorType('INVALID_URL');
              setErrorMessage('The URL you entered is not valid. Please check and try again.');
              setAppState('ERROR');
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              appState === 'ERROR'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Error State
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
              onRedownload={handleRedownload}
              onViewAll={() => setAppState('RECENT_DOWNLOADS')}
            />
            <FeatureSections onScrollToTop={() => scrollToSection('home')} />
          </>
        )}

        {appState === 'ANALYZING' && (
          <AnalyzingState url={url} onCancel={() => setAppState('IDLE')} />
        )}

        {appState === 'MEDIA_PREVIEW' && (
          <div className="space-y-8 animate-fadeIn">
            <MediaPreview media={media} />
            <div className="flex justify-center">
              <button
                onClick={() => setAppState('FORMAT_SELECTION')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
              >
                Proceed to Format Selection →
              </button>
            </div>
          </div>
        )}

        {appState === 'FORMAT_SELECTION' && (
          <div className="space-y-8 animate-fadeIn">
            {/* State 2 & 3: Media Information & Format Selection */}
            <MediaPreview media={media} />

            <FormatSelector
              media={media}
              onStartDownload={handleStartDownload}
              onOpenAdvancedOptions={() => setIsAdvancedOpen(true)}
            />

            <RecentDownloads
              items={recentDownloads}
              onClearHistory={() => setRecentDownloads([])}
              onRedownload={handleRedownload}
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
            qualityLabel={completedQualityLabel}
          />
        )}

        {appState === 'RECENT_DOWNLOADS' && (
          <div className="space-y-6 py-4 max-w-5xl mx-auto px-4 animate-fadeIn">
            <button
              onClick={() => setAppState('IDLE')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ← Back to Home
            </button>
            <RecentDownloads
              items={recentDownloads}
              onClearHistory={() => setRecentDownloads([])}
              onRedownload={handleRedownload}
            />
          </div>
        )}

        {appState === 'ERROR' && (
          <div className="space-y-8 py-8">
            <ErrorCard
              type={errorType}
              message={errorMessage}
              onAction={() => setAppState('IDLE')}
            />
            {/* Showcase all 4 error cards together */}
            <div className="max-w-6xl mx-auto px-4">
              <h4 className="text-sm font-semibold text-slate-400 text-center mb-4">
                All Error States:
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
