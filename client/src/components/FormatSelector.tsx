import React, { useState } from 'react';
import {
  Video as VideoIcon,
  Music,
  Download,
  Sliders,
  Copy,
  Check,
  Plus,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { MediaMetadata, FormatContainer } from '../types/media';

interface FormatSelectorProps {
  media: MediaMetadata;
  isDownloading?: boolean;
  initialTab?: 'video' | 'audio';
  initialQualityPreset?: 'best' | '1080p' | '720p' | 'audio_320';
  onStartDownload: (options: {
    format: FormatContainer;
    qualityId: string;
    audioStreamId: string;
    audioOnly: boolean;
  }) => void;
  onOpenAdvancedOptions: () => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  media,
  isDownloading = false,
  initialTab = 'video',
  initialQualityPreset = 'best',
  onStartDownload,
  onOpenAdvancedOptions,
}) => {
  const isAudioOnly =
    (media.available_video_formats && media.available_video_formats.length === 0) ||
    media.formats.length === 0 ||
    media.source_domain.includes('soundcloud');

  const [tab, setTab] = useState<'video' | 'audio'>(() => (isAudioOnly ? 'audio' : initialTab));
  const [selectedFormat, setSelectedFormat] = useState<FormatContainer>('mp4');
  const [selectedQualityId, setSelectedQualityId] = useState<string>(() => {
    if (initialQualityPreset === '1080p') {
      const match = media.formats.find((f) => f.height === 1080 || f.label.includes('1080p'));
      if (match) return match.id;
    } else if (initialQualityPreset === '720p') {
      const match = media.formats.find((f) => f.height === 720 || f.label.includes('720p'));
      if (match) return match.id;
    }
    return media.formats.find((f) => f.is_recommended)?.id || media.formats[0]?.id || 'best_4k';
  });
  const [selectedAudioId, setSelectedAudioId] = useState<string>(
    media.audio_streams.find((a) => a.is_default)?.id || media.audio_streams[0]?.id || 'audio_aac'
  );
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string>('mp3');
  const [copiedLink, setCopiedLink] = useState(false);


  const handleCopyLink = () => {
    navigator.clipboard.writeText(media.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    const chosenFormat = media.formats.find((f) => f.id === selectedQualityId);
    const chosenAudio = media.audio_streams.find((a) => a.id === selectedAudioId);
    const effectiveAudioOnly = isAudioOnly || tab === 'audio';
    onStartDownload({
      format: effectiveAudioOnly ? (selectedAudioFormat as any) : selectedFormat,
      qualityId: chosenFormat?.format_id || selectedQualityId,
      audioStreamId: chosenAudio?.format_id || selectedAudioId,
      audioOnly: effectiveAudioOnly,
    });
  };

  const formatList: { id: FormatContainer; name: string; desc: string; badge?: string }[] = [
    { id: 'mp4', name: 'MP4', desc: 'Universal Video (H.264/AAC) - Highest Compatibility', badge: 'Standard' },
  ];

  const audioFormats = [
    { id: 'mp3', name: 'MP3', desc: 'Universal audio standard (320kbps)' },
    { id: 'm4a', name: 'M4A', desc: 'Apple AAC audio stream' },
    { id: 'wav', name: 'WAV', desc: 'Lossless uncompressed audio' },
    { id: 'opus', name: 'Opus', desc: 'Modern high-efficiency codec' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 space-y-6">
      {/* Media Header Summary Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-card border border-subtle">
        <img
          src={media.thumbnail}
          alt={media.title}
          className="w-24 h-14 sm:w-32 sm:h-18 object-cover rounded-xl border border-subtle flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-primary truncate mb-1">
            {media.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="text-primary font-medium">{media.uploader}</span>
            {media.uploader_verified && (
              <CheckCircle2 className="w-3 h-3 text-accent" />
            )}
            <span>•</span>
            <span className="font-mono">{media.view_count_string}</span>
            <span>•</span>
            <span>{media.upload_date}</span>
          </div>
        </div>
      </div>

      {/* Main Options Container */}
      <div className="bg-surface-card border border-subtle rounded-3xl p-5 sm:p-7">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-surface-well rounded-xl border border-subtle w-fit mb-6">
          {!isAudioOnly && (
            <button
              type="button"
              onClick={() => setTab('video')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                tab === 'video'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              <span>Video</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setTab('audio')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              tab === 'audio'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>{isAudioOnly ? 'Audio Track' : 'Audio'}</span>
          </button>
        </div>

        {/* Tab 1: Video Format & Quality Grid */}
        {tab === 'video' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
            {/* Format Column (4 cols) */}
            <div className="md:col-span-4 space-y-2">
              <label id="format-group-label" className="text-xs font-semibold text-muted block mb-3">
                Format
              </label>
              <div role="radiogroup" aria-labelledby="format-group-label" className="space-y-2">
                {formatList.map((f) => {
                  const isSelected = selectedFormat === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedFormat(f.id)}
                      className={`w-full text-left relative flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isSelected
                          ? 'bg-accent/10 border-accent'
                          : 'bg-surface-well/60 border-subtle hover:border-hover hover:bg-surface-well'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-primary">{f.name}</span>
                          {f.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent/15 text-accent border border-accent/30">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted truncate mt-0.5">{f.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-accent bg-accent'
                            : 'border-subtle bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality Column (5 cols) */}
            <div className="md:col-span-5 space-y-2">
              <label id="quality-group-label" className="text-xs font-semibold text-muted block mb-3">
                Quality
              </label>
              <div role="radiogroup" aria-labelledby="quality-group-label" className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {media.formats.map((q) => {
                  const isSelected = selectedQualityId === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedQualityId(q.id)}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isSelected
                          ? 'bg-accent/10 border-accent'
                          : 'bg-surface-well/60 border-subtle hover:border-hover hover:bg-surface-well'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-accent bg-accent'
                              : 'border-subtle bg-transparent'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-primary">
                              {q.label}
                            </span>
                            {q.is_recommended && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent/15 text-accent border border-accent/30">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted">
                            <span className="font-mono">{q.resolution}</span> • <span className="font-mono">{q.fps}</span>fps
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-medium text-primary">
                        {q.approx_size_str}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Column (3 cols) */}
            <div className="md:col-span-3 space-y-2">
              <label id="audio-group-label" className="text-xs font-semibold text-muted block mb-3">
                Audio track
              </label>
              <div role="radiogroup" aria-labelledby="audio-group-label" className="space-y-2">
                {media.audio_streams.map((a) => {
                  const isSelected = selectedAudioId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedAudioId(a.id)}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isSelected
                          ? 'bg-accent/10 border-accent'
                          : 'bg-surface-well/60 border-subtle hover:border-hover hover:bg-surface-well'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-primary block">
                          Original Audio {a.is_default && '(Default)'}
                        </span>
                        <span className="text-[11px] text-muted font-mono">
                          {a.format} • {a.bitrate}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-accent bg-accent'
                            : 'border-subtle bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Audio Only Mode */
          <div role="radiogroup" aria-label="Audio format selection" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {audioFormats.map((af) => {
              const isSelected = selectedAudioFormat === af.id;
              return (
                <button
                  key={af.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedAudioFormat(af.id)}
                  className={`w-full text-left p-4 rounded-2xl border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'bg-accent/10 border-accent'
                      : 'bg-surface-well/60 border-subtle hover:border-hover hover:bg-surface-well'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-primary">{af.name}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-accent bg-accent'
                          : 'border-subtle bg-transparent'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted">{af.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Advanced Options trigger toggle */}
        <div className="pt-4 border-t border-subtle flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onOpenAdvancedOptions}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-accent hover:text-accent-hover font-medium transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Advanced Options</span>
          </button>
          <span className="text-xs text-faint">Subtitles, metadata, custom naming</span>
        </div>

        {/* Active Direct Download Loading Banner */}
        {isDownloading && (
          <div className="flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs sm:text-sm animate-pulse mb-4">
            <Loader2 className="w-4 h-4 animate-spin text-accent flex-shrink-0" />
            <span>{tab === 'audio' || isAudioOnly ? 'Fetching Audio... Download starting shortly.' : 'Fetching Video... Download starting shortly.'}</span>
          </div>
        )}

        {/* Action Bar (Download CTA, Copy Link, More) */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full sm:flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-white font-semibold text-sm sm:text-base shadow-sm transition-colors cursor-pointer ${
              isDownloading
                ? 'bg-accent/70 cursor-wait'
                : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>{tab === 'audio' || isAudioOnly ? 'Fetching Audio...' : 'Fetching Video...'}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>{tab === 'audio' || isAudioOnly ? 'Download Audio' : 'Download'}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-subtle bg-surface-well hover:border-hover text-xs sm:text-sm font-medium text-muted hover:text-primary transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-status-success" />
                  <span className="text-status-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenAdvancedOptions}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border border-subtle bg-surface-well hover:border-hover text-muted hover:text-primary text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              aria-label="More options"
            >
              <Plus className="w-4 h-4 text-accent" />
              <span>More Options</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
