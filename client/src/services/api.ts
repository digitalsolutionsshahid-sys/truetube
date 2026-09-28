import type {
  MediaMetadata,
  DownloadProgress,
  FormatContainer,
} from '../types/media';

const API_BASE = '/api';

export interface CreateJobPayload {
  url: string;
  format_id?: string;
  resolution?: string;
  container: FormatContainer;
  audio_stream_id?: string;
  audio_only: boolean;
  subtitles?: string;
  embed_metadata?: boolean;
  embed_thumbnail?: boolean;
  filename_template?: string;
  quality_preference?: 'best' | 'high' | 'medium' | 'low';
}

export async function checkServerHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error('Server health check failed');
  }
  return res.json();
}

export async function analyzeMedia(url: string): Promise<MediaMetadata> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    let errorDetail = 'Could not analyze media.';
    let errorCode: any = 'DOWNLOAD_FAILED';
    try {
      const data = await res.json();
      if (data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : data.detail.error || errorDetail;
        errorCode = data.detail.code || errorCode;
      }
    } catch {
      // Fallback
    }
    const err: any = new Error(errorDetail);
    err.code = errorCode;
    throw err;
  }

  return res.json();
}

export async function createDownloadJob(payload: CreateJobPayload): Promise<DownloadProgress> {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = 'Failed to start download job.';
    let errorCode: any = 'DOWNLOAD_FAILED';
    try {
      const data = await res.json();
      if (data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : data.detail.error || errorDetail;
        errorCode = data.detail.code || errorCode;
      }
    } catch {
      // Fallback
    }
    const err: any = new Error(errorDetail);
    err.code = errorCode;
    throw err;
  }

  return res.json();
}

export async function getJobStatus(jobId: string): Promise<DownloadProgress> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error(`Job ${jobId} not found`);
  }
  return res.json();
}

export async function cancelDownloadJob(jobId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function getDownloadFileUrl(jobId: string): string {
  return `${API_BASE}/jobs/${jobId}/file`;
}

export function getDirectDownloadUrl(options: {
  url: string;
  format_id?: string;
  container: string;
  audio_stream_id?: string;
  audio_only?: boolean;
  subtitles?: string;
  embed_metadata?: boolean;
  embed_thumbnail?: boolean;
  token?: string;
}): string {
  const params = new URLSearchParams();
  params.set('url', options.url);
  if (options.format_id) params.set('format_id', options.format_id);
  if (options.container) params.set('container', options.container);
  if (options.audio_stream_id) params.set('audio_stream_id', options.audio_stream_id);
  if (options.audio_only) params.set('audio_only', 'true');
  if (options.subtitles) params.set('subtitles', options.subtitles);
  if (options.embed_metadata !== undefined) params.set('embed_metadata', String(options.embed_metadata));
  if (options.embed_thumbnail !== undefined) params.set('embed_thumbnail', String(options.embed_thumbnail));
  if (options.token) params.set('token', options.token);
  return `${API_BASE}/download/direct?${params.toString()}`;
}

export function subscribeJobProgress(
  jobId: string,
  onProgress: (progress: DownloadProgress) => void,
  onComplete: (progress: DownloadProgress) => void,
  onError: (errorMsg: string) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/jobs/${jobId}/progress`);
  let isClosed = false;
  let pollingInterval: ReturnType<typeof setInterval> | null = null;
  let retryCount = 0;

  const close = () => {
    if (!isClosed) {
      isClosed = true;
      if (pollingInterval) clearInterval(pollingInterval);
      eventSource.close();
    }
  };

  eventSource.onmessage = (event) => {
    try {
      const data: DownloadProgress = JSON.parse(event.data);
      onProgress(data);
      retryCount = 0;

      if (data.status === 'COMPLETED') {
        close();
        onComplete(data);
      } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        close();
        onError(data.error || `Download ${data.status.toLowerCase()}`);
      }
    } catch (e) {
      console.error('Error parsing SSE event data:', e);
    }
  };

  const startFallbackPolling = () => {
    if (pollingInterval || isClosed) return;
    pollingInterval = setInterval(async () => {
      if (isClosed) {
        if (pollingInterval) clearInterval(pollingInterval);
        return;
      }
      try {
        const data = await getJobStatus(jobId);
        onProgress(data);
        if (data.status === 'COMPLETED') {
          close();
          onComplete(data);
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          close();
          onError(data.error || `Download ${data.status.toLowerCase()}`);
        }
      } catch {
        retryCount++;
        if (retryCount >= 5 && !isClosed) {
          close();
          onError('Lost real-time connection to server.');
        }
      }
    }, 1500);
  };

  eventSource.onerror = () => {
    if (isClosed) return;

    // Check status immediately and fall back to polling if job is still active
    getJobStatus(jobId)
      .then((data) => {
        onProgress(data);
        if (data.status === 'COMPLETED') {
          close();
          onComplete(data);
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          close();
          onError(data.error || 'Connection closed');
        } else {
          startFallbackPolling();
        }
      })
      .catch(() => {
        retryCount++;
        if (retryCount < 3) {
          startFallbackPolling();
        } else if (!isClosed) {
          close();
          onError('Lost real-time connection to server.');
        }
      });
  };

  return () => {
    close();
  };
}
