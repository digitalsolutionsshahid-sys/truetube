import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeroInput } from '../components/HeroInput';
import { AnalyzingState } from '../components/AnalyzingState';
import { MediaPreview } from '../components/MediaPreview';
import { FormatSelector } from '../components/FormatSelector';
import { AdvancedOptionsDrawer } from '../components/AdvancedOptionsDrawer';
import { DownloadPreparingModal } from '../components/DownloadPreparingModal';
import { RecentDownloads } from '../components/RecentDownloads';
import { ErrorCard } from '../components/ErrorCards';
import type { ErrorType } from '../components/ErrorCards';
import { ThreeDScene } from '../components/ThreeDScene';
import type {
  MediaMetadata,
  AdvancedOptionsConfig,
  RecentDownloadItem,
  FormatContainer,
  DownloadProgress,
} from '../types/media';
import { MOCK_MEDIA_METADATA, MOCK_RECENT_DOWNLOADS } from '../mockData';
import {
  analyzeMedia,
  createDownloadJob,
  cancelDownloadJob,
  getDownloadFileUrl,
  subscribeJobProgress,
} from '../services/api';

const STORAGE_KEY = 'truetube_recent_downloads_v1';

interface HomePageProps {
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ addToast }) => {
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

  // Download Preparation & Modal State
  const [isPreparingModalOpen, setIsPreparingModalOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'DOWNLOADING',
    progress_percent: 5,
    speed_str: 'Accelerating...',
    eta_str: '--:--',
    downloaded_bytes: 0,
    total_bytes: 0,
    current_stage: 'Connecting to media source...',
    filename: 'video.mp4',
    file_size_str: '',
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return MOCK_RECENT_DOWNLOADS;
    } catch {
      return MOCK_RECENT_DOWNLOADS;
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

  const handleStartDownload = async (options: {
    format: FormatContainer;
    qualityId: string;
    audioStreamId: string;
    audioOnly: boolean;
  }) => {
    setIsPreparingModalOpen(true);
    setDownloadProgress({
      status: 'DOWNLOADING',
      progress_percent: 5,
      speed_str: 'Accelerating...',
      eta_str: '--:--',
      downloaded_bytes: 0,
      total_bytes: 0,
      current_stage: 'Connecting to media stream...',
      filename: `${media.title.replace(/[\s/]/g, '_')}.${options.audioOnly ? options.format : 'mp4'}`,
      file_size_str: 'Calculating...',
    });

    try {
      if (sseUnsubscribeRef.current) {
        sseUnsubscribeRef.current();
      }

      // 1. Submit download job to high-speed backend
      const jobResp = await createDownloadJob({
        url: media.url,
        format_id: options.qualityId,
        container: options.audioOnly ? options.format : 'mp4',
        audio_stream_id: options.audioStreamId,
        audio_only: options.audioOnly || advancedConfig.audio_only,
        subtitles: advancedConfig.subtitles_enabled ? advancedConfig.subtitle_lang : undefined,
        embed_metadata: advancedConfig.embed_metadata,
        embed_thumbnail: advancedConfig.embed_thumbnail,
      });

      const jobId = jobResp.job_id || (jobResp as any).id;
      setActiveJobId(jobId);

      // 2. Subscribe to real-time high-speed progress updates
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
          // Automatic native Chrome download trigger
          const fileDownloadUrl = getDownloadFileUrl(jobId);
          try {
            const a = document.createElement('a');
            a.href = fileDownloadUrl;
            a.download = finalProgress.filename || `${media.title.replace(/[\s/]/g, '_')}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (e) {
            console.warn('Auto-download trigger notice:', e);
          }

          // Add to recent downloads history
          const newItem: RecentDownloadItem = {
            id: `rec_${Date.now()}`,
            title: media.title,
            thumbnail: media.thumbnail,
            format: (options.audioOnly ? options.format : 'mp4').toUpperCase(),
            quality: options.audioOnly ? 'Audio' : options.qualityId.toUpperCase(),
            file_size: finalProgress.file_size_str || 'Fast Download',
            timestamp: 'Just now',
            status: 'Completed',
            file_url: fileDownloadUrl,
          };

          setRecentDownloads((prev) => [newItem, ...prev.slice(0, 19)]);
          setDownloadProgress((prev) => ({
            ...prev,
            ...finalProgress,
            status: 'COMPLETED',
            progress_percent: 100,
          }));

          addToast('success', 'Download Started in Chrome!', 'Check your browser downloads tray.');

          // Smoothly close modal after user sees the completed checkmark
          setTimeout(() => {
            setIsPreparingModalOpen(false);
          }, 1800);
        },
        (errorMsg) => {
          setIsPreparingModalOpen(false);
          addToast('error', 'Download Failed', errorMsg || 'Stream preparation failed.');
        }
      );

      sseUnsubscribeRef.current = unsubscribe;
    } catch (err: any) {
      console.warn('Job submission error:', err);
      setIsPreparingModalOpen(false);
      addToast('error', 'Download Failed', err.message || 'Could not start Chrome download.');
    }
  };

  const handleCancelPreparation = async () => {
    if (activeJobId) {
      await cancelDownloadJob(activeJobId);
      addToast('info', 'Download cancelled', 'Cleaned up temporary stream files.');
    }
    if (sseUnsubscribeRef.current) {
      sseUnsubscribeRef.current();
      sseUnsubscribeRef.current = null;
    }
    setIsPreparingModalOpen(false);
  };

  return (
    <div className="space-y-12">
      {appState === 'IDLE' && (
        <>
          <div className="relative">
            <ThreeDScene />
            <HeroInput
              url={url}
              onChangeUrl={setUrl}
              onAnalyze={handleAnalyze}
            />
          </div>
          <RecentDownloads
            items={recentDownloads}
            onClearHistory={() => {
              setRecentDownloads([]);
              addToast('info', 'History cleared');
            }}
            onRedownload={handleRedownloadItem}
            onViewAll={() => setAppState('RECENT_DOWNLOADS')}
          />
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
            isDownloading={isPreparingModalOpen}
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

      {/* Real-time High Speed Preparing Modal */}
      <DownloadPreparingModal
        isOpen={isPreparingModalOpen}
        media={media}
        progress={downloadProgress}
        onCancel={handleCancelPreparation}
      />

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
