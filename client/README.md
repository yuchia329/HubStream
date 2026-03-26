# Facetime Client (Next.js)

The client application is a modern, responsive WebRTC frontend built with **Next.js 15**, **React**, and **TypeScript**. It provides the user interface for both creating and joining video conference rooms.

## Architecture

The client operates in two distinct mathematical topologies depending on the user's selection:

1. **SFU Mode (Mediasoup)**: The client connects to the Node.js backend to securely transmit its local media stream directly to the server. The server then relays this stream to all other participants, dramatically saving local bandwidth and CPU for large meetings.
2. **P2P Mesh Mode**: The client uses the server *only* for WebSocket signaling. Once peers discover each other, the client establishes direct RTCPeerConnections with every other user in the room, creating a decentralized mesh network.

## Key Features

- **Dynamic Room Routing**: Uses Next.js dynamic routes (`/room/[id]`) to instantiate conference rooms on the fly.
- **Smart Video Layout Engine**: The UI dynamically calculating grid vs. active-speaker layouts to optimize mobile responsiveness.
- **Background Noise Suppression**: Enforces echo cancellation and noise suppression natively on the local media stream before broadcast.
- **Reverse Proxy**: Utilizes `next.config.ts` rewrites to securely tunnel WSS (WebSocket Secure) traffic directly through port 80/443, effortlessly bypassing strict Cloudflare firewall limitations.

## Local Development

You can run the frontend independently, assuming the backend is running elsewhere, or you can use the root `start-local.sh` script to boot both simultaneously.

```bash
# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

### Environment Variables

The client reads the following explicitly passed variables (optionally loaded from `.env.local` or injected via Docker `build-arg`s):

- `NEXT_PUBLIC_WS_URL`: The absolute WebSocket URL for the signaling server (e.g., `wss://app.example.com/ws`). If omitted, the client intelligently falls back to proxying `/ws` over its own domain.
