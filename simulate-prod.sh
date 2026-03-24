#!/bin/bash

# ==============================================================================
# Facetime - Simulate Production Deployment Locally
# ==============================================================================
# This script precisely mimics the GitHub Actions workflow (.github/workflows/deploy.yml)
# to build and run the application locally exactly as it happens in production.
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  Starting Facetime Local Production Simulation       ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Stop the regular local dev environment if it's running
echo -e "${YELLOW}[1/4] Stopping any existing local development processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:4000 | xargs kill -9 2>/dev/null
killall ngrok 2>/dev/null
docker compose down 2>/dev/null

IMAGE_TAG="local-prod-sim"

# Build the Server Image (Mimicking the CI Server Build)
echo -e "${YELLOW}[2/4] Building Server Docker Image (linux/arm64)...${NC}"
docker buildx build --platform linux/arm64 \
  -t yuchia329/facetime-server:1 \
  ./server --load

if [ $? -ne 0 ]; then
  echo -e "${RED}Server build failed! Aborting.${NC}"
  exit 1
fi

# Build the Client Image (Mimicking the CI Client Build with NEXT_PUBLIC_WS_URL)
echo -e "${YELLOW}[3/4] Building Client Docker Image (linux/arm64)...${NC}"
# In CI, we use wss://app.yuchia.dev:4000
# For local simulation (so it works over ngrok), we OMIT the URL.
# The Next.js frontend will use '/ws' and proxy it directly.
docker buildx build --platform linux/arm64 \
  -t yuchia329/facetime-client:1 \
  ./client --load

if [ $? -ne 0 ]; then
  echo -e "${RED}Client build failed! Aborting.${NC}"
  exit 1
fi

# Start the Docker Compose Environment
echo -e "${YELLOW}[4/4] Starting the simulated production environment...${NC}"

# We strictly use 127.0.0.1 for Docker Mac simulation because Docker's UDP 
# port forwarding often drops packets when bound to external LAN IPs.
LOCAL_IP="127.0.0.1"
echo "Using Local IP for Docker WebRTC: $LOCAL_IP"

# We use docker-compose.yml instead of docker-compose.prod.yml for local simulation
# because Docker Desktop blocks `network_mode: host` from exposing ports to the Mac localhost.
MEDIASOUP_ANNOUNCED_IP=$LOCAL_IP docker compose up -d --force-recreate

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}✓ Production simulation is running!${NC}"
echo -e "👉 Application is available at: ${GREEN}http://localhost:3000${NC}"
echo -e "👉 Backend is running at:       ${GREEN}http://localhost:4000${NC}"
echo -e ""
echo -e "To view logs, run: ${YELLOW}docker compose logs -f${NC}"
echo -e "To stop, run:      ${YELLOW}docker compose down${NC}"
echo -e "${BLUE}======================================================${NC}"
