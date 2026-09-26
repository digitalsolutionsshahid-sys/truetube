export type FormatContainer = 'mp4' | 'webm' | 'mkv' | 'avi';
export type AudioContainer = 'mp3' | 'm4a' | 'wav' | 'aac' | 'opus';

export interface FormatOption {
  id: string;
  format_id: string;
  label: string; // e.g. "Best (4K)", "1080p"
  resolution: string; // e.g. "3840x2160"
  height: number;
  fps: number;
  container: FormatContainer;
  codec: string; // e.g. "H.264", "VP9"
  approx_size_str: string; // e.g. "~1.2 GB"
  is_recommended?: boolean;
}

export interface AudioStreamOption {
  id: string;
  format: 'AAC' | 'Opus' | 'MP3';
  bitrate: string; // e.g. "128 kbps", "320 kbps"
  is_default?: boolean;
}

export interface MediaMetadata {
  url: string;
  title: string;
  thumbnail: string;
  uploader: string;
  uploader_verified: boolean;
  duration: number; // in seconds
  duration_string: string; // e.g. "03:24"
  view_count: number;
  view_count_string: string; // e.g. "1.2M views"
  upload_date: string; // e.g. "Apr 12, 2024"
  source_domain: string; // e.g. "youtube.com"
  approx_size_str: string; // e.g. "326 MB"
  available_video_formats: string[]; // ["MP4", "WebM", "MKV"]
  available_audio_formats: string[]; // ["MP3", "M4A", "AAC"]
  subtitles: string[]; // ["English", "Spanish", "French", "+3"]
  formats: FormatOption[];
  audio_streams: AudioStreamOption[];
}

export type JobStatus =
  | 'IDLE'
  | 'ANALYZING'
  | 'QUEUED'
  | 'DOWNLOADING'
  | 'PROCESSING'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface DownloadProgress {
  job_id?: string;
  status: JobStatus;
  progress_percent: number;
  speed_str: string;
  eta_str: string;
  downloaded_bytes: number;
  total_bytes: number;
  current_stage: string;
  filename: string;
  file_size_str: string;
  download_url?: string;
  error?: string;
  error_code?: 'INVALID_URL' | 'UNSUPPORTED_SOURCE' | 'NETWORK_ERROR' | 'DOWNLOAD_FAILED';
}

export interface AdvancedOptionsConfig {
  audio_only: boolean;
  subtitles_enabled?: boolean;
  subtitle_lang: string;
  embed_metadata: boolean;
  embed_thumbnail: boolean;
  filename_template: string;
  quality_preference: 'best' | 'high' | 'medium' | 'low';
  container: FormatContainer;
}

export interface RecentDownloadItem {
  id: string;
  title: string;
  thumbnail: string;
  format: string; // e.g. "MP4"
  quality: string; // e.g. "4K"
  file_size: string; // e.g. "1.2 GB"
  timestamp: string; // e.g. "Apr 12, 2024"
  status: 'Completed' | 'Failed';
  file_url?: string;
}
