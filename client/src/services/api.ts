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

export function subscribeJobProgress(
  jobId: string,
  onProgress: (progress: DownloadProgress) => void,
  onComplete: (progress: DownloadProgress) => void,
  onError: (errorMsg: string) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/jobs/${jobId}/progress`);

  eventSource.onmessage = (event) => {
    try {
      const data: DownloadProgress = JSON.parse(event.data);
      onProgress(data);

      if (data.status === 'COMPLETED') {
        eventSource.close();
        onComplete(data);
      } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        eventSource.close();
        onError(data.error || `Download ${data.status.toLowerCase()}`);
      }
    } catch (e) {
      console.error('Error parsing SSE event data:', e);
    }
  };

  eventSource.onerror = () => {
    // If connection drops, fallback to polling single status
    getJobStatus(jobId)
      .then((data) => {
        onProgress(data);
        if (data.status === 'COMPLETED') {
          eventSource.close();
          onComplete(data);
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          eventSource.close();
          onError(data.error || 'Connection closed');
        }
      })
      .catch(() => {
        eventSource.close();
        onError('Lost real-time connection to server.');
      });
  };

  return () => {
    eventSource.close();
  };
}
