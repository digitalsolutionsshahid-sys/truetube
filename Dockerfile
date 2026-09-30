FROM python:3.11-slim

# Install system dependencies, FFmpeg, and Node.js for YouTube JS player challenges
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    curl \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY server/requirements.txt ./server/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./server/requirements.txt

# Copy backend application source
COPY server/ ./server/

WORKDIR /app/server

ENV PYTHONUNBUFFERED=1 \
    TRUETUBE_HOST=0.0.0.0 \
    TRUETUBE_PORT=8000 \
    TRUETUBE_DEBUG=false

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
