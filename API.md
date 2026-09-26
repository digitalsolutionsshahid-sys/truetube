# TrueTube API Specification

This document details the RESTful and Server-Sent Events (SSE) interfaces exposed by the TrueTube backend.

- **Base URL**: `http://127.0.0.1:8000`
- **Content Type**: `application/json` (unless otherwise noted)
- **OpenAPI / Swagger Documentation**: Available locally at `http://127.0.0.1:8000/docs`

---

## Table of Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | [`/api/analyze`](#1-post-apianalyze) | Analyzes a media URL and returns formats & metadata |
| `GET` | [`/api/health`](#2-get-apihealth) | System health, active job counts, and FFmpeg detection |
| `POST` | [`/api/jobs`](#3-post-apijobs) | Enqueues an asynchronous download & transcode job |
| `GET` | [`/api/jobs/{id}`](#4-get-apijobsid) | Queries status and telemetry for a specific job |
| `GET` | [`/api/jobs/{id}/progress`](#5-get-apijobsidprogress) | Real-time Server-Sent Events (SSE) progress stream |
| `POST` | [`/api/jobs/{id}/cancel`](#6-post-apijobsidcancel) | Cancels an in-flight job and deletes partial data |
| `GET` | [`/api/jobs/{id}/file`](#7-get-apijobsidfile) | Serves the finalized media file |

---

## 1. POST `/api/analyze`

Validates a media URL, performs security checks (SSRF and port validation), and queries `yt-dlp` for available video/audio streams and format metadata.

### Request Body
```json
{
  "url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ"
}
```

### Response (200 OK)
```json
{
  "id": "aqz-KE-bpKQ",
  "title": "Big Buck Bunny 4K 60fps",
  "url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  "thumbnail": "https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
  "duration": 634,
  "duration_str": "10:34",
  "uploader": "Blender Foundation",
  "view_count": 14205000,
  "view_count_str": "14.2M views",
  "formats": [
    {
      "format_id": "313",
      "ext": "mp4",
      "resolution": "2160p (4K)",
      "width": 3840,
      "height": 2160,
      "fps": 60,
      "filesize_approx": 343932928,
      "filesize_str": "328 MB",
      "has_video": true,
      "has_audio": false,
      "is_recommended": false,
      "note": "60fps Ultra HD"
    },
    {
      "format_id": "137",
      "ext": "mp4",
      "resolution": "1080p (Full HD)",
      "width": 1920,
      "height": 1080,
      "fps": 60,
      "filesize_approx": 142606336,
      "filesize_str": "136 MB",
      "has_video": true,
      "has_audio": false,
      "is_recommended": true,
      "note": "60fps Full HD"
    }
  ],
  "audio_streams": [
    {
      "format_id": "140",
      "ext": "m4a",
      "abr": 128,
      "filesize_str": "9.8 MB",
      "language": "Original Audio",
      "is_default": true
    }
  ]
}
```

### Error Responses
- `400 Bad Request`: Invalid URL format, unsupported media host, or SSRF violation.
```json
{
  "detail": {
    "error_code": "SSRF_BLOCKED",
    "message": "Access to private or loopback network addresses is prohibited."
  }
}
```
- `429 Too Many Requests`: Analysis concurrency limit exceeded.

---

## 2. GET `/api/health`

Returns server diagnostic status, worker availability, and FFmpeg capability.

### Response (200 OK)
```json
{
  "status": "healthy",
  "app_name": "TrueTube API",
  "version": "1.0.0",
  "ffmpeg_available": true,
  "ffmpeg_path": "C:\\Program Files\\FFmpeg\\bin\\ffmpeg.exe",
  "active_jobs": 1,
  "max_concurrent_jobs": 3,
  "max_concurrent_analyses": 5
}
```

---

## 3. POST `/api/jobs`

Creates and queues a new download job. The job executes asynchronously in a background threadpool.

### Request Body
```json
{
  "url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  "format_id": "137",
  "format_type": "video",
  "resolution": "1080p",
  "container": "mp4",
  "audio_stream_id": "140",
  "audio_format": "mp3",
  "advanced_options": {
    "audio_only": false,
    "embed_subtitles": true,
    "subtitle_language": "en",
    "embed_metadata": true,
    "embed_thumbnail": true,
    "filename_template": "%(title)s.%(ext)s"
  }
}
```

### Response (200 OK)
```json
{
  "job_id": "8c0f20bb-3d44-4861-a5ea-5d1dcf6f112a",
  "status": "QUEUED",
  "progress_percent": 0.0,
  "speed_str": null,
  "eta_str": null,
  "downloaded_bytes": 0,
  "total_bytes": null,
  "current_stage": "Enqueued",
  "filename": null,
  "file_size_str": null,
  "error": null,
  "error_code": null,
  "created_at": 1743058800.12,
  "updated_at": 1743058800.12
}
```

---

## 4. GET `/api/jobs/{id}`

Returns the current snapshot of a job's status and telemetry.

### Path Parameters
- `id` (string, required): UUID identifier of the job.

### Response (200 OK)
```json
{
  "job_id": "8c0f20bb-3d44-4861-a5ea-5d1dcf6f112a",
  "status": "DOWNLOADING",
  "progress_percent": 68.4,
  "speed_str": "14.2 MB/s",
  "eta_str": "00:08",
  "downloaded_bytes": 97517568,
  "total_bytes": 142606336,
  "current_stage": "Downloading video stream (68%)",
  "filename": "Big Buck Bunny 4K 60fps.mp4",
  "file_size_str": "136 MB",
  "error": null,
  "error_code": null,
  "created_at": 1743058800.12,
  "updated_at": 1743058812.45
}
```

---

## 5. GET `/api/jobs/{id}/progress`

Opens a Server-Sent Events (SSE) connection streaming real-time status and progress updates.

- **Headers**: `Content-Type: text/event-stream`, `Cache-Control: no-cache`
- **Format**: Standard SSE format `data: <JSON>\n\n`

### Stream Payload Example
```http
data: {"job_id":"8c0f20bb-3d44-4861-a5ea-5d1dcf6f112a","status":"DOWNLOADING","progress_percent":84.2,"speed_str":"15.8 MB/s","eta_str":"00:03","downloaded_bytes":120074528,"total_bytes":142606336,"current_stage":"Downloading video stream (84%)","filename":null,"file_size_str":null,"error":null,"error_code":null}

data: {"job_id":"8c0f20bb-3d44-4861-a5ea-5d1dcf6f112a","status":"PROCESSING","progress_percent":98.0,"speed_str":null,"eta_str":null,"downloaded_bytes":142606336,"total_bytes":142606336,"current_stage":"Merging audio & video streams via FFmpeg...","filename":null,"file_size_str":null,"error":null,"error_code":null}

data: {"job_id":"8c0f20bb-3d44-4861-a5ea-5d1dcf6f112a","status":"COMPLETED","progress_percent":100.0,"speed_str":null,"eta_str":null,"downloaded_bytes":142606336,"total_bytes":142606336,"current_stage":"Completed","filename":"Big Buck Bunny 4K 60fps.mp4","file_size_str":"136.2 MB","error":null,"error_code":null}
```

---

## 6. POST `/api/jobs/{id}/cancel`

Signals immediate cancellation of an in-flight job. The download worker will terminate and delete all partial files.

### Response (200 OK)
```json
{
  "job_id": "8c0f20bb-3d44-4861-a5ea-5d1dcf6f112a",
  "status": "CANCELLED"
}
```

---

## 7. GET `/api/jobs/{id}/file`

Streams the completed media file to the user's browser for download.

- **Headers**:
  - `Content-Type`: `video/mp4`, `audio/mpeg`, etc.
  - `Content-Disposition`: `attachment; filename="..."; filename*=utf-8''...` (RFC 5987 Unicode safe)

### Response Codes
- `200 OK`: File stream.
- `400 Bad Request`: Job has not reached `COMPLETED` state.
- `404 Not Found`: Job does not exist or file expired and was purged by cleanup worker.

---

## Error Codes Reference

| Error Code | HTTP Status | Description |
|---|---|---|
| `INVALID_URL` | 400 | The supplied string is not a valid HTTP/HTTPS URL |
| `SSRF_BLOCKED` | 400 | URL points to a loopback, private, or prohibited IP range |
| `UNSUPPORTED_SOURCE` | 400 | The domain is not supported by yt-dlp |
| `CONCURRENCY_EXCEEDED` | 429 | System is currently at maximum concurrent job capacity |
| `JOB_NOT_FOUND` | 404 | The requested job ID does not exist in memory |
| `JOB_NOT_COMPLETED` | 400 | Attempted to download file before pipeline finished |
| `FILE_EXPIRED` | 404 | The file exceeded TTL and was automatically purged |
| `DOWNLOAD_ERROR` | 500 | yt-dlp or FFmpeg encountered an unrecoverable processing error |
