import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeroInput } from '../components/HeroInput';
import { AnalyzingState } from '../components/AnalyzingState';
import { MediaPreview } from '../components/MediaPreview';
import { FormatSelector } from '../components/FormatSelector';
import { DownloadingState } from '../components/DownloadingState';
import { CompletedState } from '../components/CompletedState';
import { AdvancedOptionsDrawer } from '../components/AdvancedOptionsDrawer';
import { RecentDownloads } from '../components/RecentDownloads';
import { ErrorCard } from '../components/ErrorCards';
import type { ErrorType } from '../components/ErrorCards';
import { ThreeDScene } from '../components/ThreeDScene';
import type {
  MediaMetadata,
  DownloadProgress,
  AdvancedOptionsConfig,
  RecentDownloadItem,
  FormatContainer,
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
    | 'DOWNLOADING'
    | 'COMPLETED'
    | 'RECENT_DOWNLOADS'
    | 'ERROR'
  >('IDLE');

  // Media & Job State
  const [media, setMedia] = useState<MediaMetadata>(MOCK_MEDIA_METADATA);
  const [currentJobId, setCurrentJobId] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'DOWNLOADING',
    progress_percent: 62,
    speed_str: '7.4 MB/s',
    eta_str: '00:32',
    downloaded_bytes: 760000000,
    total_bytes: 1200000000,
    current_stage: 'Downloading...',
    filename: 'video_download.mp4',
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
        addToast('info', 'Downloading media', item.title);
      } else {
        addToast('warning', 'File expired', 'Please re-analyze the video to download again.');
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
      addToast('info', 'Download queued', 'Connecting to media source...');

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
          const fileDownloadUrl = getDownloadFileUrl(jobId);

          // Automatically trigger download directly into Chrome
          try {
            const a = document.createElement('a');
            a.href = fileDownloadUrl;
            a.download = finalProgress.filename || `${media.title.replace(/[\s/]/g, '_')}.${options.format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (e) {
            console.warn('Auto-download trigger notice:', e);
          }

          // Add to recent downloads
          const newItem: RecentDownloadItem = {
            id: `rec_${Date.now()}`,
            title: media.title,
            thumbnail: media.thumbnail,
            format: options.format.toUpperCase(),
            quality: options.audioOnly ? 'Audio' : options.qualityId.toUpperCase(),
            file_size: finalProgress.file_size_str || 'Downloaded',
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
          setAppState('COMPLETED');
          addToast('success', 'Download Complete!', 'Saved directly to your browser.');
        },
        (errorMsg) => {
          setErrorType('DOWNLOAD_FAILED');
          setErrorMessage(errorMsg || 'Download interrupted or failed.');
          setAppState('ERROR');
          addToast('error', 'Download interrupted', errorMsg);
        }
      );

      sseUnsubscribeRef.current = unsubscribe;
    } catch (err: any) {
      console.warn('Real API job creation failed:', err);
      setErrorType(err.code || 'DOWNLOAD_FAILED');
      setErrorMessage(err.message || 'Failed to submit download job to server.');
      setAppState('ERROR');
      addToast('error', 'Job submission failed', err.message);
    }
  };

  const handleCancelDownload = async () => {
    if (currentJobId) {
      await cancelDownloadJob(currentJobId);
      addToast('info', 'Download cancelled', 'Cleaned up temporary stream files.');
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
      addToast('success', 'Saving file...', downloadProgress.filename);
    } else {
      addToast('info', 'File ready', 'Download triggered.');
    }
  };

  const handleDownloadAnother = () => {
    setUrl('');
    setAppState('IDLE');
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
          <MediaPreview media={media} />

          <FormatSelector
            key={media.url}
            media={media}
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
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Full Download History</h2>
            <button
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
