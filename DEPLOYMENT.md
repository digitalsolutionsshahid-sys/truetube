# TrueTube Production Deployment Guide

This guide covers deploying TrueTube into production environments using Docker, Nginx, or bare-metal systemd services.

---

## 1. Production Architecture

In a production environment, the React frontend is compiled to static HTML/JS/CSS assets and served directly via a high-performance reverse proxy (e.g. Nginx or Caddy). The reverse proxy forwards `/api/*` requests to the Uvicorn ASGI server running FastAPI.

```
                    ┌─────────────────────────┐
                    │     Internet Traffic    │
                    └────────────┬────────────┘
                                 │
                         HTTPS (Port 443)
                                 │
                    ┌────────────▼────────────┐
                    │    Reverse Proxy (Nginx)│
                    │   • SSL Termination     │
                    │   • Static File Cache   │
                    │   • SSE Stream Routing  │
                    └──────┬───────────┬──────┘
             Static Assets │           │ /api/* (Proxy Pass)
                           │           │ (proxy_buffering off)
            ┌──────────────▼───┐   ┌───▼─────────────────────┐
            │  client/dist/    │   │  FastAPI (Uvicorn)      │
            │  (HTML/CSS/JS)   │   │  • yt-dlp & FFmpeg      │
            └──────────────────┘   │  • Port 8000 (Internal) │
                                   └───────────┬─────────────┘
                                               │
                                   ┌───────────▼─────────────┐
                                   │ Ephemeral Temp Storage  │
                                   │ /storage/temp (NVMe)    │
                                   └─────────────────────────┘
```

---

## 2. Docker Deployment

### 2.1 Backend Dockerfile
Create `server/Dockerfile`:

```dockerfile
# Multi-stage production build for TrueTube API
FROM python:3.12-slim-bookworm AS base

# Install system dependencies and FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged application user
RUN useradd -m -u 1001 truetube

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY app/ ./app/

# Create ephemeral storage directory and assign ownership
RUN mkdir -p /app/storage/temp && chown -R truetube:truetube /app

USER truetube

ENV PYTHONUNBUFFERED=1 \
    TRUETUBE_HOST=0.0.0.0 \
    TRUETUBE_PORT=8000 \
    TRUETUBE_DEBUG=False \
    TRUETUBE_TEMP_STORAGE_PATH=/app/storage/temp

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
```

### 2.2 Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - TRUETUBE_HOST=0.0.0.0
      - TRUETUBE_PORT=8000
      - TRUETUBE_ALLOWED_ORIGINS=["https://truetube.yourdomain.com"]
      - TRUETUBE_MAX_CONCURRENT_JOBS=4
      - TRUETUBE_FILE_EXPIRATION_SECONDS=3600
    volumes:
      - truetube_temp:/app/storage/temp
    ports:
      - "127.0.0.1:8000:8000"

  frontend:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./client/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend

volumes:
  truetube_temp:
```

---

## 3. Reverse Proxy Configuration (Nginx)

When serving Server-Sent Events (SSE) and large media downloads, two Nginx directives are critical:
1. `proxy_buffering off;` — Prevents Nginx from buffering SSE progress packets.
2. `proxy_read_timeout 600s;` — Allows long-running media conversions and 4K merges to execute without premature gateway timeouts.

### Example `nginx.conf`:

```nginx
server {
    listen 80;
    server_name truetube.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name truetube.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/truetube.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/truetube.yourdomain.com/privkey.pem;

    # Static frontend assets
    root /var/www/truetube/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API and SSE proxying
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable buffering for live Server-Sent Events (SSE)
        proxy_buffering off;
        proxy_cache off;

        # Extended timeouts for large media operations
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

---

## 4. Systemd Service Deployment (Bare Metal / VM)

If deploying directly to an Ubuntu or Debian server:

### 4.1 Create `/etc/systemd/system/truetube.service`
```ini
[Unit]
Description=TrueTube Backend API
After=network.target

[Service]
Type=simple
User=truetube
Group=truetube
WorkingDirectory=/opt/truetube/server
EnvironmentFile=/opt/truetube/server/.env
ExecStart=/opt/truetube/server/.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable truetube
sudo systemctl start truetube
sudo systemctl status truetube
```

---

## 5. Hardware Sizing & Capacity Planning

| Metric | Recommendation | Notes |
|---|---|---|
| **CPU** | 4 - 8 vCPUs | Video downloading is network-bound, but stream merging and audio transcoding utilize multi-threaded FFmpeg. |
| **RAM** | 4 GB - 8 GB | Base application requires ~250MB. Budget ~200MB memory headroom per concurrent job. |
| **Disk** | Fast NVMe SSD | High disk I/O occurs when FFmpeg merges separate high-bitrate 4K video and audio tracks. |
| **Bandwidth** | 1 Gbps symmetric | High outbound and inbound bandwidth allows rapid 4K downloads and fast client downloads. |

---

## 6. Production Security Checklist

- [x] Set `TRUETUBE_DEBUG=False`.
- [x] Configure `TRUETUBE_ALLOWED_ORIGINS` to only permit your production domain.
- [x] Ensure `TRUETUBE_ALLOW_PRIVATE_IPS=False` (default) to keep SSRF protection active.
- [x] Configure `TRUETUBE_MAX_CONCURRENT_JOBS` (recommended: 3-5 per host).
- [x] Place an Nginx or Cloudflare reverse proxy with rate limiting in front of `/api/jobs` and `/api/analyze`.
- [x] Keep `yt-dlp` regularly updated (`pip install --upgrade yt-dlp`) to stay current with upstream video platform extractor changes.
