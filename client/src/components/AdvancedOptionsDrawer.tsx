import React from 'react';
import { X, Sliders, Check } from 'lucide-react';
import type { AdvancedOptionsConfig, FormatContainer } from '../types/media';

interface AdvancedOptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdvancedOptionsConfig;
  onChangeConfig: (newConfig: AdvancedOptionsConfig) => void;
  availableSubtitles?: string[];
}

export const AdvancedOptionsDrawer: React.FC<AdvancedOptionsDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  availableSubtitles = ['None', 'English', 'Spanish', 'French'],
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Advanced Options"
        className="relative w-full max-w-md bg-surface-card border-l border-subtle shadow-2xl h-full flex flex-col justify-between z-10 overflow-y-auto"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-subtle">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center border border-accent/30">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-primary">Advanced Options</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-well transition-colors cursor-pointer"
              aria-label="Close advanced options"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Controls */}
          <div className="p-6 space-y-6">
            {/* Audio Only toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-primary block">Audio Only</span>
                <span className="text-xs text-muted">Extract audio track only</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.audio_only}
                aria-label="Toggle Audio Only"
                onClick={() => onChangeConfig({ ...config, audio_only: !config.audio_only })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                  config.audio_only ? 'bg-accent' : 'bg-surface-well border border-subtle'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.audio_only ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Subtitle language dropdown with toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-sm font-semibold text-primary block mb-1">Subtitle</span>
                <select
                  value={config.subtitle_lang}
                  onChange={(e) => onChangeConfig({ ...config, subtitle_lang: e.target.value })}
                  disabled={config.subtitles_enabled === false}
                  className="w-full bg-surface-well border border-subtle rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent capitalize disabled:opacity-40"
                  aria-label="Subtitle language"
                >
                  {availableSubtitles.filter((s) => s.toLowerCase() !== 'none').map((sub) => (
                    <option key={sub} value={sub.toLowerCase()}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.subtitles_enabled !== false}
                  onClick={() =>
                    onChangeConfig({
                      ...config,
                      subtitles_enabled: config.subtitles_enabled === false ? true : false,
                    })
                  }
                  aria-label="Toggle Subtitles"
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                    config.subtitles_enabled !== false ? 'bg-accent' : 'bg-surface-well border border-subtle'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      config.subtitles_enabled !== false ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Embed Metadata toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-primary block">Metadata</span>
                <span className="text-xs text-muted">Embed artist, title and chapter tags</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.embed_metadata}
                aria-label="Toggle Embed Metadata"
                onClick={() =>
                  onChangeConfig({ ...config, embed_metadata: !config.embed_metadata })
                }
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                  config.embed_metadata ? 'bg-accent' : 'bg-surface-well border border-subtle'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.embed_metadata ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Embed Thumbnail toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-primary block">Thumbnail</span>
                <span className="text-xs text-muted">Embed high-res cover art in file</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.embed_thumbnail}
                aria-label="Toggle Embed Thumbnail"
                onClick={() =>
                  onChangeConfig({ ...config, embed_thumbnail: !config.embed_thumbnail })
                }
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                  config.embed_thumbnail ? 'bg-accent' : 'bg-surface-well border border-subtle'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.embed_thumbnail ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Filename Template */}
            <div>
              <label className="text-sm font-semibold text-primary block mb-1.5">
                Filename Template
              </label>
              <input
                type="text"
                value={config.filename_template}
                onChange={(e) =>
                  onChangeConfig({ ...config, filename_template: e.target.value })
                }
                placeholder="%(title)s.%(ext)s"
                className="w-full bg-surface-well border border-subtle rounded-xl px-3.5 py-2.5 text-sm text-primary font-mono focus:outline-none focus:border-accent"
              />
              <span className="text-[11px] text-faint mt-1 block">
                yt-dlp template: %(title)s, %(id)s, %(uploader)s
              </span>
            </div>

            {/* Quality Preference */}
            <div>
              <label className="text-sm font-semibold text-primary block mb-1.5">
                Quality Preference
              </label>
              <select
                value={config.quality_preference}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    quality_preference: e.target.value as any,
                  })
                }
                className="w-full bg-surface-well border border-subtle rounded-xl px-3.5 py-2.5 text-sm text-primary focus:outline-none focus:border-accent capitalize"
              >
                <option value="best">Best Available</option>
                <option value="high">High (1080p+)</option>
                <option value="medium">Medium (720p)</option>
                <option value="low">Data Saver (360p-480p)</option>
              </select>
            </div>

            {/* Preferred Container */}
            <div>
              <label className="text-sm font-semibold text-primary block mb-1.5">
                Container
              </label>
              <select
                value={config.container}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    container: e.target.value as FormatContainer,
                  })
                }
                className="w-full bg-surface-well border border-subtle rounded-xl px-3.5 py-2.5 text-sm text-primary focus:outline-none focus:border-accent"
              >
                <option value="mp4">MP4 (Universal Standard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
