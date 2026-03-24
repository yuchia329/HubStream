# ── Builder stage ─────────────────────────────────────────────
FROM node:22 AS builder

# Install Python and build-essential for mediasoup native addon compilation
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Bypass Debian 12's restriction on global pip installations
ENV PIP_BREAK_SYSTEM_PACKAGES=1
ENV MEDIASOUP_SKIP_BINARY_DOWNLOAD=1

WORKDIR /app

# Install ALL dependencies (needs devDependencies for TS compilation)
# This will compile the mediasoup C++ worker from source natively for ARM64.
COPY package*.json ./
RUN npm ci

# Copy source and build TypeScript to /dist
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:22 AS runner

WORKDIR /app

# Copy the pruned, production-ready node_modules and the compiled dist folder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000
# Expose UDP range for mediasoup RTP
EXPOSE 40000-49999/udp

CMD ["node", "dist/index.js"]