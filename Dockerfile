# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# ─── Stage 2: builder ─────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN npm run build

# ─── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# System dependencies: ffmpeg, chromium, python3 + pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    fonts-liberation \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Python tools (yt-dlp for downloads, demucs for voice isolation)
RUN pip3 install --no-cache-dir yt-dlp demucs --break-system-packages

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone Next.js output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Persistent data directories
RUN mkdir -p data \
    public/audio/converted \
    public/videos/converted \
    public/converted \
    public/images \
    public/thumbnails \
    && chown -R nextjs:nodejs data public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
